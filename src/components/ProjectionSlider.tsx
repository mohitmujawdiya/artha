"use client";

import { motion } from "framer-motion";
import { ProjectionAdjustment } from "@/types";
import { CookingPot, Coffee, Package, Wallet } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const LEVER_ICONS: Record<string, Icon> = {
  "cooking-pot": CookingPot,
  "coffee": Coffee,
  "package": Package,
  "wallet": Wallet,
};

interface ProjectionSliderProps {
  adjustment: ProjectionAdjustment;
  onToggle: (id: string) => void;
}

export function ProjectionSlider({
  adjustment,
  onToggle,
}: ProjectionSliderProps) {
  const IconComponent = LEVER_ICONS[adjustment.icon];

  return (
    <motion.button
      className={`glass rounded-2xl p-4 w-full text-left transition-all ${
        adjustment.enabled
          ? "border-artha-accent/40 shadow-lg shadow-artha-accent/5"
          : ""
      }`}
      whileTap={{ scale: 0.95 }}
      onClick={() => onToggle(adjustment.id)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-6">
          <div className="w-9 h-9 rounded-full bg-artha-accent/10 flex items-center justify-center flex-shrink-0">
            {IconComponent && (
              <IconComponent size={18} weight="duotone" className="text-artha-accent" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm">{adjustment.label}</p>
            <p className="text-xs text-artha-muted mt-0.5">
              {adjustment.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-artha-green font-medium">
                +${adjustment.monthlySavings}/mo
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                adjustment.difficulty === "Easy"
                  ? "bg-artha-green/10 text-artha-green"
                  : "bg-artha-accent/10 text-artha-accent"
              }`}>
                {adjustment.difficulty}
              </span>
            </div>
          </div>
        </div>
        <div
          className={`w-10 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ml-3 ${
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
    </motion.button>
  );
}
