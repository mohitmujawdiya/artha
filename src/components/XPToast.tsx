"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XPEvent } from "@/types";

const BIG_SOURCES = new Set(["full_story", "all_levers", "daily_complete", "challenge_accepted"]);

export function XPToast({ events }: { events: XPEvent[] }) {
  return (
    <div className="fixed top-3 right-3 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {events.slice(0, 3).map((event, i) => {
          const isGold = BIG_SOURCES.has(event.source);
          return (
            <motion.div
              key={`${event.source}-${event.amount}-${i}`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border ${
                isGold
                  ? "bg-amber-500/20 border-amber-400/30 text-amber-300"
                  : "bg-artha-surface/80 border-artha-accent/20 text-artha-text"
              }`}
              initial={{ opacity: 0, x: 40, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <span className={isGold ? "text-amber-400" : "text-artha-accent"}>
                +{event.amount} XP
              </span>
              <span className="text-artha-muted ml-1.5">{event.label}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
