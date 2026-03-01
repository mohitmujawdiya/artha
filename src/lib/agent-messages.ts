import { AgentMessage, AgentMessageType } from "@/types";

export const AGENT_MESSAGE_STYLES: Record<
  AgentMessageType,
  { label: string; color: string; borderColor: string; bgColor: string }
> = {
  nudge: { label: "NUDGE", color: "#f59e0b", borderColor: "border-amber-500", bgColor: "bg-amber-500/15" },
  win: { label: "WIN", color: "#10b981", borderColor: "border-emerald-500", bgColor: "bg-emerald-500/15" },
  discovery: { label: "DISCOVERY", color: "#a855f7", borderColor: "border-purple-500", bgColor: "bg-purple-500/15" },
  goal_update: { label: "GOAL UPDATE", color: "#3b82f6", borderColor: "border-blue-500", bgColor: "bg-blue-500/15" },
  challenge: { label: "CHALLENGE", color: "#ef4444", borderColor: "border-red-500", bgColor: "bg-red-500/15" },
  awareness: { label: "AWARENESS", color: "#f97316", borderColor: "border-orange-500", bgColor: "bg-orange-500/15" },
  consequence: { label: "CONSEQUENCE", color: "#06b6d4", borderColor: "border-cyan-500", bgColor: "bg-cyan-500/15" },
};

const HOUR_MS = 60 * 60 * 1000;

function createAgentMessages(): AgentMessage[] {
  const now = Date.now();
  return [
    {
      id: "agent-1",
      type: "nudge",
      emoji: "\u{1F355}",
      content: "It's Sunday evening \u2014 your usual delivery time. Last 4 Sundays averaged $38. Want to try cooking tonight? I found a 20-min pasta recipe that'd cost ~$6.",
      timestamp: now - 2 * HOUR_MS,
      read: false,

      quickReplies: ["Show me the recipe", "I'll order anyway", "Maybe next week"],
    },
    {
      id: "agent-2",
      type: "win",
      emoji: "\u{1F525}",
      content: "5-day streak! You're in the top 12% of Artha users for consistency. Your savings rate jumped to 8.2% this week \u2014 that's real momentum.",
      timestamp: now - 5 * HOUR_MS,
      read: false,

      quickReplies: ["How do I keep it going?", "What's my best week ever?"],
    },
    {
      id: "agent-3",
      type: "discovery",
      emoji: "\u2615",
      content: "Coffee spending dropped 28% this week ($24 vs $33 avg). You didn't go on Tuesday or Thursday. That's $480/year if you keep this pattern.",
      timestamp: now - 8 * HOUR_MS,
      read: false,

      quickReplies: ["What else dropped?", "Set a coffee budget"],
    },
    {
      id: "agent-4",
      type: "goal_update",
      emoji: "\u2708\uFE0F",
      content: "Japan fund: $2,100 / $3,000. 70% there! At your current rate, you'll hit it by August. Want to explore ways to get there by July?",
      timestamp: now - 12 * HOUR_MS,
      read: false,

      quickReplies: ["Show me how", "August is fine"],
    },
    {
      id: "agent-5",
      type: "challenge",
      emoji: "\u{1F3AF}",
      content: "3 no-spend evenings this week \u2014 can you do it? Average weeknight spending: $22. That's $66 saved if you nail all three.",
      timestamp: now - 18 * HOUR_MS,
      read: false,

      quickReplies: ["I'm in!", "Make it 2 nights", "Not this week"],
    },
    {
      id: "agent-6",
      type: "awareness",
      emoji: "\u{1F514}",
      content: "Netflix, Spotify, and gym all renew this week: $56.47 total. You haven't used the gym in 3 weeks. Worth reconsidering?",
      timestamp: now - 24 * HOUR_MS,
      read: false,

      quickReplies: ["Cancel gym", "Keep everything", "Show all subscriptions"],
    },
    {
      id: "agent-7",
      type: "consequence",
      emoji: "\u{1F4C8}",
      content: "$15 saved by cooking Sunday instead of ordering = $198 invested over 42 years (at 7% return). Small choices, big future.",
      timestamp: now - 30 * HOUR_MS,
      read: false,

      quickReplies: ["Show more projections", "That's motivating!"],
    },
  ];
}

let cachedMessages: AgentMessage[] | null = null;

export function getAgentMessages(count: number = 3): AgentMessage[] {
  if (!cachedMessages) {
    cachedMessages = createAgentMessages();
  }
  // Return most recent `count` messages (already sorted newest first)
  return cachedMessages.slice(0, count);
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / HOUR_MS);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
