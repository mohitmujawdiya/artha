"use client";

import { motion } from "framer-motion";

function getStreakEmoji(days: number): string {
  if (days >= 14) return "⭐🔥";
  if (days >= 7) return "🔥🔥";
  if (days >= 3) return "🔥";
  return "✨";
}

export function StreakBadge({ streak }: { streak: number }) {
  if (streak < 1) return null;

  const isMilestone = streak === 3 || streak === 7 || streak === 14 || streak === 30;

  return (
    <motion.div
      className="flex items-center gap-1 text-xs"
      animate={isMilestone ? { scale: [1, 1.2, 1] } : undefined}
      transition={{ duration: 0.4 }}
    >
      <span className="text-sm">{getStreakEmoji(streak)}</span>
      <span className="text-artha-muted font-medium tabular-nums">{streak}d</span>
    </motion.div>
  );
}
