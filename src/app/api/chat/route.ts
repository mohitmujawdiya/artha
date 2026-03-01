import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callClaudeWithHistory } from "@/lib/claude";
import { getCachedResponse } from "@/lib/cached-responses";
import { getDbUser, getMemoryFacts, getUserTransactions, getChatMessages, saveChatMessage } from "@/db/queries";
import { extractAndStoreMemory } from "@/lib/memory-extractor";
import { detectPatterns } from "@/lib/analysis";
import { sanitizeForPrompt } from "@/lib/auth-helpers";
import { rateLimit } from "@/lib/rate-limit";
import type { Transaction } from "@/types";

async function buildSystemPrompt(userId: string | null, fallbackName: string) {
  // If no userId (unauthenticated), use hardcoded Maya context
  if (!userId) return getStaticPrompt(fallbackName);

  try {
    const [user, memoryFacts, dbTransactions] = await Promise.all([
      getDbUser(userId),
      getMemoryFacts(userId),
      getUserTransactions(userId),
    ]);

    if (!user) return getStaticPrompt(fallbackName);

    const name = sanitizeForPrompt(user.name || fallbackName, 50);
    const mappedTxns: Transaction[] = dbTransactions.map((t) => ({
      id: String(t.id),
      date: t.date,
      amount: t.amount,
      merchant: t.merchant,
      category: t.category,
      dayOfWeek: t.dayOfWeek,
      hour: t.hour,
      isRecurring: t.isRecurring ?? undefined,
      isSubscription: t.isSubscription ?? undefined,
      lastUsed: t.lastUsed ?? undefined,
    }));
    const patterns = detectPatterns(mappedTxns);
    const patternSummary = patterns
      .map((p) => `- ${p.name}: $${Math.abs(p.monthlyImpact)}/mo (${p.type})`)
      .join("\n");

    const memorySummary = memoryFacts.length > 0
      ? memoryFacts.map((m) => `- [${m.category}] ${m.fact}`).join("\n")
      : "No personal facts stored yet.";

    return `You are Artha — a smart, real financial friend for ${name}${user.age ? `, age ${user.age}` : ""}${user.monthlyIncome ? `, earning $${user.monthlyIncome.toLocaleString()}/month` : ""}.

PERSONALITY:
- Be direct about spending problems — use loss-framing: "You're losing $X/year on this"
- Be genuinely supportive about wins and progress — celebrate momentum
- Never sugarcoat bad habits, but never shame either — be blunt and kind
- Casual language, occasionally sharp wit
- Use at most 1 emoji per response
- Keep responses under 120 words
- Ask one follow-up question when relevant

${name.toUpperCase()}'S CONTEXT:
- Savings: $${user.currentSavings?.toLocaleString() ?? "unknown"}
${patternSummary ? `- Detected patterns:\n${patternSummary}` : ""}

WHAT YOU REMEMBER ABOUT ${name.toUpperCase()}:
${memorySummary}

WHEN ASKED "CAN I AFFORD X":
1. Check if cash is available
2. Show the goal tradeoff (setback in months)
3. Offer an alternative (save for it, find cheaper, wait for sale)
4. Frame as empowerment, not restriction

FORMAT RULES:
- Keep paragraphs short (2-3 sentences max)
- For data-heavy responses, include a JSON block like:
  <data-card>{"type":"tradeoff","title":"...","items":[{"label":"...","value":"...","color":"#hex"}]}</data-card>
- End with suggested follow-ups:
  <quick-replies>["option 1","option 2","option 3"]</quick-replies>`;
  } catch {
    return getStaticPrompt(fallbackName);
  }
}

function sanitizeHistory(history: unknown): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-20) // Cap at 20 messages
    .filter(
      (m): m is { role: string; content: string } =>
        m && typeof m === "object" &&
        typeof m.role === "string" &&
        typeof m.content === "string" &&
        (m.role === "user" || m.role === "assistant") &&
        m.content.length <= 2000
    )
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}

function getStaticPrompt(userName: string) {
  const safeName = sanitizeForPrompt(userName, 50);
  return `You are Artha — a smart, real financial friend for ${safeName}, a 23-year-old earning $3,200/month.

PERSONALITY:
- Be direct about spending problems — use loss-framing: "You're losing $X/year on this"
- Be genuinely supportive about wins and progress — celebrate momentum
- Never sugarcoat bad habits, but never shame either — be blunt and kind
- Casual language, occasionally sharp wit
- Use at most 1 emoji per response
- Keep responses under 120 words
- Ask one follow-up question when relevant

${safeName.toUpperCase()}'S CONTEXT:
- Saves ~$200/mo currently (growing from $100 6 months ago)
- Savings: $1,840 | Goals: Emergency Fund ($5k), Japan Trip ($3k), Laptop ($1.5k)
- Patterns: Sunday night delivery ($82/mo), daily Starbucks ($130/mo), unused subscriptions ($43/mo), payday splurge (2.3x spending)
- Strengths: 6-month savings growth streak (+140%)

WHEN ASKED "CAN I AFFORD X":
1. Check if cash is available
2. Show the goal tradeoff (setback in months)
3. Offer an alternative (save for it, find cheaper, wait for sale)
4. Frame as empowerment, not restriction

FORMAT RULES:
- Keep paragraphs short (2-3 sentences max)
- For data-heavy responses, include a JSON block like:
  <data-card>{"type":"tradeoff","title":"...","items":[{"label":"...","value":"...","color":"#hex"}]}</data-card>
- End with suggested follow-ups:
  <quick-replies>["option 1","option 2","option 3"]</quick-replies>`;
}

function parseResponse(text: string) {
  let content = text;
  let dataCard = undefined;
  let quickReplies: string[] | undefined = undefined;

  const dataCardMatch = text.match(/<data-card>([\s\S]*?)<\/data-card>/);
  if (dataCardMatch) {
    try {
      dataCard = JSON.parse(dataCardMatch[1]);
      content = content.replace(/<data-card>[\s\S]*?<\/data-card>/, "").trim();
    } catch {
      // ignore parse errors
    }
  }

  const repliesMatch = text.match(/<quick-replies>([\s\S]*?)<\/quick-replies>/);
  if (repliesMatch) {
    try {
      quickReplies = JSON.parse(repliesMatch[1]);
      content = content
        .replace(/<quick-replies>[\s\S]*?<\/quick-replies>/, "")
        .trim();
    } catch {
      // ignore parse errors
    }
  }

  return { content, dataCard, quickReplies };
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { message, history, userName: rawName } = await request.json();

    // Validate message
    if (!message || typeof message !== "string" || message.length > 2000) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const userName = sanitizeForPrompt(rawName || "Maya", 50);

    // Check cached responses first
    const cached = getCachedResponse(message);
    if (cached) {
      return NextResponse.json(cached);
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        content:
          "I'm having a bit of trouble connecting right now. Try asking about your spending patterns, savings goals, or whether you can afford something specific!",
        quickReplies: [
          "Can I afford AirPods?",
          "How am I doing?",
          "Help me save more",
        ],
      });
    }

    // Get authenticated user ID (optional — works without auth too)
    let userId: string | null = null;
    try {
      const { userId: clerkId } = await auth();
      userId = clerkId;
    } catch {
      // Not authenticated — use static prompt
    }

    // Build dynamic system prompt from DB data
    const systemPrompt = await buildSystemPrompt(userId, userName);

    // Load history from DB if authenticated, otherwise use client-sent history
    let messages: { role: "user" | "assistant"; content: string }[];
    if (userId) {
      try {
        const dbMessages = await getChatMessages(userId, 20);
        messages = [
          ...dbMessages.reverse().map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: message },
        ];
      } catch {
        messages = [
          ...sanitizeHistory(history),
          { role: "user" as const, content: message },
        ];
      }
    } else {
      messages = [
        ...sanitizeHistory(history),
        { role: "user" as const, content: message },
      ];
    }

    try {
      const response = await callClaudeWithHistory(systemPrompt, messages);
      const parsed = parseResponse(response);

      // Persist messages and extract memory (fire-and-forget)
      if (userId) {
        saveChatMessage({ userId, role: "user", content: message }).catch(() => {});
        saveChatMessage({
          userId,
          role: "assistant",
          content: parsed.content,
          dataCard: parsed.dataCard,
        }).catch(() => {});
        extractAndStoreMemory(userId, message, parsed.content).catch(() => {});
      }

      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        content: `That's a great question! Based on your patterns, you're actually in a pretty solid spot. Your savings streak of 6 months is impressive, and you've got room to optimize about $200/mo if you want to accelerate your goals. What specifically would you like to explore?`,
        quickReplies: [
          "Can I afford AirPods?",
          "How am I doing?",
          "Help me save more",
        ],
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
