import { Transaction, UserProfile } from "@/types";
import rawData from "../../data/transactions.json";

const data = rawData as { user: UserProfile; transactions: Transaction[] };

export function getUser(): UserProfile {
  return data.user;
}

export function getTransactions(): Transaction[] {
  return data.transactions;
}

export function getTransactionsByMonth(
  transactions: Transaction[]
): Map<string, Transaction[]> {
  const byMonth = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = t.date.slice(0, 7); // "2025-09"
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(t);
  }
  return byMonth;
}

export function getTransactionsByDayOfWeek(
  transactions: Transaction[]
): Map<number, Transaction[]> {
  const byDay = new Map<number, Transaction[]>();
  for (let i = 0; i < 7; i++) byDay.set(i, []);
  for (const t of transactions) {
    byDay.get(t.dayOfWeek)!.push(t);
  }
  return byDay;
}

export function getTransactionsByCategory(
  transactions: Transaction[]
): Map<string, Transaction[]> {
  const byCat = new Map<string, Transaction[]>();
  for (const t of transactions) {
    if (!byCat.has(t.category)) byCat.set(t.category, []);
    byCat.get(t.category)!.push(t);
  }
  return byCat;
}

export function getExpenses(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.amount < 0);
}

export function totalAmount(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

export function averageDailySpending(transactions: Transaction[]): number {
  const expenses = getExpenses(transactions);
  if (expenses.length === 0) return 0;
  const dates = new Set(expenses.map((t) => t.date.slice(0, 10)));
  const total = Math.abs(totalAmount(expenses));
  return total / dates.size;
}
