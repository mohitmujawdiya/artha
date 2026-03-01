import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getEngagement, upsertEngagement } from "@/db/queries";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getEngagement(userId);
  return NextResponse.json(
    state ?? {
      streak: 0,
      lastCheckIn: null,
      activeChallenges: [],
      agentMessagesRead: [],
    }
  );
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Explicit field extraction — prevent mass assignment
  const data: Record<string, unknown> = {};
  if (typeof body.streak === "number") data.streak = body.streak;
  if (typeof body.lastCheckIn === "string") data.lastCheckIn = body.lastCheckIn.slice(0, 20);
  if (Array.isArray(body.activeChallenges)) data.activeChallenges = body.activeChallenges;
  if (Array.isArray(body.agentMessagesRead)) data.agentMessagesRead = body.agentMessagesRead;

  await upsertEngagement(userId, data);
  return NextResponse.json({ success: true });
}
