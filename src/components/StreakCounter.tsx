"use client";

import { motion } from "framer-motion";

interface StreakCounterProps {
  months: number;
  label: string;
}

export function StreakCounter({ months, label }: StreakCounterProps) {
  return (
    <motion.div
      className="flex items-center gap-2 glass rounded-full px-4 py-2 inline-flex"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <span className="text-lg">🔥</span>
      <div>
        <p className="text-sm font-semibold">{months} month streak</p>
        <p className="text-[10px] text-artha-muted">{label}</p>
      </div>
    </motion.div>
  );
}
