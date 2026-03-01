"use client";

import { useMemo, useState, useEffect } from "react";
import { getMockTransactions, getMockUser } from "@/lib/data";
import { detectPatterns } from "@/lib/analysis";
import { generateInsights } from "@/lib/insights";
import { BehavioralPattern, Insight, Transaction, UserProfile } from "@/types";

interface UseTransactionsResult {
  user: UserProfile;
  transactions: Transaction[];
  patterns: BehavioralPattern[];
  insights: Insight[];
  isLoading: boolean;
  isDemo: boolean;
}

export function useTransactions(): UseTransactionsResult {
  const [user, setUser] = useState<UserProfile>(() => getMockUser());
  const [transactions, setTransactions] = useState<Transaction[]>(() => getMockTransactions());
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [userRes, txnRes] = await Promise.all([
          fetch("/api/user"),
          fetch("/api/transactions"),
        ]);

        if (cancelled) return;

        if (userRes.ok) {
          const userData = await userRes.json();
          if (!userData.notFound) {
            setUser(userData);
          }
        }

        if (txnRes.ok) {
          const txnData = await txnRes.json();
          if (txnData.length > 0) {
            setTransactions(txnData);
            setIsDemo(false);
          }
          // If empty array from authenticated user, keep mock for
          // the landing page DNA visualization, but mark as demo
        }
      } catch {
        // Keep mock data as fallback
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const patterns = useMemo(
    () => detectPatterns(transactions),
    [transactions]
  );

  const insights = useMemo(
    () => generateInsights(patterns, transactions, user),
    [patterns, transactions, user]
  );

  return { user, transactions, patterns, insights, isLoading, isDemo };
}
