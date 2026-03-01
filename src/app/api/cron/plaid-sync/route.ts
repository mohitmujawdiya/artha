import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { plaidItems } from "@/db/schema";
import { syncPlaidItem } from "@/lib/plaid-sync";
import { verifyBearerSecret } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  if (!verifyBearerSecret(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await db.select().from(plaidItems);
    let synced = 0;

    for (const item of items) {
      try {
        await syncPlaidItem(item.itemId);
        synced++;
      } catch {
        // Continue with other items
      }
    }

    return NextResponse.json({ synced, total: items.length });
  } catch (error) {
    console.error("Plaid cron sync error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
