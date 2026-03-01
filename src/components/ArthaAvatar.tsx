"use client";

import { motion } from "framer-motion";

interface ArthaAvatarProps {
  size?: "sm" | "md";
  pulse?: boolean;
}

const sizes = {
  sm: { container: "w-8 h-8", orb: "w-5 h-5" },
  md: { container: "w-10 h-10", orb: "w-6 h-6" },
};

export function ArthaAvatar({ size = "sm", pulse = false }: ArthaAvatarProps) {
  const s = sizes[size];

  return (
    <div className={`${s.container} rounded-full bg-artha-surface flex items-center justify-center flex-shrink-0`}>
      <motion.div
        className={`${s.orb} rounded-full`}
        style={{
          background: "linear-gradient(135deg, #6c63ff 0%, #4ade80 100%)",
        }}
        animate={pulse ? { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] } : { scale: 1, opacity: 1 }}
        transition={pulse ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      />
    </div>
  );
}
