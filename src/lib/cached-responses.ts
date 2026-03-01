import { InlineDataCard } from "@/types";

interface CachedResponse {
  content: string;
  dataCard?: InlineDataCard;
  quickReplies?: string[];
}

const cachedResponses: Record<string, CachedResponse> = {
  "can i afford airpods": {
    content: `Real talk — you technically have the cash. AirPods Pro are $249, and you've got $1,840 in savings. But let's zoom out for a sec:`,
    dataCard: {
      type: "tradeoff",
      title: "AirPods Pro — The Tradeoff",
      items: [
        { label: "AirPods Pro cost", value: "$249", color: "#fbbf24" },
        { label: "Your savings", value: "$1,840", color: "#4ade80" },
        { label: "After purchase", value: "$1,591", color: "#f87171" },
        {
          label: "Emergency fund setback",
          value: "~1.2 months",
          color: "#fbbf24",
        },
        {
          label: "Japan trip setback",
          value: "~1 month",
          color: "#fbbf24",
        },
      ],
    },
    quickReplies: [
      "What if I save for them instead?",
      "Show me a cheaper option",
      "I'll wait — what should I prioritize?",
    ],
  },
  "how am i doing": {
    content: `Honestly? Better than you probably think. Your savings went from $100/mo to $240/mo in 6 months — that's 140% growth. Most people your age aren't saving at all.

Here's what's working: you've built real momentum. The savings streak is legit.

Where there's room to grow: your Sunday night delivery habit ($82/mo) and some unused subscriptions ($43/mo) are quietly eating into your Japan fund. But those are easy wins.

You're building something. Don't stop.`,
    quickReplies: [
      "Tell me more about my patterns",
      "How do I save for Japan faster?",
      "Can I afford AirPods?",
    ],
  },
  "help me save more": {
    content: `Here's the good news — you've already got the hardest part down (the habit). Now it's about optimizing.

Your quickest wins:
1. Cancel 3 unused subs → +$43/mo instantly
2. Meal prep one Sunday → saves ~$15/week
3. Brew coffee 3 mornings → saves ~$55/mo

That's $160/mo extra without changing your lifestyle much. At your age, invested over 42 years at 7%, that becomes over $400,000. Not a typo.

Want to start with the easiest one?`,
    quickReplies: [
      "Let's cancel subscriptions",
      "Tell me about the coffee math",
      "Show me the 42-year effect",
    ],
  },
  "what if i save for them instead": {
    content: `Love this energy. If you set aside $50/month from your optimized savings, you'd have AirPods money in 5 months — and you wouldn't touch your emergency fund or Japan savings at all.

Even better: by then there might be a sale or a new model dropping (hello refurbished deals).

The flex isn't buying things — it's being able to buy things without stress.`,
    quickReplies: [
      "Set up a $50/mo AirPods fund",
      "What else could I save for?",
      "Show me my spending patterns",
    ],
  },
};

export function getCachedResponse(
  message: string
): CachedResponse | null {
  const normalized = message.toLowerCase().replace(/[?!.,]/g, "").trim();

  for (const [key, response] of Object.entries(cachedResponses)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return response;
    }
  }

  return null;
}
