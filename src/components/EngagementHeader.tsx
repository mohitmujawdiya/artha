"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEngagement } from "./EngagementProvider";
import { StreakBadge } from "./StreakBadge";
import { XPBar } from "./XPBar";

export function EngagementHeader() {
  const { state } = useEngagement();
  const [showXP, setShowXP] = useState(false);

  return (
    <div className="z-30 absolute top-3 left-4">
      <button onClick={() => setShowXP((v) => !v)}>
        <StreakBadge streak={state.streak} />
      </button>

      <AnimatePresence>
        {showXP && (
          <motion.div
            className="absolute top-full left-0 mt-2 w-56 glass rounded-2xl p-3 border border-white/10"
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <XPBar xp={state.xp} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
