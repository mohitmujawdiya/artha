"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfettiCelebration } from "./ConfettiCelebration";

interface LevelUpModalProps {
  levelUp: { level: number; title: string; emoji: string } | null;
  onDismiss: () => void;
}

export function LevelUpModal({ levelUp, onDismiss }: LevelUpModalProps) {
  useEffect(() => {
    if (levelUp) {
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [levelUp, onDismiss]);

  return (
    <>
      <ConfettiCelebration trigger={!!levelUp} />
      <AnimatePresence>
        {levelUp && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
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
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {levelUp.emoji}
              </motion.div>
              <motion.p
                className="text-artha-accent text-sm font-semibold tracking-widest uppercase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Level Up!
              </motion.p>
              <motion.h2
                className="font-display text-3xl font-bold mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {levelUp.title}
              </motion.h2>
              <motion.p
                className="text-artha-muted mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Level {levelUp.level}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
