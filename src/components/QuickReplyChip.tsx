"use client";

import { motion } from "framer-motion";

interface QuickReplyChipProps {
  label: string;
  onClick: (label: string) => void;
  index?: number;
}

export function QuickReplyChip({ label, onClick, index = 0 }: QuickReplyChipProps) {
  return (
    <motion.button
      className="glass px-4 py-2 rounded-full text-sm text-artha-text whitespace-nowrap hover:border-artha-accent/40 transition-colors"
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onClick(label)}
    >
      {label}
    </motion.button>
  );
}
