import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { rateLimit } from "@/lib/rate-limit";
import { agentTools, buildSystemPrompt } from "@/lib/chat-shared";

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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Voice not configured" }, { status: 503 });
    }

    const user = await currentUser();
    const userName = user?.firstName || "there";

    // Build the same system prompt used in text chat
    const basePrompt = await buildSystemPrompt(userId, userName);

    // Append voice-specific instructions
    const voiceInstructions = `${basePrompt}

VOICE MODE INSTRUCTIONS:
- You are in a voice conversation. Keep responses concise and conversational.
- Do not use markdown, data-cards, quick-replies, or any special formatting.
- Speak naturally as if talking to a friend.
- Keep responses under 3 sentences when possible.`;

    // Convert agentTools from Chat Completion format to Realtime format
    const realtimeTools = agentTools
      .filter((tool) => tool.type === "function")
      .map((tool) => ({
        type: "function" as const,
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters,
      }));

    const voice = process.env.OPENAI_REALTIME_VOICE || "ash";

    // Use GA endpoint /v1/realtime/client_secrets (not beta /v1/realtime/sessions)
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime",
          instructions: voiceInstructions,
          tools: realtimeTools,
          audio: {
            output: { voice },
            input: { transcription: { model: "whisper-1" } },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[voice/session] OpenAI error:", response.status, errorText);
      let detail = "Failed to create voice session";
      try {
        const parsed = JSON.parse(errorText);
        detail = parsed.error?.message || detail;
      } catch { /* use default */ }
      return NextResponse.json(
        { error: detail },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      clientSecret: data.value,
      expiresAt: data.expires_at,
    });
  } catch (err) {
    console.error("[voice/session] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to create voice session" },
      { status: 500 }
    );
  }
}
