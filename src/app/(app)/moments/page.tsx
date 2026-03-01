"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardStack } from "@/components/CardStack";
import { SpendingDNA } from "@/components/SpendingDNA";
import { useTransactions } from "@/hooks/useTransactions";

export default function MomentsPage() {
  const { insights, patterns, transactions } = useTransactions();
  const [showDNA, setShowDNA] = useState(true);

  return (
    <main className="pb-16">
      <AnimatePresence mode="wait">
        {showDNA ? (
          <motion.div
            key="dna"
            className="h-[calc(100svh-5rem)] flex flex-col items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="text-xs tracking-widest text-artha-accent/70 uppercase mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Your Financial DNA
            </motion.p>
            <motion.h1
              className="font-display text-2xl font-bold text-center mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              This is how your money moves
            </motion.h1>

            <SpendingDNA patterns={patterns} size={300} />

            <motion.p
              className="text-artha-muted text-sm text-center mt-6 max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              Your unique spending fingerprint — shaped by {patterns.length}{" "}
              behavioral patterns we detected.
            </motion.p>

            <motion.button
              className="mt-8 px-6 py-3 bg-artha-accent rounded-full font-semibold text-white text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDNA(false)}
            >
              See your story
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <CardStack insights={insights} patterns={patterns} transactions={transactions} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
