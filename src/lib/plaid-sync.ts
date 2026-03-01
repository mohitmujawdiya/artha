import { eq } from "drizzle-orm";
import { plaidClient } from "./plaid";
import { mapPlaidTransaction } from "./plaid-mapper";
import { insertTransactions, updatePlaidCursor } from "@/db/queries";
import { db } from "@/db/index";
import { plaidItems } from "@/db/schema";
import { decrypt } from "./encryption";

/**
 * Sync transactions for a Plaid item. Called directly — not via HTTP.
 * Returns the number of transactions synced.
 */
export async function syncPlaidItem(itemId: string): Promise<number> {
  const [item] = await db
    .select()
    .from(plaidItems)
    .where(eq(plaidItems.itemId, itemId));

  if (!item) {
    throw new Error("Plaid item not found");
  }

  // Decrypt the access token
  let accessToken: string;
  try {
    accessToken = decrypt(item.accessToken);
  } catch {
    // Fallback for tokens stored before encryption was enabled
    accessToken = item.accessToken;
  }

  let cursor = item.cursor || undefined;
  let hasMore = true;
  let totalAdded = 0;

  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor,
    });

    const { added, next_cursor, has_more } = response.data;

    if (added.length > 0) {
      const mapped = added.map((t) => mapPlaidTransaction(t, item.userId));
      await insertTransactions(mapped);
      totalAdded += added.length;
    }

    cursor = next_cursor;
    hasMore = has_more;
  }

  if (cursor) {
    await updatePlaidCursor(itemId, cursor);
  }

  return totalAdded;
}
