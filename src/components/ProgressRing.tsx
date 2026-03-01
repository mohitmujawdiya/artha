"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface ProgressRingProps {
  progress: number; // 0-1
  children: ReactNode;
  size?: number;
}

export function ProgressRing({ progress, children, size = 32 }: ProgressRingProps) {
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const isFull = progress >= 1;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(108, 99, 255, 0.15)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isFull ? "#4ade80" : "#6c63ff"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />
      </svg>
      {/* Glow pulse when full */}
      {isFull && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0px rgba(74, 222, 128, 0)",
              "0 0 8px rgba(74, 222, 128, 0.4)",
              "0 0 0px rgba(74, 222, 128, 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
