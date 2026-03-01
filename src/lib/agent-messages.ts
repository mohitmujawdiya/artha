import { AgentMessage, AgentMessageType, BehavioralPattern, UserProfile } from "@/types";

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

export function generateAgentMessages(
  patterns: BehavioralPattern[],
  user: UserProfile
): AgentMessage[] {
  const now = Date.now();
  const messages: AgentMessage[] = [];

  // Nudge: Sunday delivery pattern
  const sundayOrderer = patterns.find((p) => p.id === "sunday-night-orderer");
  if (sundayOrderer) {
    const avgOrder = Math.round(sundayOrderer.monthlyImpact / 4);
    messages.push({
      id: "agent-sunday",
      type: "nudge",
      emoji: "\u{1F355}",
      content: `It's Sunday evening \u2014 your usual delivery time. Last 4 Sundays averaged $${avgOrder}. Want to try cooking tonight? That's $${sundayOrderer.annualImpact}/year you could redirect to your goals.`,
      timestamp: now - 2 * HOUR_MS,
      read: false,
      quickReplies: ["Show me a recipe", "I'll order anyway", "Maybe next week"],
    });
  }

  // Win: Savings trend
  const savingsTrend = patterns.find((p) => p.id === "savings-trend");
  if (savingsTrend) {
    messages.push({
      id: "agent-savings",
      type: "win",
      emoji: "\u{1F525}",
      content: `${savingsTrend.description}! You're now saving $${savingsTrend.monthlyImpact}/mo. That's real momentum \u2014 keep it going.`,
      timestamp: now - 5 * HOUR_MS,
      read: false,
      quickReplies: ["How do I keep it going?", "What's my best week ever?"],
    });
  }

  // Discovery: Coffee habit
  const coffee = patterns.find((p) => p.id === "daily-coffee");
  if (coffee) {
    const halfSavings = Math.round(coffee.monthlyImpact * 0.5);
    messages.push({
      id: "agent-coffee",
      type: "discovery",
      emoji: "\u2615",
      content: `You're spending $${coffee.monthlyImpact}/mo on coffee \u2014 that's $${coffee.annualImpact}/year. Brewing at home 3 days a week could save you ~$${halfSavings}/mo.`,
      timestamp: now - 8 * HOUR_MS,
      read: false,
      quickReplies: ["What else can I cut?", "Set a coffee budget"],
    });
  }

  // Goal update: First goal progress
  if (user.goals.length > 0) {
    const goal = user.goals[0];
    const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
    const remaining = goal.targetAmount - goal.currentAmount;
    const monthlySavings = savingsTrend?.monthlyImpact || 200;
    const monthsLeft = Math.ceil(remaining / monthlySavings);
    messages.push({
      id: "agent-goal",
      type: "goal_update",
      emoji: goal.emoji,
      content: `${goal.name}: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}. ${pct}% there! At your current rate, ${monthsLeft} months to go.`,
      timestamp: now - 12 * HOUR_MS,
      read: false,
      quickReplies: ["Show me how to speed up", "I'm on track"],
    });
  }

  // Challenge based on top pattern
  const topSpending = [...patterns]
    .filter((p) => p.monthlyImpact > 0 && p.severity !== "positive")
    .sort((a, b) => b.monthlyImpact - a.monthlyImpact)[0];
  if (topSpending) {
    messages.push({
      id: "agent-challenge",
      type: "challenge",
      emoji: "\u{1F3AF}",
      content: `3 no-spend evenings this week \u2014 can you do it? Based on your ${topSpending.name.toLowerCase()} pattern, that could save you $${Math.round(topSpending.monthlyImpact * 0.75)} this month.`,
      timestamp: now - 18 * HOUR_MS,
      read: false,
      quickReplies: ["I'm in!", "Make it 2 nights", "Not this week"],
    });
  }

  // Awareness: Subscription creep
  const subs = patterns.find((p) => p.id === "subscription-creep");
  if (subs) {
    const numUnused = subs.description.match(/\d+/)?.[0] || "some";
    messages.push({
      id: "agent-subs",
      type: "awareness",
      emoji: "\u{1F514}",
      content: `You have ${numUnused} subscriptions you haven't used in 2+ months, draining $${subs.monthlyImpact}/mo. That's $${subs.annualImpact}/year on autopilot. Worth reconsidering?`,
      timestamp: now - 24 * HOUR_MS,
      read: false,
      quickReplies: ["Show all subscriptions", "Cancel unused ones", "Keep everything"],
    });
  }

  // Consequence: Compound projection from highest-impact pattern
  if (topSpending) {
    const monthly = Math.round(topSpending.monthlyImpact * 0.5);
    const monthlyReturn = 0.07 / 12;
    let total = 0;
    for (let i = 0; i < 42 * 12; i++) {
      total = (total + monthly) * (1 + monthlyReturn);
    }
    messages.push({
      id: "agent-consequence",
      type: "consequence",
      emoji: "\u{1F4C8}",
      content: `$${monthly} saved monthly by cutting ${topSpending.name.toLowerCase()} = $${Math.round(total).toLocaleString()} invested over 42 years (at 7% return). Small choices, big future.`,
      timestamp: now - 30 * HOUR_MS,
      read: false,
      quickReplies: ["Show more projections", "That's motivating!"],
    });
  }

  return messages;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / HOUR_MS);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
