"use client";

import { motion } from "framer-motion";
import { getLevelForXP, getNextLevel } from "@/lib/engagement";
import { LevelIcon } from "./LevelIcon";

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
      {/* Current level icon */}
      <div className="w-7 h-7 rounded-full bg-artha-accent/10 flex items-center justify-center flex-shrink-0">
        <LevelIcon icon={current.icon} size={14} />
      </div>

      {/* Bar + labels */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-artha-accent tabular-nums">
            Lv {current.level}
          </span>
          <span className="text-[10px] text-artha-muted tabular-nums">
            {xpInLevel}/{xpForLevel} XP
          </span>
        </div>
        <div className="h-2 bg-artha-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-artha-accent to-artha-accent/70 rounded-full"
            style={{ boxShadow: "0 0 8px rgba(108, 99, 255, 0.4)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </div>

      {/* Next level icon (dimmed) */}
      {next && (
        <div className="w-7 h-7 rounded-full bg-artha-surface flex items-center justify-center flex-shrink-0">
          <LevelIcon icon={next.icon} size={14} className="text-artha-muted/40" />
        </div>
      )}
    </div>
  );
}
