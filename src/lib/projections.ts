import { Projection, ProjectionAdjustment } from "@/types";

export const defaultAdjustments: ProjectionAdjustment[] = [
  {
    id: "meal-prep",
    label: "Meal prep Sundays",
    description: "Cook instead of ordering delivery on Sunday nights",
    monthlySavings: 62,
    difficulty: "Easy",
    enabled: false,
    emoji: "🍳",
  },
  {
    id: "coffee-home",
    label: "Coffee at home 3 days/week",
    description: "Brew at home instead of Starbucks 3 days a week",
    monthlySavings: 55,
    difficulty: "Moderate",
    enabled: false,
    emoji: "☕",
  },
  {
    id: "cancel-subs",
    label: "Cancel unused subscriptions",
    description: "Drop Netflix, Adobe CC, and Headspace",
    monthlySavings: 43,
    difficulty: "Easy",
    enabled: false,
    emoji: "📦",
  },
  {
    id: "payday-budget",
    label: "Reduce payday splurge 30%",
    description: "Set a 3-day post-payday budget",
    monthlySavings: 45,
    difficulty: "Moderate",
    enabled: false,
    emoji: "💰",
  },
];

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
