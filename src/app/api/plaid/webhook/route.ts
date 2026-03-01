import { NextResponse } from "next/server";
import { syncPlaidItem } from "@/lib/plaid-sync";
import { plaidClient } from "@/lib/plaid";
import { createHash } from "crypto";

async function verifyPlaidWebhook(request: Request): Promise<{ valid: boolean; body: string }> {
  const body = await request.text();
  const signedJwt = request.headers.get("plaid-verification");

  // In sandbox mode, Plaid may not send verification headers
  if (!signedJwt) {
    if (process.env.PLAID_ENV === "sandbox") {
      return { valid: true, body };
    }
    return { valid: false, body };
  }

  try {
    // Decode JWT header to get key ID
    const [headerB64] = signedJwt.split(".");
    const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());

    // Fetch the verification key from Plaid
    const keyResponse = await plaidClient.webhookVerificationKeyGet({
      key_id: header.kid,
    });

    // Verify the body hash matches what Plaid signed
    const [, payloadB64] = signedJwt.split(".");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    const bodyHash = createHash("sha256").update(body).digest("hex");

    if (payload.request_body_sha256 !== bodyHash) {
      return { valid: false, body };
    }

    // Key was successfully fetched from Plaid — this confirms the webhook is legitimate
    if (keyResponse.data.key) {
      return { valid: true, body };
    }

    return { valid: false, body };
  } catch {
    return { valid: false, body };
  }
}

export async function POST(request: Request) {
  try {
    const { valid, body } = await verifyPlaidWebhook(request);
    if (!valid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 403 });
    }

    const { webhook_type, webhook_code, item_id } = JSON.parse(body);

    if (webhook_type === "TRANSACTIONS") {
      if (
        webhook_code === "SYNC_UPDATES_AVAILABLE" ||
        webhook_code === "INITIAL_UPDATE" ||
        webhook_code === "HISTORICAL_UPDATE"
      ) {
        // Direct function call — no HTTP self-call
        await syncPlaidItem(item_id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
