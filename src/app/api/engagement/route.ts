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
  await upsertEngagement(userId, body);
  return NextResponse.json({ success: true });
}
