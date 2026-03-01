import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { rateLimit } from "@/lib/rate-limit";
import { executeToolCall } from "@/lib/chat-shared";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toolName, callId, arguments: args } = await request.json();

    if (!toolName || typeof toolName !== "string") {
      return NextResponse.json({ error: "Invalid tool name" }, { status: 400 });
    }

    const parsedArgs = typeof args === "string" ? JSON.parse(args) : (args || {});
    const result = await executeToolCall(userId, toolName, parsedArgs);

    return NextResponse.json({ callId, result });
  } catch (err) {
    console.error("[voice/tools] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Tool execution failed" },
      { status: 500 }
    );
  }
}
