import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
