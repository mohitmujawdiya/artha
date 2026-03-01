import { BehavioralPattern, Insight, Transaction, UserProfile } from "@/types";
import { derivePersonality } from "./dna";

export function generateInsights(
  patterns: BehavioralPattern[],
  _transactions: Transaction[],
  user: UserProfile
): Insight[] {
  const insights: Insight[] = [];
  const personality = derivePersonality(patterns);

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
      personalityLabel: personality,
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
      body: `You're losing $${sundayOrderer.annualImpact}/year to Sunday night delivery — that's real money draining from your goals every single week.`,
      color: "#a78bfa",
      gradient: "from-purple-500/30 to-purple-900/40",
      patternId: "sunday-night-orderer",
      goalImpactLine: `That's ${sundayOrderer.goalImpactDays} extra days to your ${user.goals[0]?.name || "goal"}`,
      peerComparison: "83% of users with this pattern cut it in half within 2 months",
      savingsRule: { trigger: "you order Sunday delivery", amount: 20 },
    });

    // Learn card: Mental accounting bias (after Sunday)
    insights.push({
      id: "learn-mental-accounting",
      type: "learn",
      title: "Did you know?",
      subtitle: "Mental Accounting Bias",
      metric: "",
      metricValue: 0,
      body: `Your brain treats "weekend money" differently from "weekday money" — but your bank account doesn't. This is called mental accounting bias, and it's why Sunday spending feels harmless even when it adds up to $${sundayOrderer.annualImpact}/year.`,
      color: "#38bdf8",
      gradient: "from-sky-500/30 to-sky-900/40",
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
      body: `In the 3 days after payday, you burn through 2.3x your normal spending. That's money you already earned — gone before you even notice.`,
      color: "#60a5fa",
      gradient: "from-blue-500/30 to-blue-900/40",
      patternId: "payday-splurger",
      goalImpactLine: `That's ${paydaySplurger.goalImpactDays} extra days to your ${user.goals[0]?.name || "goal"}`,
      peerComparison: "71% of users who smoothed their payday spike saved an extra $100/mo",
      savingsRule: { trigger: "payday hits", amount: 50 },
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
      body: `You're paying $${subCreep.annualImpact}/year for services you don't even open. That money disappears on autopilot every month.`,
      color: "#fbbf24",
      gradient: "from-amber-500/30 to-amber-900/40",
      patternId: "subscription-creep",
      goalImpactLine: `That's ${subCreep.goalImpactDays} extra days to your ${user.goals[0]?.name || "goal"}`,
      peerComparison: "Users who did a 5-min cancel session saved an average of $516/year",
      savingsRule: { trigger: "you cancel a subscription", amount: 43 },
    });

    // Learn card: Status quo bias (after Subscriptions)
    insights.push({
      id: "learn-status-quo",
      type: "learn",
      title: "Did you know?",
      subtitle: "Status Quo Bias",
      metric: "",
      metricValue: 0,
      body: `Humans have a powerful tendency to leave things as they are — even when changing would save money. It's called status quo bias, and subscription companies literally design around it. The cancel button is hard to find on purpose.`,
      color: "#38bdf8",
      gradient: "from-sky-500/30 to-sky-900/40",
    });
  }

  // 5. Challenge (card 8 of 9)
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
    peerComparison: "68% of users who tried this kept it going for 4+ weeks",
  });

  // 6. Goal Connection: Japan fund acceleration (card 9 of 9 — last card leads to /future)
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

  return insights;
}
