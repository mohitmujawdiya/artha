import { BehavioralPattern, Insight, Transaction, UserProfile } from "@/types";

export function generateInsights(
  patterns: BehavioralPattern[],
  _transactions: Transaction[],
  _user: UserProfile
): Insight[] {
  const insights: Insight[] = [];

  // 1. Win: Savings streak
  const savingsTrend = patterns.find((p) => p.id === "savings-trend");
  if (savingsTrend) {
    insights.push({
      id: "win-savings",
      type: "win",
      title: "You're on fire",
      subtitle: "6-month savings streak",
      metric: "savings growth",
      metricValue: 140,
      metricSuffix: "%",
      metricPrefix: "+",
      body: `Your savings grew from $100/mo to $240/mo. That's the kind of momentum that changes everything.`,
      color: "#4ade80",
      gradient: "from-emerald-500/30 to-emerald-900/40",
      patternId: "savings-trend",
    });
  }

  // 1b. Rhythm: Spending Heatmap
  insights.push({
    id: "rhythm-heatmap",
    type: "rhythm",
    title: "Your Rhythm",
    subtitle: "When your money moves",
    metric: "peak spending hours",
    metricValue: 0,
    body: "This is your spending heartbeat — every bright cell is a moment your wallet opened. Notice the Sunday night glow? That's your delivery ritual.",
    color: "#a78bfa",
    gradient: "from-violet-500/30 to-indigo-900/40",
    visualization: "heatmap",
  });

  // 2. Discovery: Sunday Night Orderer
  const sundayOrderer = patterns.find((p) => p.id === "sunday-night-orderer");
  if (sundayOrderer) {
    insights.push({
      id: "discovery-sunday",
      type: "discovery",
      title: "Sunday Night Orderer",
      subtitle: "A pattern hiding in plain sight",
      metric: "monthly delivery spend",
      metricValue: sundayOrderer.monthlyImpact,
      metricPrefix: "$",
      metricSuffix: "/mo",
      body: `Almost every Sunday between 7-10pm, you're ordering delivery. It's your wind-down ritual — but it adds up to $${sundayOrderer.annualImpact}/year.`,
      color: "#a78bfa",
      gradient: "from-purple-500/30 to-purple-900/40",
      patternId: "sunday-night-orderer",
    });
  }

  // 3. Discovery: Payday Effect
  const paydaySplurger = patterns.find((p) => p.id === "payday-splurger");
  if (paydaySplurger) {
    insights.push({
      id: "discovery-payday",
      type: "discovery",
      title: "The Payday Effect",
      subtitle: "Your spending spikes after each paycheck",
      metric: "spending multiplier",
      metricValue: 2.3,
      metricSuffix: "x",
      body: `In the 3 days after payday, you spend 2.3x your daily average. It's a common pattern — and an easy one to smooth out.`,
      color: "#60a5fa",
      gradient: "from-blue-500/30 to-blue-900/40",
      patternId: "payday-splurger",
    });
  }

  // 4. Nudge: Subscription check-in
  const subCreep = patterns.find((p) => p.id === "subscription-creep");
  if (subCreep) {
    insights.push({
      id: "nudge-subs",
      type: "nudge",
      title: "Subscription Check-in",
      subtitle: "Paying for things you're not using",
      metric: "wasted monthly",
      metricValue: subCreep.monthlyImpact,
      metricPrefix: "$",
      metricSuffix: "/mo",
      body: `${subCreep.description}. That's $${subCreep.annualImpact}/year on autopilot. One 5-minute cancel session could fund a weekend trip.`,
      color: "#fbbf24",
      gradient: "from-amber-500/30 to-amber-900/40",
      patternId: "subscription-creep",
    });
  }

  // 5. Goal Connection: Japan fund acceleration
  insights.push({
    id: "goal-japan",
    type: "goal",
    title: "Japan, Sooner",
    subtitle: "Small changes, big acceleration",
    metric: "months sooner",
    metricValue: 4,
    metricSuffix: " months",
    body: `By optimizing just your Sunday deliveries and unused subscriptions, you could reach your Japan trip fund 4 months earlier.`,
    color: "#6c63ff",
    gradient: "from-artha-accent/30 to-indigo-900/40",
  });

  // 6. Challenge
  insights.push({
    id: "challenge-mealprep",
    type: "challenge",
    title: "This Week's Challenge",
    subtitle: "Meal prep Sunday",
    metric: "potential savings",
    metricValue: 15,
    metricPrefix: "$",
    body: `This Sunday, try prepping a simple meal instead of ordering. Even once is a win — and you'll save ~$15 this week.`,
    color: "#6c63ff",
    gradient: "from-artha-accent/30 to-violet-900/40",
    action: "Accept Challenge",
  });

  return insights;
}
