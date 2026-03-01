import { BehavioralPattern, Projection, ProjectionAdjustment } from "@/types";

export const defaultAdjustments: ProjectionAdjustment[] = [
  {
    id: "meal-prep",
    label: "Meal prep Sundays",
    description: "Cook instead of ordering delivery on Sunday nights",
    monthlySavings: 62,
    difficulty: "Easy",
    enabled: false,
    icon: "cooking-pot",
  },
  {
    id: "coffee-home",
    label: "Coffee at home 3 days/week",
    description: "Brew at home instead of Starbucks 3 days a week",
    monthlySavings: 55,
    difficulty: "Moderate",
    enabled: false,
    icon: "coffee",
  },
  {
    id: "cancel-subs",
    label: "Cut subscriptions you don't need",
    description: "Review Netflix, Adobe CC, Headspace — are they all worth it?",
    monthlySavings: 16,
    difficulty: "Easy",
    enabled: false,
    icon: "package",
  },
  {
    id: "payday-budget",
    label: "Reduce payday splurge 30%",
    description: "Set a 3-day post-payday budget",
    monthlySavings: 45,
    difficulty: "Moderate",
    enabled: false,
    icon: "wallet",
  },
];

const PATTERN_TO_ADJUSTMENT: Record<string, { label: string; descriptionTemplate: string; savingsRatio: number; difficulty: "Easy" | "Moderate" | "Hard"; icon: string }> = {
  "sunday-night-orderer": {
    label: "Meal prep Sundays",
    descriptionTemplate: "Cook instead of ordering delivery ($IMPACT/mo)",
    savingsRatio: 0.75,
    difficulty: "Easy",
    icon: "cooking-pot",
  },
  "daily-coffee": {
    label: "Coffee at home 3 days/week",
    descriptionTemplate: "Brew at home instead of buying ($IMPACT/mo on coffee)",
    savingsRatio: 0.5,
    difficulty: "Moderate",
    icon: "coffee",
  },
  "subscription-creep": {
    label: "Cut subscriptions you don't need",
    descriptionTemplate: "Review $SUBS — are they all worth it?",
    savingsRatio: 0.5,
    difficulty: "Easy",
    icon: "package",
  },
  "payday-splurger": {
    label: "Reduce payday splurge 30%",
    descriptionTemplate: "Set a 3-day post-payday budget ($IMPACT/mo excess)",
    savingsRatio: 0.3,
    difficulty: "Moderate",
    icon: "wallet",
  },
};

export function buildAdjustmentsFromPatterns(patterns: BehavioralPattern[]): ProjectionAdjustment[] {
  const adjustments: ProjectionAdjustment[] = [];

  for (const pattern of patterns) {
    const config = PATTERN_TO_ADJUSTMENT[pattern.id];
    if (!config || pattern.monthlyImpact <= 0 || pattern.severity === "positive") continue;

    let description = config.descriptionTemplate.replace("$IMPACT", `$${pattern.monthlyImpact}`);
    // For subscriptions, inject the actual service names from pattern details
    if (pattern.id === "subscription-creep" && pattern.details) {
      const subNames = pattern.details
        .split(", ")
        .map((s) => s.split(":")[0].trim())
        .filter(Boolean);
      description = description.replace("$SUBS", subNames.join(", ") || "unused subscriptions");
    }

    adjustments.push({
      id: pattern.id,
      label: config.label,
      description,
      monthlySavings: Math.round(pattern.monthlyImpact * config.savingsRatio),
      difficulty: config.difficulty,
      enabled: false,
      icon: config.icon,
    });
  }

  return adjustments;
}

export function calculateProjection(
  currentSavings: number,
  monthlySavings: number,
  adjustments: ProjectionAdjustment[],
  months: number = 60
): Projection {
  const additionalSavings = adjustments
    .filter((a) => a.enabled)
    .reduce((sum, a) => sum + a.monthlySavings, 0);

  const optimizedMonthly = monthlySavings + additionalSavings;

  const monthsArray: number[] = [];
  const currentPath: number[] = [];
  const optimizedPath: number[] = [];

  for (let i = 0; i <= months; i++) {
    monthsArray.push(i);
    currentPath.push(currentSavings + monthlySavings * i);
    optimizedPath.push(currentSavings + optimizedMonthly * i);
  }

  const emergencyTarget = 5000;
  const remaining = emergencyTarget - currentSavings;
  const monthsToEmergencyFund =
    monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : 999;
  const monthsToEmergencyFundOptimized =
    optimizedMonthly > 0 ? Math.ceil(remaining / optimizedMonthly) : 999;

  return {
    months: monthsArray,
    currentPath,
    optimizedPath,
    totalSaved: currentPath[months],
    totalOptimized: optimizedPath[months],
    monthsToEmergencyFund,
    monthsToEmergencyFundOptimized,
  };
}

export function calculateCompoundGrowth(
  monthlyContribution: number,
  annualReturn: number = 0.07,
  years: number = 42
): number {
  const monthlyReturn = annualReturn / 12;
  const months = years * 12;
  let total = 0;
  for (let i = 0; i < months; i++) {
    total = (total + monthlyContribution) * (1 + monthlyReturn);
  }
  return Math.round(total);
}
