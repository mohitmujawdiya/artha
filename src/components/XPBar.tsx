"use client";

import { motion } from "framer-motion";
import { getLevelForXP, getNextLevel } from "@/lib/engagement";

interface XPBarProps {
  xp: number;
}

export function XPBar({ xp }: XPBarProps) {
  const current = getLevelForXP(xp);
  const next = getNextLevel(current.level);
  const xpInLevel = xp - current.xpRequired;
  const xpForLevel = next ? next.xpRequired - current.xpRequired : 1;
  const progress = next ? Math.min(xpInLevel / xpForLevel, 1) : 1;

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <span className="text-sm flex-shrink-0">
        {current.emoji}
      </span>
      <div className="flex-1 min-w-0">
        <div className="h-1.5 bg-artha-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-artha-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </div>
      <span className="text-[10px] text-artha-muted flex-shrink-0 tabular-nums">
        {xp}/{next?.xpRequired ?? xp}
      </span>
    </div>
  );
}
