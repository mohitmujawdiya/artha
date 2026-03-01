import { BehavioralPattern, Transaction } from "@/types";
import {
  getExpenses,
  getTransactionsByMonth,
} from "./data";

export function detectPatterns(
  transactions: Transaction[]
): BehavioralPattern[] {
  const patterns: (BehavioralPattern | null)[] = [
    detectSundayNightOrderer(transactions),
    detectPaydaySplurger(transactions),
    detectSubscriptionCreep(transactions),
    detectDailyCoffee(transactions),
    detectWeekendSpendingGap(transactions),
    detectSavingsTrend(transactions),
    detectImpulseAmazon(transactions),
  ];
  return patterns.filter((p): p is BehavioralPattern => p !== null);
}

function detectSundayNightOrderer(
  transactions: Transaction[]
): BehavioralPattern | null {
  const deliveryMerchants = ["doordash", "ubereats", "uber eats", "grubhub", "postmates"];
  const sundayDeliveries = transactions.filter(
    (t) =>
      t.dayOfWeek === 0 &&
      t.hour >= 19 &&
      t.hour <= 22 &&
      t.amount < 0 &&
      deliveryMerchants.some((m) =>
        t.merchant.toLowerCase().includes(m)
      )
  );

  if (sundayDeliveries.length < 4) return null;

  const monthlyImpact =
    Math.abs(sundayDeliveries.reduce((s, t) => s + t.amount, 0)) /
    6;

  return {
    id: "sunday-night-orderer",
    name: "Sunday Night Orderer",
    type: "timing",
    description: `You order delivery almost every Sunday night between 7-10pm`,
    frequency: `${Math.round(sundayDeliveries.length / 6)}x per month`,
    monthlyImpact: Math.round(monthlyImpact),
    annualImpact: Math.round(monthlyImpact * 12),
    goalImpactDays: Math.round((monthlyImpact / 200) * 30),
    severity: "moderate",
    emoji: "🛵",
    details: `${sundayDeliveries.length} Sunday night delivery orders in 6 months, averaging $${(Math.abs(sundayDeliveries.reduce((s, t) => s + t.amount, 0)) / sundayDeliveries.length).toFixed(0)} each`,
  };
}

function detectPaydaySplurger(
  transactions: Transaction[]
): BehavioralPattern | null {
  const expenses = getExpenses(transactions);
  const allDailyAvg =
    Math.abs(expenses.reduce((s, t) => s + t.amount, 0)) /
    180;

  const paydayExpenses = expenses.filter((t) => {
    const day = parseInt(t.date.slice(8, 10));
    return (day >= 1 && day <= 3) || (day >= 15 && day <= 17);
  });

  const paydayDays = new Set(
    paydayExpenses.map((t) => t.date.slice(0, 10))
  ).size;
  const paydayDailyAvg =
    paydayDays > 0
      ? Math.abs(paydayExpenses.reduce((s, t) => s + t.amount, 0)) /
        paydayDays
      : 0;

  const ratio = paydayDailyAvg / allDailyAvg;
  if (ratio < 1.5) return null;

  const excessMonthly = Math.round((paydayDailyAvg - allDailyAvg) * 6);

  return {
    id: "payday-splurger",
    name: "Payday Effect",
    type: "timing",
    description: `You spend ${ratio.toFixed(1)}x more in the 3 days after payday`,
    frequency: "2x per month (after each paycheck)",
    monthlyImpact: excessMonthly,
    annualImpact: excessMonthly * 12,
    goalImpactDays: Math.round((excessMonthly / 200) * 30),
    severity: "moderate",
    emoji: "💸",
    details: `Average daily spending jumps from $${allDailyAvg.toFixed(0)} to $${paydayDailyAvg.toFixed(0)} right after payday`,
  };
}

function detectSubscriptionCreep(
  transactions: Transaction[]
): BehavioralPattern | null {
  const subscriptions = transactions.filter((t) => t.isSubscription);
  if (subscriptions.length === 0) return null;

  const uniqueSubs = new Map<string, Transaction>();
  for (const t of subscriptions) {
    if (
      !uniqueSubs.has(t.merchant) ||
      t.date > uniqueSubs.get(t.merchant)!.date
    ) {
      uniqueSubs.set(t.merchant, t);
    }
  }

  const now = "2026-02-28";
  const unusedSubs = Array.from(uniqueSubs.values()).filter((t) => {
    if (!t.lastUsed) return false;
    const monthsSinceUse =
      (new Date(now).getTime() - new Date(t.lastUsed).getTime()) /
      (1000 * 60 * 60 * 24 * 30);
    return monthsSinceUse > 2;
  });

  if (unusedSubs.length === 0) return null;

  const monthlyWaste = Math.abs(
    unusedSubs.reduce((s, t) => s + t.amount, 0)
  );

  return {
    id: "subscription-creep",
    name: "Subscription Creep",
    type: "subscription",
    description: `${unusedSubs.length} subscriptions you haven't used in 2+ months`,
    frequency: "Monthly recurring",
    monthlyImpact: Math.round(monthlyWaste),
    annualImpact: Math.round(monthlyWaste * 12),
    goalImpactDays: Math.round((monthlyWaste / 200) * 30),
    severity: "moderate",
    emoji: "📦",
    details: unusedSubs
      .map(
        (t) =>
          `${t.merchant}: $${Math.abs(t.amount).toFixed(2)}/mo (last used ${t.lastUsed?.slice(0, 7)})`
      )
      .join(", "),
  };
}

function detectDailyCoffee(
  transactions: Transaction[]
): BehavioralPattern | null {
  const coffeeKeywords = ["starbucks", "coffee", "cafe", "peet"];
  const coffeeTransactions = transactions.filter(
    (t) =>
      t.amount < 0 &&
      coffeeKeywords.some((k) => t.merchant.toLowerCase().includes(k))
  );

  if (coffeeTransactions.length < 15) return null;

  const monthlyImpact =
    Math.abs(coffeeTransactions.reduce((s, t) => s + t.amount, 0)) /
    6;

  return {
    id: "daily-coffee",
    name: "Daily Coffee Habit",
    type: "spending",
    description: `Averaging ${Math.round(coffeeTransactions.length / 6)} Starbucks runs per month`,
    frequency: `~${Math.round(coffeeTransactions.length / 26)}x per week`,
    monthlyImpact: Math.round(monthlyImpact),
    annualImpact: Math.round(monthlyImpact * 12),
    goalImpactDays: Math.round((monthlyImpact * 0.5 / 200) * 30),
    severity: "neutral",
    emoji: "☕",
    details: `${coffeeTransactions.length} coffee purchases in 6 months, averaging $${(Math.abs(coffeeTransactions.reduce((s, t) => s + t.amount, 0)) / coffeeTransactions.length).toFixed(2)} each`,
  };
}

function detectWeekendSpendingGap(
  transactions: Transaction[]
): BehavioralPattern | null {
  const expenses = getExpenses(transactions).filter(
    (t) =>
      !["rent", "utilities", "income", "savings"].includes(t.category) &&
      !t.isSubscription
  );

  const weekendExpenses = expenses.filter(
    (t) => t.dayOfWeek === 0 || t.dayOfWeek === 5 || t.dayOfWeek === 6
  );
  const weekdayExpenses = expenses.filter(
    (t) => t.dayOfWeek >= 1 && t.dayOfWeek <= 4
  );

  const weekendTotal = Math.abs(
    weekendExpenses.reduce((s, t) => s + t.amount, 0)
  );
  const totalDiscretionary =
    weekendTotal +
    Math.abs(weekdayExpenses.reduce((s, t) => s + t.amount, 0));

  const weekendPct = (weekendTotal / totalDiscretionary) * 100;
  if (weekendPct < 50) return null;

  return {
    id: "weekend-spending-gap",
    name: "Weekend Spending Gap",
    type: "timing",
    description: `${Math.round(weekendPct)}% of your discretionary spending happens Fri-Sun`,
    frequency: "Every weekend",
    monthlyImpact: 0,
    annualImpact: 0,
    goalImpactDays: 0,
    severity: "neutral",
    emoji: "📅",
    details: `$${Math.round(weekendTotal)} on weekends vs $${Math.round(totalDiscretionary - weekendTotal)} on weekdays over 6 months`,
  };
}

function detectSavingsTrend(
  transactions: Transaction[]
): BehavioralPattern | null {
  const savingsTransfers = transactions.filter(
    (t) => t.category === "savings" && t.amount > 0
  );

  if (savingsTransfers.length < 3) return null;

  const byMonth = getTransactionsByMonth(savingsTransfers);
  const monthlyTotals = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, txns]) => txns.reduce((s, t) => s + t.amount, 0));

  if (monthlyTotals.length < 3) return null;

  const first = monthlyTotals[0];
  const last = monthlyTotals[monthlyTotals.length - 1];
  const growthPct = ((last - first) / first) * 100;

  if (growthPct < 20) return null;

  return {
    id: "savings-trend",
    name: "Savings Streak",
    type: "saving",
    description: `Your monthly savings grew ${Math.round(growthPct)}% over ${monthlyTotals.length} months`,
    frequency: "Monthly",
    monthlyImpact: Math.round(last),
    annualImpact: Math.round(last * 12),
    goalImpactDays: 0,
    severity: "positive",
    emoji: "🔥",
    details: `Started at $${first}/mo, now saving $${last}/mo — that's a ${monthlyTotals.length}-month streak of growth`,
  };
}

function detectImpulseAmazon(
  transactions: Transaction[]
): BehavioralPattern | null {
  const amazonSunday = transactions.filter(
    (t) =>
      t.amount < 0 &&
      t.merchant.toLowerCase().includes("amazon") &&
      t.dayOfWeek === 0 &&
      t.hour >= 19 &&
      t.hour <= 22
  );

  if (amazonSunday.length < 5) return null;

  const monthlyImpact =
    Math.abs(amazonSunday.reduce((s, t) => s + t.amount, 0)) / 6;

  return {
    id: "impulse-amazon",
    name: "Sunday Night Shopping",
    type: "spending",
    description: `You tend to impulse-shop on Amazon Sunday evenings`,
    frequency: `~${Math.round(amazonSunday.length / 6)}x per month`,
    monthlyImpact: Math.round(monthlyImpact),
    annualImpact: Math.round(monthlyImpact * 12),
    goalImpactDays: Math.round((monthlyImpact / 200) * 30),
    severity: "moderate",
    emoji: "📱",
    details: `${amazonSunday.length} Sunday night Amazon orders, averaging $${(Math.abs(amazonSunday.reduce((s, t) => s + t.amount, 0)) / amazonSunday.length).toFixed(0)} each`,
  };
}
