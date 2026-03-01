"use client";

import { useState, useCallback } from "react";
import { Insight } from "@/types";

interface UseInsightsResult {
  currentIndex: number;
  currentInsight: Insight | null;
  progress: number;
  total: number;
  next: () => boolean;
  prev: () => void;
  goTo: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function useInsights(insights: Insight[]): UseInsightsResult {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    if (currentIndex < insights.length - 1) {
      setCurrentIndex((i) => i + 1);
      return false;
    }
    return true; // reached end
  }, [currentIndex, insights.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, insights.length - 1)));
    },
    [insights.length]
  );

  return {
    currentIndex,
    currentInsight: insights[currentIndex] ?? null,
    progress: insights.length > 0 ? (currentIndex + 1) / insights.length : 0,
    total: insights.length,
    next,
    prev,
    goTo,
    isFirst: currentIndex === 0,
    isLast: currentIndex === insights.length - 1,
  };
}
