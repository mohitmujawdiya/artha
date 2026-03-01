"use client";

import { motion } from "framer-motion";
import { Fire, Star, Sparkle } from "@phosphor-icons/react";

function StreakIcon({ streak }: { streak: number }) {
  if (streak >= 14) {
    return (
      <span className="flex items-center gap-0.5">
        <Star size={14} weight="fill" className="text-white" />
        <Fire size={14} weight="fill" className="text-white" />
      </span>
    );
  }
  if (streak >= 7) {
    return (
      <span className="flex items-center gap-0.5">
        <Fire size={14} weight="fill" className="text-white" />
        <Fire size={14} weight="fill" className="text-white" />
      </span>
    );
  }
  if (streak >= 3) {
    return <Fire size={14} weight="fill" className="text-white" />;
  }
  return <Sparkle size={14} weight="fill" className="text-white" />;
}

function badgeStyles(streak: number) {
  if (streak >= 14) return "bg-gradient-to-r from-amber-500 to-orange-500";
  if (streak >= 7) return "bg-orange-500";
  if (streak >= 3) return "bg-orange-400";
  return "bg-artha-accent";
}

export function StreakBadge({ streak }: { streak: number }) {
  if (streak < 1) return null;

  const isMilestone = streak === 3 || streak === 7 || streak === 14 || streak === 30;

  return (
    <motion.div
      className={`flex items-center gap-1 text-xs rounded-full px-2.5 py-1 ${badgeStyles(streak)}`}
      animate={isMilestone ? { scale: [1, 1.2, 1] } : undefined}
      transition={{ duration: 0.4 }}
    >
      <StreakIcon streak={streak} />
      <span className="text-white font-semibold tabular-nums">{streak}d</span>
    </motion.div>
  );
}
