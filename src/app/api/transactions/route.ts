import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserTransactions } from "@/db/queries";
import { getMockTransactions } from "@/lib/data";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      // Unauthenticated visitors get demo data
      return NextResponse.json(getMockTransactions());
    }

    const transactions = await getUserTransactions(userId);
    if (transactions.length === 0) {
      // Authenticated but no transactions — return empty, not mock
      return NextResponse.json([]);
    }

    return NextResponse.json(
      transactions.map((t) => ({
        id: `txn-${t.id}`,
        date: t.date,
        amount: t.amount,
        merchant: t.merchant,
        category: t.category,
        dayOfWeek: t.dayOfWeek,
        hour: t.hour,
        isRecurring: t.isRecurring,
        isSubscription: t.isSubscription,
        lastUsed: t.lastUsed,
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
