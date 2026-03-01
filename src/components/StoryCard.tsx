"use client";

import { motion } from "framer-motion";
import { Insight, BehavioralPattern, Transaction } from "@/types";
import { AnimatedNumber } from "./AnimatedNumber";
import { SpendingDNA } from "./SpendingDNA";
import { SpendingHeatmap } from "./SpendingHeatmap";

interface StoryCardProps {
  insight: Insight;
  patterns?: BehavioralPattern[];
  transactions?: Transaction[];
  animated?: boolean;
  onAction?: () => void;
}

const typeBadge: Record<string, { label: string; bg: string }> = {
  win: { label: "WIN", bg: "bg-emerald-500/20 text-emerald-400" },
  discovery: { label: "DISCOVERY", bg: "bg-purple-500/20 text-purple-400" },
  nudge: { label: "NUDGE", bg: "bg-amber-500/20 text-amber-400" },
  goal: { label: "GOAL", bg: "bg-artha-accent/20 text-artha-accent" },
  challenge: { label: "CHALLENGE", bg: "bg-artha-accent/20 text-artha-accent" },
  rhythm: { label: "YOUR RHYTHM", bg: "bg-violet-500/20 text-violet-400" },
};

export function StoryCard({
  insight,
  patterns,
  transactions,
  animated = true,
  onAction,
}: StoryCardProps) {
  const badge = typeBadge[insight.type] || typeBadge.discovery;
  const isRhythm = insight.visualization === "heatmap";

  // When animated=false, skip all entrance animations (content is just visible)
  const initial = animated ? undefined : false;

  return (
    <div
      className={`flex flex-col justify-center items-center min-h-[60svh] px-5 py-6 rounded-3xl bg-artha-surface bg-gradient-to-b ${insight.gradient} border border-white/5 relative`}
    >
      {/* Type badge */}
      <motion.div
        initial={initial ?? { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span
          className={`text-xs font-semibold tracking-widest px-3 py-1 rounded-full ${badge.bg}`}
        >
          {badge.label}
        </span>
      </motion.div>

      {/* Title */}
      <motion.h2
        className="font-display text-3xl font-bold text-center mt-6"
        initial={initial ?? { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {insight.title}
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        className="text-artha-muted text-center mt-2"
        initial={initial ?? { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: animated ? 0.1 : 0 }}
      >
        {insight.subtitle}
      </motion.p>

      {/* Heatmap visualization for rhythm cards */}
      {isRhythm && transactions ? (
        <motion.div
          className="mt-6 w-full"
          initial={initial ?? { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: animated ? 0.2 : 0 }}
        >
          <SpendingHeatmap transactions={transactions} />
        </motion.div>
      ) : (
        /* Animated metric */
        <motion.div
          className="mt-8 text-center"
          initial={initial ?? { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: animated ? 0.2 : 0 }}
        >
          <AnimatedNumber
            value={insight.metricValue}
            prefix={insight.metricPrefix}
            suffix={insight.metricSuffix}
            decimals={insight.metricValue % 1 !== 0 ? 1 : 0}
            className="font-display text-5xl font-bold"
            duration={animated ? 800 : 0}
          />
          <p className="text-sm text-artha-muted mt-1">{insight.metric}</p>
        </motion.div>
      )}

      {/* Mini DNA on win cards */}
      {insight.type === "win" && patterns && patterns.length > 0 && (
        <motion.div
          className="mt-6 flex justify-center"
          initial={initial ?? { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: animated ? 0.3 : 0 }}
        >
          <SpendingDNA patterns={patterns} size={140} mini />
        </motion.div>
      )}

      {/* Body text */}
      <motion.p
        className="text-artha-text/80 text-center mt-6 max-w-xs leading-relaxed"
        initial={initial ?? { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: animated
            ? isRhythm
              ? 0.6
              : insight.type === "win"
                ? 0.5
                : 0.3
            : 0,
        }}
      >
        {insight.body}
      </motion.p>

      {/* Action button (for challenges) */}
      {insight.action && (
        <motion.button
          className="mt-8 px-6 py-3 bg-artha-accent rounded-full font-semibold text-white"
          initial={initial ?? { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: animated ? 0.4 : 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
        >
          {insight.action}
        </motion.button>
      )}
    </div>
  );
}
