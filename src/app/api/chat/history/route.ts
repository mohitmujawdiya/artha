import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getChatMessages } from "@/db/queries";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const messages = await getChatMessages(userId, limit);
  // Return in chronological order
  return NextResponse.json(messages.reverse());
}
