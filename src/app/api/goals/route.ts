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
  const goal = await createGoal({ userId, ...body });
  return NextResponse.json(goal, { status: 201 });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...data } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
  }

  const goal = await updateGoal(id, data);
  return NextResponse.json(goal);
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
  }

  await deleteGoal(id);
  return NextResponse.json({ success: true });
}
