import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callClaude } from "@/lib/claude";
import { rateLimit } from "@/lib/rate-limit";

const ANALYSIS_SYSTEM_PROMPT = `You are a behavioral finance analyst. Analyze the provided transaction data and detect:
1. Temporal spending patterns (time of day, day of week, monthly cycles)
2. Emotional spending triggers
3. Positive trends to celebrate
4. Goal-connected opportunities

Be specific with numbers. Celebrate wins first, then gently surface patterns. Connect everything to the user's stated goals. Output as JSON.`;

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`analyze:${userId}`, 5)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  try {
    const { transactions, user } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        analysis: {
          patterns: [],
          summary: "Analysis requires API key configuration.",
        },
      });
    }

    const response = await callClaude(
      ANALYSIS_SYSTEM_PROMPT,
      `Analyze these transactions for user ${String(user?.name || "").slice(0, 50)} (age ${Number(user?.age) || 0}, income $${Number(user?.monthlyIncome) || 0}/mo, savings $${Number(user?.currentSavings) || 0}):\n\n${JSON.stringify((transactions || []).slice(0, 100))}`,
      "gpt-4o",
      2048
    );

    return NextResponse.json({ analysis: response });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
