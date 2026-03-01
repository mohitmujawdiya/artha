"use client";

import { motion } from "framer-motion";

/**
 * "Scanning your data" animation — orbiting dots with label.
 * Shows briefly before the typing indicator to make the AI feel alive.
 */
export function AnalyzingIndicator() {
  const DOT_COUNT = 8;

  return (
    <div className="flex justify-start mb-3">
      <div className="w-8 h-8 rounded-full bg-artha-accent/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
        <span className="text-sm">A</span>
      </div>
      <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-3">
        {/* Orbiting dots ring */}
        <div className="relative w-6 h-6">
          {Array.from({ length: DOT_COUNT }).map((_, i) => {
            const angle = (i / DOT_COUNT) * Math.PI * 2;
            const r = 10;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            return (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-artha-accent"
                style={{
                  left: `calc(50% + ${x}px - 3px)`,
                  top: `calc(50% + ${y}px - 3px)`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * (1.2 / DOT_COUNT),
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>
        <span className="text-xs text-artha-muted">
          Looking at your patterns...
        </span>
      </div>
    </div>
  );
}
