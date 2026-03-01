import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { mapPlaidTransaction } from "@/lib/plaid-mapper";
import { getPlaidItems, updatePlaidCursor, insertTransactions } from "@/db/queries";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { plaidItems } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const { itemId } = await request.json();

    // Find the plaid item
    const [item] = await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.itemId, itemId));

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    let cursor = item.cursor || undefined;
    let hasMore = true;
    let totalAdded = 0;

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: item.accessToken,
        cursor,
      });

      const { added, next_cursor, has_more } = response.data;

      if (added.length > 0) {
        const mapped = added.map((t) =>
          mapPlaidTransaction(t, item.userId)
        );
        await insertTransactions(mapped);
        totalAdded += added.length;
      }

      cursor = next_cursor;
      hasMore = has_more;
    }

    if (cursor) {
      await updatePlaidCursor(itemId, cursor);
    }

    return NextResponse.json({ synced: totalAdded });
  } catch (error) {
    console.error("Plaid sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
