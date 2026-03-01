import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { plaidItems } from "@/db/schema";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await db.select().from(plaidItems);
    let synced = 0;

    for (const item of items) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/plaid/sync`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId: item.itemId }),
          }
        );
        if (res.ok) synced++;
      } catch {
        // Continue with other items
      }
    }

    return NextResponse.json({ synced, total: items.length });
  } catch (error) {
    console.error("Plaid cron sync error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
