import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser, getUserGoals, upsertUser, createGoal } from "@/db/queries";
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
      return NextResponse.json({ notFound: true }, { status: 404 });
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, age, monthlyIncome, currentSavings, goals } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name (string) is required" }, { status: 400 });
    }

    // Validate optional fields
    if (age !== undefined && age !== null) {
      if (typeof age !== "number" || age < 13 || age > 120) {
        return NextResponse.json({ error: "age must be between 13 and 120" }, { status: 400 });
      }
    }
    if (monthlyIncome !== undefined && monthlyIncome !== null) {
      if (typeof monthlyIncome !== "number" || monthlyIncome <= 0) {
        return NextResponse.json({ error: "monthlyIncome must be greater than 0" }, { status: 400 });
      }
    }
    if (currentSavings !== undefined && currentSavings !== null) {
      if (typeof currentSavings !== "number" || currentSavings < 0) {
        return NextResponse.json({ error: "currentSavings must be >= 0" }, { status: 400 });
      }
    }

    await upsertUser({
      id: userId,
      name: name.slice(0, 100),
      age: age ?? undefined,
      monthlyIncome: monthlyIncome ?? undefined,
      currentSavings: currentSavings ?? undefined,
    });

    // Create goals (max 3)
    if (Array.isArray(goals)) {
      const goalSlice = goals.slice(0, 3);
      for (const g of goalSlice) {
        if (
          g &&
          typeof g.name === "string" &&
          g.name.trim() &&
          typeof g.targetAmount === "number" &&
          g.targetAmount > 0
        ) {
          await createGoal({
            userId,
            name: g.name.slice(0, 100),
            targetAmount: g.targetAmount,
            emoji: typeof g.emoji === "string" ? g.emoji.slice(0, 4) : undefined,
          });
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
