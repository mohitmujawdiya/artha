import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveChatMessage } from "@/db/queries";
import { extractAndStoreMemory } from "@/lib/memory-extractor";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 10, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transcripts } = await request.json();

    if (!Array.isArray(transcripts) || transcripts.length === 0) {
      return NextResponse.json({ error: "No transcripts provided" }, { status: 400 });
    }

    // Cap at 100 turns to prevent abuse
    const capped = transcripts.slice(0, 100);

    // Save each transcript as a chat message
    for (const t of capped) {
      if (
        t &&
        typeof t.role === "string" &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string" &&
        t.content.trim().length > 0
      ) {
        await saveChatMessage({
          userId,
          role: t.role,
          content: t.content.trim(),
        });
      }
    }

    // Extract memory from user/assistant pairs
    for (let i = 0; i < capped.length - 1; i++) {
      if (capped[i]?.role === "user" && capped[i + 1]?.role === "assistant") {
        extractAndStoreMemory(userId, capped[i].content, capped[i + 1].content).catch(() => {});
      }
    }

    return NextResponse.json({ saved: capped.length });
  } catch (err) {
    console.error("[voice/transcripts] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to save transcripts" },
      { status: 500 }
    );
  }
}
