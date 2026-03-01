import { NextResponse } from "next/server";
import { callClaudeWithHistory } from "@/lib/claude";
import { getCachedResponse } from "@/lib/cached-responses";

function getCoachSystemPrompt(userName: string) {
  return `You are Artha — a supportive, smart financial friend for ${userName}, a 23-year-old earning $3,200/month.

PERSONALITY:
- Supportive smart friend, never a financial advisor or nagging parent
- Celebrate wins genuinely, never shame spending choices
- Casual language, direct, occasionally witty
- Use at most 1 emoji per response
- Keep responses under 120 words
- Ask one follow-up question when relevant

${userName.toUpperCase()}'S CONTEXT:
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
    const { message, history, userName: rawName } = await request.json();
    const userName = rawName || "Maya";

    // Check cached responses first
    const cached = getCachedResponse(message);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Try live API with 3s timeout
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
      const messages = [
        ...(history || []),
        { role: "user" as const, content: message },
      ];

      const response = await callClaudeWithHistory(
        getCoachSystemPrompt(userName),
        messages
      );

      clearTimeout(timeout);
      return NextResponse.json(parseResponse(response));
    } catch {
      clearTimeout(timeout);
      // Fallback to cached if API fails/times out
      if (cached) {
        return NextResponse.json(cached);
      }
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
