import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 25_000, // 25s timeout — fail fast rather than hang
});

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  model: string = "gpt-4o",
  maxTokens: number = 1024
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  return response.choices[0]?.message?.content || "";
}

export async function callClaudeWithHistory(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  model: string = "gpt-4o",
  maxTokens: number = 1024
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  return response.choices[0]?.message?.content || "";
}

export interface ToolCallResult {
  content: string;
  toolCalls: { name: string; args: Record<string, unknown> }[];
}

export async function callWithTools(
  systemPrompt: string,
  messages: ChatCompletionMessageParam[],
  tools: ChatCompletionTool[],
  handleToolCall: (name: string, args: Record<string, unknown>) => Promise<string>,
  model: string = "gpt-4o",
  maxTokens: number = 1024
): Promise<string> {
  const allMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  // Allow up to 3 rounds of tool calls
  for (let i = 0; i < 3; i++) {
    const response = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: allMessages,
      tools,
    });

    const choice = response.choices[0];
    if (!choice) return "";

    const msg = choice.message;

    // If no tool calls, return the text content
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return msg.content || "";
    }

    // Add the assistant message with tool calls
    allMessages.push(msg);

    // Execute each tool call and add results
    for (const tc of msg.tool_calls) {
      if (tc.type !== "function") continue;
      const fn = tc.function;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(fn.arguments);
      } catch { /* ignore */ }

      const result = await handleToolCall(fn.name, args);
      allMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }
  }

  // If we exhausted rounds, do one final call without tools
  const final = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: allMessages,
  });

  return final.choices[0]?.message?.content || "";
}
