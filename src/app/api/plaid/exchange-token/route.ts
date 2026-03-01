import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { plaidClient } from "@/lib/plaid";
import { savePlaidItem } from "@/db/queries";
import { syncPlaidItem } from "@/lib/plaid-sync";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { publicToken, institutionName } = await request.json();

    if (!publicToken || typeof publicToken !== "string") {
      return NextResponse.json({ error: "Invalid publicToken" }, { status: 400 });
    }

    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const { access_token, item_id } = response.data;

    await savePlaidItem({
      userId,
      accessToken: access_token,
      itemId: item_id,
      institutionName: typeof institutionName === "string" ? institutionName : undefined,
    });

    // Direct function call — no HTTP self-call
    await syncPlaidItem(item_id).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Plaid exchange error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }
}
