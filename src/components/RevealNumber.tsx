"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";

interface RevealNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Large number with spring entrance + radial glow effect.
 */
export function RevealNumber({
  value,
  prefix = "$",
  suffix,
  className = "font-display text-6xl font-bold text-artha-accent",
}: RevealNumberProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Radial glow burst */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 0.8, 0], scale: [0.3, 1.5, 2] }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(108,99,255,0.4) 0%, rgba(108,99,255,0.1) 40%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Number */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 12,
          delay: 0.1,
        }}
      >
        <AnimatedNumber
          value={value}
          prefix={prefix}
          suffix={suffix}
          className={className}
          duration={1500}
        />
      </motion.div>
    </div>
  );
}
