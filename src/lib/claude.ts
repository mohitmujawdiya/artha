import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  model: string = "claude-sonnet-4-20250514",
  maxTokens: number = 1024
): Promise<string> {
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content[0];
  if (block.type === "text") {
    return block.text;
  }
  return "";
}

export async function callClaudeWithHistory(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  model: string = "claude-sonnet-4-20250514",
  maxTokens: number = 1024
): Promise<string> {
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  const block = response.content[0];
  if (block.type === "text") {
    return block.text;
  }
  return "";
}
