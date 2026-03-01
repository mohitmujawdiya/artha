"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SpendingDNA } from "@/components/SpendingDNA";
import { useTransactions } from "@/hooks/useTransactions";

interface Particle {
  width: number;
  height: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    width: Math.random() * 3 + 1,
    height: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));
}

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { patterns } = useTransactions();
  const [phase, setPhase] = useState<"hook" | "dna">("hook");
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles on client only to avoid hydration mismatch
  useEffect(() => {
    setParticles(generateParticles(40));
  }, []);

  // Redirect signed-in users away from landing
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const onboarded = localStorage.getItem("artha-onboarding-complete");
    if (onboarded === "true") {
      router.replace("/moments");
    } else {
      router.replace("/onboarding");
    }
  }, [isLoaded, isSignedIn, router]);

  // Auto-transition from hook to DNA after 3.5s
  useEffect(() => {
    if (phase !== "hook") return;
    const timer = setTimeout(() => setPhase("dna"), 3500);
    return () => clearTimeout(timer);
  }, [phase]);

  // Don't render anything until Clerk has loaded auth state
  if (!isLoaded || isSignedIn) {
    return <main className="h-screen bg-artha-bg" />;
  }

  return (
    <main
      className="h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      onClick={() => {
        if (phase === "hook") setPhase("dna");
      }}
    >
      {/* Particle/star background */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-artha-accent/30"
            style={{
              width: p.width,
              height: p.height,
              left: `${p.left}%`,
              top: `${p.top}%`,
            }}
            animate={{
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Phase: Hook ── */}
        {phase === "hook" && (
          <motion.div
            key="hook"
            className="text-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="font-display text-3xl font-bold text-artha-text leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Hey there, your money tells a story
            </motion.h1>

            <motion.p
              className="mt-6 text-lg text-artha-accent font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              style={{
                textShadow: "0 0 30px rgba(108, 99, 255, 0.5)",
              }}
            >
              Let&apos;s read yours
            </motion.p>
          </motion.div>
        )}

        {/* ── Phase: DNA ── */}
        {phase === "dna" && (
          <motion.div
            key="dna"
            className="flex flex-col items-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.p
              className="text-xs tracking-widest text-artha-accent/70 uppercase mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Financial DNA
            </motion.p>

            <motion.h2
              className="font-display text-2xl font-bold text-center mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              See How Your Money Moves
            </motion.h2>

            <SpendingDNA patterns={patterns} size={280} />

            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <p className="text-[10px] tracking-widest uppercase text-artha-muted">Money Personality</p>
              <p className="text-lg font-semibold text-artha-accent mt-1">Discover Yours</p>
              <p className="text-artha-muted text-sm mt-2 max-w-xs">
                We analyze your real transactions to find hidden patterns.
              </p>
            </motion.div>

            <motion.button
              className="mt-8 px-8 py-3 bg-artha-accent rounded-full font-semibold text-white text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push("/sign-up")}
            >
              Discover Your Story
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
