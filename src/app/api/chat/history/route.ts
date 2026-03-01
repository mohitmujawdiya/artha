import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getChatMessages } from "@/db/queries";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(request.url);
  const rawLimit = parseInt(searchParams.get("limit") || "50", 10);
  const limit = Math.min(Math.max(1, rawLimit || 50), 200);

  const messages = await getChatMessages(userId, limit);
  // Return in chronological order
  return NextResponse.json(messages.reverse());
}
