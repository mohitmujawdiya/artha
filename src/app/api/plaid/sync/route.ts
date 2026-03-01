import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { verifyBearerSecret } from "@/lib/auth-helpers";
import { syncPlaidItem } from "@/lib/plaid-sync";

export async function POST(request: Request) {
  // Require either Clerk auth or internal secret
  const { userId } = await auth().catch(() => ({ userId: null }));
  const isInternalCall = verifyBearerSecret(
    request.headers.get("authorization"),
    process.env.CRON_SECRET
  );

  if (!userId && !isInternalCall) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { itemId } = await request.json();
    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
    }

    const synced = await syncPlaidItem(itemId);
    return NextResponse.json({ synced });
  } catch (error) {
    console.error("Plaid sync error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
