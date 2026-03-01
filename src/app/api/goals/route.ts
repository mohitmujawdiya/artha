import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserGoals, createGoal, updateGoal, deleteGoal } from "@/db/queries";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goals = await getUserGoals(userId);
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Explicit field extraction — prevent mass assignment
  const { name, targetAmount, currentAmount, deadline, emoji } = body;

  if (!name || typeof name !== "string" || !targetAmount || typeof targetAmount !== "number") {
    return NextResponse.json({ error: "name (string) and targetAmount (number) are required" }, { status: 400 });
  }

  const goal = await createGoal({
    userId,
    name: name.slice(0, 100),
    targetAmount,
    currentAmount: typeof currentAmount === "number" ? currentAmount : 0,
    deadline: typeof deadline === "string" ? deadline.slice(0, 20) : undefined,
    emoji: typeof emoji === "string" ? emoji.slice(0, 4) : undefined,
  });
  return NextResponse.json(goal, { status: 201 });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, targetAmount, currentAmount, deadline, emoji } = body;

  if (!id || typeof id !== "number") {
    return NextResponse.json({ error: "Goal ID (number) required" }, { status: 400 });
  }

  // Only pass explicitly allowed fields — ownership enforced in query
  const data: Record<string, unknown> = {};
  if (typeof name === "string") data.name = name.slice(0, 100);
  if (typeof targetAmount === "number") data.targetAmount = targetAmount;
  if (typeof currentAmount === "number") data.currentAmount = currentAmount;
  if (typeof deadline === "string") data.deadline = deadline.slice(0, 20);
  if (typeof emoji === "string") data.emoji = emoji.slice(0, 4);

  const goal = await updateGoal(id, userId, data);
  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }
  return NextResponse.json(goal);
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id || typeof id !== "number") {
    return NextResponse.json({ error: "Goal ID (number) required" }, { status: 400 });
  }

  // Ownership enforced in query
  await deleteGoal(id, userId);
  return NextResponse.json({ success: true });
}
