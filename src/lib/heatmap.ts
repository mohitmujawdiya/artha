import { Transaction } from "@/types";

export interface HeatmapCell {
  day: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  total: number;
  count: number;
  topMerchant: string;
}

export interface HeatmapData {
  cells: HeatmapCell[][];
  maxTotal: number;
}

/**
 * Aggregates expense transactions into a 7×24 matrix (day × hour).
 */
export function buildHeatmap(transactions: Transaction[]): HeatmapData {
  // Init 7×24 grid
  const cells: HeatmapCell[][] = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      total: 0,
      count: 0,
      topMerchant: "",
    }))
  );

  // Merchant frequency tracker per cell
  const merchantCounts: Map<string, Map<string, number>> = new Map();

  const expenses = transactions.filter(
    (t) => t.amount < 0 && t.category !== "income" && t.category !== "savings"
  );

  for (const t of expenses) {
    const cell = cells[t.dayOfWeek][t.hour];
    cell.total += Math.abs(t.amount);
    cell.count += 1;

    const key = `${t.dayOfWeek}-${t.hour}`;
    if (!merchantCounts.has(key)) merchantCounts.set(key, new Map());
    const mc = merchantCounts.get(key)!;
    mc.set(t.merchant, (mc.get(t.merchant) || 0) + 1);
  }

  // Resolve top merchant per cell
  let maxTotal = 0;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const cell = cells[d][h];
      if (cell.total > maxTotal) maxTotal = cell.total;

      const key = `${d}-${h}`;
      const mc = merchantCounts.get(key);
      if (mc) {
        let topCount = 0;
        mc.forEach((count, merchant) => {
          if (count > topCount) {
            topCount = count;
            cell.topMerchant = merchant;
          }
        });
      }
    }
  }

  return { cells, maxTotal };
}
