"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  angle: number;
  speed: number;
  color: string;
  size: number;
}

const COLORS = ["#6c63ff", "#4ade80", "#fbbf24", "#a78bfa", "#60a5fa"];

export function ConfettiCelebration({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      angle: Math.random() * Math.PI * 2,
      speed: 2 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 6,
    }));

    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 1500);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="fixed pointer-events-none z-50 rounded-sm"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: "40%",
          }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.speed * 80,
            y: Math.sin(p.angle) * p.speed * 60 + 200,
            opacity: 0,
            scale: 0.5,
            rotate: Math.random() * 720 - 360,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ))}
    </AnimatePresence>
  );
}
