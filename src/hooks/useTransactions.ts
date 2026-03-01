"use client";

import { useMemo } from "react";
import { getTransactions, getUser } from "@/lib/data";
import { detectPatterns } from "@/lib/analysis";
import { generateInsights } from "@/lib/insights";
import { BehavioralPattern, Insight, Transaction, UserProfile } from "@/types";

interface UseTransactionsResult {
  user: UserProfile;
  transactions: Transaction[];
  patterns: BehavioralPattern[];
  insights: Insight[];
}

export function useTransactions(): UseTransactionsResult {
  const user = useMemo(() => getUser(), []);
  const transactions = useMemo(() => getTransactions(), []);

  const patterns = useMemo(
    () => detectPatterns(transactions),
    [transactions]
  );

  const insights = useMemo(
    () => generateInsights(patterns, transactions, user),
    [patterns, transactions, user]
  );

  return { user, transactions, patterns, insights };
}
