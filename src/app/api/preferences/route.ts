import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getChannelPrefs, upsertChannelPrefs } from "@/db/queries";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await getChannelPrefs(userId);
  return NextResponse.json(
    prefs ?? { telegram: false, whatsapp: false, imessage: false }
  );
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  await upsertChannelPrefs(userId, body);
  return NextResponse.json({ success: true });
}
