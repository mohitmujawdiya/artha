"use client";

import { motion } from "framer-motion";
import { ProjectionAdjustment } from "@/types";

interface ProjectionSliderProps {
  adjustment: ProjectionAdjustment;
  onToggle: (id: string) => void;
}

export function ProjectionSlider({
  adjustment,
  onToggle,
}: ProjectionSliderProps) {
  return (
    <motion.button
      className={`glass rounded-2xl p-4 w-full text-left transition-all ${
        adjustment.enabled
          ? "border-artha-accent/40 shadow-lg shadow-artha-accent/10"
          : ""
      }`}
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(adjustment.id)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xl">{adjustment.emoji}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{adjustment.label}</p>
            <p className="text-xs text-artha-muted truncate">
              {adjustment.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-2">
          <span className="text-artha-green font-semibold text-sm whitespace-nowrap">
            +${adjustment.monthlySavings}/mo
          </span>
          <div
            className={`w-10 h-6 rounded-full flex items-center transition-colors ${
              adjustment.enabled ? "bg-artha-accent" : "bg-artha-surface"
            }`}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full mx-1"
              animate={{ x: adjustment.enabled ? 16 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </div>
      </div>
      <div className="mt-2">
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            adjustment.difficulty === "Easy"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-amber-500/20 text-amber-400"
          }`}
        >
          {adjustment.difficulty}
        </span>
      </div>
    </motion.button>
  );
}
