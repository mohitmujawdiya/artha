import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { users, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { callClaude } from "@/lib/claude";
import { saveChatMessage } from "@/db/queries";
import { verifyBearerSecret } from "@/lib/auth-helpers";
import { sanitizeForPrompt } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  if (!verifyBearerSecret(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allUsers = await db.select().from(users);
    let generated = 0;

    for (const user of allUsers) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const userTxns = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, user.id));

      const recentTxns = userTxns.filter(
        (t) => new Date(t.date) >= oneWeekAgo
      );

      if (recentTxns.length === 0) continue;

      const totalSpent = recentTxns
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const safeName = sanitizeForPrompt(user.name, 50);

      const story = await callClaude(
        "You write short, engaging weekly money narratives (under 100 words). Casual, warm tone. Start with a hook.",
        `Write a weekly money story for ${safeName}. They spent $${totalSpent.toFixed(0)} across ${recentTxns.length} transactions this week. Top categories: ${getTopCategories(recentTxns)}`,
        "gpt-4o",
        256
      );

      await saveChatMessage({
        userId: user.id,
        role: "assistant",
        content: `Your Weekly Story\n\n${story}`,
      });

      generated++;
    }

    return NextResponse.json({ generated });
  } catch (error) {
    console.error("Weekly story error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function getTopCategories(txns: { category: string; amount: number }[]) {
  const cats = new Map<string, number>();
  for (const t of txns) {
    if (t.amount < 0) {
      cats.set(t.category, (cats.get(t.category) || 0) + Math.abs(t.amount));
    }
  }
  return [...cats.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, amt]) => `${cat} ($${amt.toFixed(0)})`)
    .join(", ");
}
