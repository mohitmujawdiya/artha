"use client";

import { motion } from "framer-motion";
import { Fire, Star, Sparkle } from "@phosphor-icons/react";

function StreakIcon({ streak }: { streak: number }) {
  if (streak >= 14) {
    return (
      <span className="flex items-center gap-0.5">
        <Star size={14} weight="fill" className="text-amber-400" />
        <Fire size={14} weight="fill" className="text-orange-500" />
      </span>
    );
  }
  if (streak >= 7) {
    return (
      <span className="flex items-center gap-0.5">
        <Fire size={14} weight="fill" className="text-orange-500" />
        <Fire size={14} weight="fill" className="text-orange-500" />
      </span>
    );
  }
  if (streak >= 3) {
    return <Fire size={14} weight="fill" className="text-orange-500" />;
  }
  return <Sparkle size={14} weight="fill" className="text-artha-accent" />;
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
      <StreakIcon streak={streak} />
      <span className="text-artha-muted font-medium tabular-nums">{streak}d</span>
    </motion.div>
  );
}
