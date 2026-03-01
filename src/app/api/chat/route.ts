import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callClaudeWithHistory, callWithTools } from "@/lib/claude";
import { getCachedResponse } from "@/lib/cached-responses";
import { getChatMessages, saveChatMessage } from "@/db/queries";
import { extractAndStoreMemory } from "@/lib/memory-extractor";
import { sanitizeForPrompt } from "@/lib/auth-helpers";
import { rateLimit } from "@/lib/rate-limit";
import { agentTools, buildSystemPrompt, executeToolCall } from "@/lib/chat-shared";

function sanitizeHistory(history: unknown): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-20) // Cap at 20 messages
    .filter(
      (m): m is { role: string; content: string } =>
        m && typeof m === "object" &&
        typeof m.role === "string" &&
        typeof m.content === "string" &&
        (m.role === "user" || m.role === "assistant") &&
        m.content.length <= 2000
    )
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}

function parseResponse(text: string) {
  let content = text;
  let dataCard = undefined;
  let quickReplies: string[] | undefined = undefined;

  const dataCardMatch = text.match(/<data-card>([\s\S]*?)<\/data-card>/);
  if (dataCardMatch) {
    try {
      dataCard = JSON.parse(dataCardMatch[1]);
      content = content.replace(/<data-card>[\s\S]*?<\/data-card>/, "").trim();
    } catch {
      // ignore parse errors
    }
  }

  const repliesMatch = text.match(/<quick-replies>([\s\S]*?)<\/quick-replies>/);
  if (repliesMatch) {
    try {
      quickReplies = JSON.parse(repliesMatch[1]);
      content = content
        .replace(/<quick-replies>[\s\S]*?<\/quick-replies>/, "")
        .trim();
    } catch {
      // ignore parse errors
    }
  }

  return { content, dataCard, quickReplies };
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { message, history, userName: rawName } = await request.json();

    // Validate message
    if (!message || typeof message !== "string" || message.length > 2000) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const userName = sanitizeForPrompt(rawName || "there", 50);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        content:
          "I'm having a bit of trouble connecting right now. Try asking about your spending patterns, savings goals, or whether you can afford something specific!",
        quickReplies: [
          "Can I afford AirPods?",
          "How am I doing?",
          "Help me save more",
        ],
      });
    }

    // Get authenticated user ID (optional — works without auth too)
    let userId: string | null = null;
    try {
      const { userId: clerkId } = await auth();
      userId = clerkId;
      console.log("[chat] userId:", userId ? "authenticated" : "anonymous");
    } catch {
      console.log("[chat] auth() failed, using anonymous mode");
    }

    // Build dynamic system prompt from DB data
    const systemPrompt = await buildSystemPrompt(userId, userName);

    // Load history from DB if authenticated, otherwise use client-sent history
    let messages: { role: "user" | "assistant"; content: string }[];
    if (userId) {
      try {
        const dbMessages = await getChatMessages(userId, 20);
        messages = [
          ...dbMessages.reverse().map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: message },
        ];
      } catch {
        messages = [
          ...sanitizeHistory(history),
          { role: "user" as const, content: message },
        ];
      }
    } else {
      messages = [
        ...sanitizeHistory(history),
        { role: "user" as const, content: message },
      ];
    }

    // Use cached responses only for the first message (no prior history)
    const isFirstMessage = messages.length === 1;
    if (isFirstMessage) {
      const cached = getCachedResponse(message);
      if (cached) {
        // Still persist to DB so follow-ups have context
        if (userId) {
          saveChatMessage({ userId, role: "user", content: message }).catch(() => {});
          saveChatMessage({ userId, role: "assistant", content: cached.content, dataCard: cached.dataCard }).catch(() => {});
        }
        return NextResponse.json(cached);
      }
    }

    try {
      let response: string;

      if (userId) {
        // Authenticated: use tool calling with timeout
        const toolUserId = userId;
        response = await callWithTools(
          systemPrompt,
          messages.map((m) => ({ role: m.role, content: m.content })),
          agentTools,
          async (name, args) => executeToolCall(toolUserId, name, args)
        );
      } else {
        // Unauthenticated: no tools
        response = await callClaudeWithHistory(systemPrompt, messages);
      }

      const parsed = parseResponse(response);

      // Persist messages and extract memory (fire-and-forget)
      if (userId) {
        saveChatMessage({ userId, role: "user", content: message }).catch(() => {});
        saveChatMessage({
          userId,
          role: "assistant",
          content: parsed.content,
          dataCard: parsed.dataCard,
        }).catch(() => {});
        extractAndStoreMemory(userId, message, parsed.content).catch(() => {});
      }

      return NextResponse.json(parsed);
    } catch (err) {
      console.error("[chat] OpenAI call failed:", err instanceof Error ? err.message : err);
      return NextResponse.json({
        content: `I'm having a bit of trouble right now, but I'm still here for you! Try asking me about budgeting tips, saving strategies, or whether you can afford a specific purchase.`,
        quickReplies: [
          "Help me save more",
          "Budgeting tips",
          "How should I start?",
        ],
      });
    }
  } catch (err) {
    console.error("[chat] Request processing failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
