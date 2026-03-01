import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";

const ANALYSIS_SYSTEM_PROMPT = `You are a behavioral finance analyst. Analyze the provided transaction data and detect:
1. Temporal spending patterns (time of day, day of week, monthly cycles)
2. Emotional spending triggers
3. Positive trends to celebrate
4. Goal-connected opportunities

Be specific with numbers. Celebrate wins first, then gently surface patterns. Connect everything to the user's stated goals. Output as JSON.`;

export async function POST(request: Request) {
  try {
    const { transactions, user } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        analysis: {
          patterns: [],
          summary:
            "Analysis requires API key configuration.",
        },
      });
    }

    const response = await callClaude(
      ANALYSIS_SYSTEM_PROMPT,
      `Analyze these transactions for user ${user.name} (age ${user.age}, income $${user.monthlyIncome}/mo, savings $${user.currentSavings}):\n\n${JSON.stringify(transactions.slice(0, 100))}`,
      "claude-sonnet-4-20250514",
      2048
    );

    return NextResponse.json({ analysis: response });
  } catch {
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
