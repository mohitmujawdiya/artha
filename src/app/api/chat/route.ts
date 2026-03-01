import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callClaudeWithHistory, callWithTools } from "@/lib/claude";
import { getCachedResponse } from "@/lib/cached-responses";
import { getDbUser, getMemoryFacts, getUserTransactions, getChatMessages, saveChatMessage, createGoal, updateGoal, upsertUser, getUserGoals } from "@/db/queries";
import { extractAndStoreMemory } from "@/lib/memory-extractor";
import { detectPatterns } from "@/lib/analysis";
import { sanitizeForPrompt } from "@/lib/auth-helpers";
import { rateLimit } from "@/lib/rate-limit";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import type { Transaction } from "@/types";

const agentTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_goal",
      description: "Create a new financial goal for the user. Use this when the user asks to add, create, or set a new savings goal.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the goal, e.g. 'Emergency Fund'" },
          targetAmount: { type: "number", description: "Target amount in dollars" },
          emoji: { type: "string", description: "A single emoji representing the goal" },
        },
        required: ["name", "targetAmount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_goal",
      description: "Update an existing goal's name, target amount, current amount, or emoji. Use when user wants to edit a goal.",
      parameters: {
        type: "object",
        properties: {
          goalId: { type: "number", description: "ID of the goal to update" },
          name: { type: "string", description: "New name for the goal" },
          targetAmount: { type: "number", description: "New target amount" },
          currentAmount: { type: "number", description: "New current saved amount" },
          emoji: { type: "string", description: "New emoji" },
        },
        required: ["goalId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_profile",
      description: "Update the user's financial profile (age, monthly income, or current savings). Use when user tells you their income, savings, or age.",
      parameters: {
        type: "object",
        properties: {
          age: { type: "number", description: "User's age" },
          monthlyIncome: { type: "number", description: "Monthly income in dollars" },
          currentSavings: { type: "number", description: "Total current savings in dollars" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_goals",
      description: "Get the user's current financial goals. Use this to check existing goals before creating duplicates or to answer questions about goals.",
      parameters: { type: "object", properties: {} },
    },
  },
];

async function buildSystemPrompt(userId: string | null, fallbackName: string) {
  // If no userId (unauthenticated), use hardcoded Maya context
  if (!userId) return getStaticPrompt(fallbackName);

  try {
    const [user, memoryFacts, dbTransactions] = await Promise.all([
      getDbUser(userId),
      getMemoryFacts(userId),
      getUserTransactions(userId),
    ]);

    if (!user) return getMinimalPrompt(fallbackName);

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

TOOLS:
- You can create and update financial goals, and update the user's profile (age, income, savings).
- When a user asks to add a goal, use the create_goal tool. Ask for details (name, target amount) if not provided.
- When a user tells you their income, savings, or age, use update_profile to save it.
- Use get_goals to check existing goals before creating duplicates.

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

function getMinimalPrompt(userName: string) {
  const safeName = sanitizeForPrompt(userName, 50);
  return `You are Artha — a smart, real financial friend for ${safeName}.

PERSONALITY:
- Be direct about spending problems — use loss-framing
- Be genuinely supportive about wins and progress
- Casual language, occasionally sharp wit
- Use at most 1 emoji per response
- Keep responses under 120 words
- Ask one follow-up question when relevant

CONTEXT:
- This user just signed up. You don't have their financial data yet.
- Encourage them to connect their bank account and set up their profile so you can give personalized advice.
- You can still answer general financial questions helpfully.

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
      console.log("[chat] userId:", userId ? "authenticated" : "anonymous");
    } catch {
      console.log("[chat] auth() failed, using anonymous mode");
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
      let response: string;

      if (userId) {
        // Authenticated: use tool calling with timeout
        const toolUserId = userId;
        response = await callWithTools(
          systemPrompt,
          messages.map((m) => ({ role: m.role, content: m.content })),
          agentTools,
          async (name, args) => {
            try {
              switch (name) {
                case "create_goal": {
                  const goalName = typeof args.name === "string" ? args.name.slice(0, 100) : "";
                  const targetAmount = typeof args.targetAmount === "number" ? args.targetAmount : 0;
                  const emoji = typeof args.emoji === "string" ? args.emoji.slice(0, 4) : "🎯";
                  if (!goalName || targetAmount <= 0) return JSON.stringify({ error: "Invalid goal data" });
                  const goal = await createGoal({ userId: toolUserId, name: goalName, targetAmount, emoji });
                  return JSON.stringify({ success: true, goal: { id: goal.id, name: goal.name, targetAmount: goal.targetAmount, emoji: goal.emoji } });
                }
                case "update_goal": {
                  const goalId = typeof args.goalId === "number" ? args.goalId : 0;
                  if (!goalId) return JSON.stringify({ error: "Goal ID required" });
                  const data: Record<string, unknown> = {};
                  if (typeof args.name === "string") data.name = args.name.slice(0, 100);
                  if (typeof args.targetAmount === "number") data.targetAmount = args.targetAmount;
                  if (typeof args.currentAmount === "number") data.currentAmount = args.currentAmount;
                  if (typeof args.emoji === "string") data.emoji = args.emoji.slice(0, 4);
                  const updated = await updateGoal(goalId, toolUserId, data);
                  if (!updated) return JSON.stringify({ error: "Goal not found" });
                  return JSON.stringify({ success: true, goal: updated });
                }
                case "update_profile": {
                  const user = await getDbUser(toolUserId);
                  if (!user) return JSON.stringify({ error: "User not found" });
                  await upsertUser({
                    id: toolUserId,
                    name: user.name,
                    age: typeof args.age === "number" ? args.age : user.age ?? undefined,
                    monthlyIncome: typeof args.monthlyIncome === "number" ? args.monthlyIncome : user.monthlyIncome ?? undefined,
                    currentSavings: typeof args.currentSavings === "number" ? args.currentSavings : user.currentSavings ?? undefined,
                  });
                  return JSON.stringify({ success: true });
                }
                case "get_goals": {
                  const goals = await getUserGoals(toolUserId);
                  return JSON.stringify(goals.map((g) => ({ id: g.id, name: g.name, targetAmount: g.targetAmount, currentAmount: g.currentAmount, emoji: g.emoji })));
                }
                default:
                  return JSON.stringify({ error: "Unknown tool" });
              }
            } catch (toolErr) {
              console.error(`[chat] Tool "${name}" failed:`, toolErr instanceof Error ? toolErr.message : toolErr);
              return JSON.stringify({ error: `Tool failed: ${toolErr instanceof Error ? toolErr.message : "unknown error"}` });
            }
          }
        );
      } else {
        // Unauthenticated: no tools
        response = await callClaudeWithHistory(systemPrompt, messages);
      }

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
    } catch (err) {
      console.error("[chat] OpenAI call failed:", err instanceof Error ? err.message : err);
      return NextResponse.json({
        content: `I'm having a bit of trouble right now, but I'm still here for you! Try asking me about budgeting tips, saving strategies, or whether you can afford a specific purchase.`,
        quickReplies: [
          "Help me save more",
          "Budgeting tips",
          "How should I start?",
        ],
      });
    }
  } catch (err) {
    console.error("[chat] Request processing failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
