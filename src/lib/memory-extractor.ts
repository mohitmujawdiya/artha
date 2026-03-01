import { callClaude } from "./claude";
import { addMemoryFact } from "@/db/queries";

const EXTRACTION_PROMPT = `Extract personal facts from this conversation exchange between a financial coach and user.
Return a JSON array of objects with "fact" and "category" fields.
Categories: "preference", "goal", "habit", "life_event"

Only extract concrete, memorable facts — not generic observations.
If no notable facts, return an empty array [].

Examples:
- {"fact": "Wants to visit Japan next December", "category": "goal"}
- {"fact": "Gets coffee at Starbucks every morning", "category": "habit"}
- {"fact": "Just got a raise to $3,500/month", "category": "life_event"}
- {"fact": "Prefers saving over investing for now", "category": "preference"}

Return ONLY the JSON array, no other text.`;

export async function extractAndStoreMemory(
  userId: string,
  userMessage: string,
  assistantResponse: string
) {
  try {
    const conversation = `User: ${userMessage}\nAssistant: ${assistantResponse}`;
    const result = await callClaude(EXTRACTION_PROMPT, conversation, "gpt-4o", 512);

    const facts = JSON.parse(result);
    if (!Array.isArray(facts)) return;

    for (const { fact, category } of facts) {
      if (fact && category) {
        await addMemoryFact({ userId, fact, category });
      }
    }
  } catch {
    // Fire-and-forget — don't break chat flow
  }
}
