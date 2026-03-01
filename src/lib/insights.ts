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
    // Extract growth % from description (e.g. "grew 140% over 6 months")
    const growthMatch = savingsTrend.description.match(/(\d+)%/);
    const growthPct = growthMatch ? parseInt(growthMatch[1]) : 100;
    // Extract month count
    const monthMatch = savingsTrend.description.match(/(\d+)\s*months?/);
    const monthCount = monthMatch ? parseInt(monthMatch[1]) : 6;

    insights.push({
      id: "win-savings",
      type: "win",
      title: "You're on fire",
      subtitle: `${monthCount}-month savings streak`,
      metric: "savings growth",
      metricValue: growthPct,
      metricSuffix: "%",
      metricPrefix: "+",
      body: `${savingsTrend.details}. That's the kind of momentum that changes everything.`,
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
    });

    // Learn card: Mental accounting bias (after Sunday)
    insights.push({
      id: "learn-mental-accounting",
      type: "learn",
      title: "Did You Know?",
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
    // Extract multiplier from description (e.g. "You spend 2.3x more")
    const ratioMatch = paydaySplurger.description.match(/([\d.]+)x/);
    const ratio = ratioMatch ? parseFloat(ratioMatch[1]) : 2.0;

    insights.push({
      id: "discovery-payday",
      type: "discovery",
      title: "The Payday Effect",
      subtitle: "Your spending spikes after each paycheck",
      metric: "spending multiplier",
      metricValue: ratio,
      metricSuffix: "x",
      body: `In the 3 days after payday, you burn through ${ratio}x your normal spending. That's money you already earned \u2014 gone before you even notice.`,
      color: "#60a5fa",
      gradient: "from-blue-500/30 to-blue-900/40",
      patternId: "payday-splurger",
      goalImpactLine: `That's ${paydaySplurger.goalImpactDays} extra days to your ${user.goals[0]?.name || "goal"}`,
      peerComparison: "71% of users who smoothed their payday spike saved an extra $100/mo",
    });
  }

  // 4. Nudge: Subscription check-in
  const subCreep = patterns.find((p) => p.id === "subscription-creep");
  if (subCreep) {
    // Extract individual subscription names from the pattern details
    // details format: "Netflix: $15.49/mo, Adobe CC: $22.99/mo, ..."
    const subNames = subCreep.details
      .split(", ")
      .map((s) => s.split(":")[0].trim())
      .filter(Boolean);
    const subList = subNames.length > 0
      ? subNames.join(", ")
      : "your subscriptions";

    insights.push({
      id: "nudge-subs",
      type: "nudge",
      title: "Subscription Check-in",
      subtitle: `${subNames.length} subscriptions on autopilot`,
      metric: "total monthly",
      metricValue: subCreep.monthlyImpact,
      metricPrefix: "$",
      metricSuffix: "/mo",
      body: `You're paying for ${subList} — that's $${subCreep.annualImpact}/year on autopilot. Are you getting value from all of them?`,
      color: "#fbbf24",
      gradient: "from-amber-500/30 to-amber-900/40",
      patternId: "subscription-creep",
      goalImpactLine: `Cutting even one could shave ${Math.round(subCreep.goalImpactDays / subNames.length)} days off your ${user.goals[0]?.name || "goal"}`,
      peerComparison: "Users who did a 5-min subscription audit saved an average of $516/year",
    });

    // Learn card: Status quo bias (after Subscriptions)
    insights.push({
      id: "learn-status-quo",
      type: "learn",
      title: "Did You Know?",
      subtitle: "Status Quo Bias",
      metric: "",
      metricValue: 0,
      body: `Humans have a powerful tendency to leave things as they are — even when changing would save money. It's called status quo bias, and subscription companies design around it. You signed up once, and now the charges just keep coming.`,
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

  // 6. Goal Connection: Accelerate top goal (last card leads to /future)
  const topGoal = user.goals.length > 1 ? user.goals[1] : user.goals[0]; // prefer 2nd goal (often aspirational)
  if (topGoal) {
    const optimizablePatterns = patterns.filter(
      (p) => p.monthlyImpact > 0 && p.severity !== "positive"
    );
    const potentialSavings = optimizablePatterns.reduce(
      (sum, p) => sum + Math.round(p.monthlyImpact * 0.5),
      0
    );
    const remaining = topGoal.targetAmount - topGoal.currentAmount;
    const currentMonthly = savingsTrend?.monthlyImpact || 200;
    const currentMonths = currentMonthly > 0 ? Math.ceil(remaining / currentMonthly) : 99;
    const optimizedMonths = (currentMonthly + potentialSavings) > 0
      ? Math.ceil(remaining / (currentMonthly + potentialSavings))
      : 99;
    const monthsSooner = Math.max(0, currentMonths - optimizedMonths);

    insights.push({
      id: "goal-accelerate",
      type: "goal",
      title: `${topGoal.name}, Sooner`,
      subtitle: "Small changes, big acceleration",
      metric: "months sooner",
      metricValue: monthsSooner,
      metricSuffix: " months",
      body: `By optimizing your spending patterns, you could reach your ${topGoal.name} fund ${monthsSooner} months earlier. That's the power of small changes.`,
      color: "#6c63ff",
      gradient: "from-artha-accent/30 to-indigo-900/40",
    });
  }

  return insights;
}
