import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser, getUserGoals } from "@/db/queries";
import { getMockUser } from "@/lib/data";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      // Unauthenticated — return mock user
      const mock = getMockUser();
      return NextResponse.json(mock);
    }

    const [user, goals] = await Promise.all([
      getDbUser(userId),
      getUserGoals(userId),
    ]);

    if (!user) {
      return NextResponse.json(getMockUser());
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      age: user.age,
      monthlyIncome: user.monthlyIncome,
      currentSavings: user.currentSavings,
      goals: goals.map((g) => ({
        id: String(g.id),
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline,
        emoji: g.emoji,
      })),
    });
  } catch {
    return NextResponse.json(getMockUser());
  }
}
