"use client";

import { motion } from "framer-motion";

interface GoalProgressProps {
  name: string;
  current: number;
  target: number;
  emoji: string;
}

export function GoalProgress({ name, current, target, emoji }: GoalProgressProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="6"
          />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#6c63ff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg">{emoji}</span>
        </div>
      </div>
      <div>
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-artha-muted">
          ${current.toLocaleString()} / ${target.toLocaleString()}
        </p>
        <p className="text-xs text-artha-accent">{Math.round(percentage)}%</p>
      </div>
    </div>
  );
}
