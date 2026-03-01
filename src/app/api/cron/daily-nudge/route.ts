import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { users, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { callClaude } from "@/lib/claude";
import { saveChatMessage } from "@/db/queries";
import { verifyBearerSecret, sanitizeForPrompt } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  if (!verifyBearerSecret(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allUsers = await db.select().from(users);
    let nudged = 0;

    for (const user of allUsers) {
      const userTxns = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, user.id));

      const today = new Date().getDay();
      const todayTxns = userTxns.filter((t) => t.dayOfWeek === today);

      if (todayTxns.length < 3) continue;

      const avgSpend =
        todayTxns
          .filter((t) => t.amount < 0)
          .reduce((s, t) => s + Math.abs(t.amount), 0) / Math.max(todayTxns.length, 1);

      const safeName = sanitizeForPrompt(user.name, 50);
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const nudge = await callClaude(
        "You write short proactive spending nudges (1-2 sentences). Friendly, not preachy. Use the user's name.",
        `Write a brief nudge for ${safeName}. It's ${dayNames[today]}. They typically spend $${avgSpend.toFixed(0)} on this day. Give a pattern-aware tip.`,
        "gpt-4o",
        128
      );

      await saveChatMessage({
        userId: user.id,
        role: "assistant",
        content: nudge,
      });

      nudged++;
    }

    return NextResponse.json({ nudged });
  } catch (error) {
    console.error("Daily nudge error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
