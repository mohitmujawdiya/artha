"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfettiCelebration } from "./ConfettiCelebration";
import { XPEvent } from "@/types";
import { XP_REWARDS } from "@/lib/engagement";

interface DailyCompleteModalProps {
  complete: boolean;
  awardXP: (event: XPEvent) => void;
}

export function DailyCompleteModal({ complete, awardXP }: DailyCompleteModalProps) {
  const [show, setShow] = useState(false);
  const [awarded, setAwarded] = useState(false);

  useEffect(() => {
    if (complete && !awarded) {
      setShow(true);
      setAwarded(true);
      awardXP({
        amount: XP_REWARDS.daily_complete,
        source: "daily_complete",
        label: "Daily Complete!",
      });
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [complete, awarded, awardXP]);

  return (
    <>
      <ConfettiCelebration trigger={show} />
      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShow(false)}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.div
                className="text-7xl mb-4"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                🎯
              </motion.div>
              <motion.p
                className="text-amber-400 text-sm font-semibold tracking-widest uppercase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Daily Complete!
              </motion.p>
              <motion.h2
                className="font-display text-2xl font-bold mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                All rings filled
              </motion.h2>
              <motion.p
                className="text-artha-accent font-semibold mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                +{XP_REWARDS.daily_complete} XP
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
