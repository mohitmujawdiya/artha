"use client";

import { motion } from "framer-motion";

const pillars = [
  {
    title: "Behavioral Fingerprinting",
    description: "Detects 7+ spending patterns invisible to users",
    icon: "🧬",
  },
  {
    title: "Consequence Visualization",
    description: "Shows the 42-year compound effect of small changes",
    icon: "📈",
  },
  {
    title: "Proactive AI Coach",
    description: "Claude-powered guidance that meets users where they are",
    icon: "🤖",
  },
  {
    title: "Story-First UX",
    description: "Tappable cards that make finance feel like a story",
    icon: "✨",
  },
  {
    title: "Engagement Layer",
    description: "XP, levels, streaks & daily rings — Duolingo for finance",
    icon: "🎯",
  },
  {
    title: "Animated Landing",
    description: "DNA reveal creates an instant 'this is different' moment",
    icon: "🌟",
  },
];

export default function OutroPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      {/* One-liner */}
      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-artha-muted text-sm">The difference</p>
        <h1 className="font-display text-2xl font-bold mt-2 leading-tight">
          Credit Karma tells you{" "}
          <span className="text-artha-muted">what you spent</span>.
          <br />
          Artha tells you{" "}
          <span className="text-artha-accent">who you&apos;re becoming</span>.
        </h1>
      </motion.div>

      {/* Innovation Pillars */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs text-artha-muted text-center mb-4">
          Innovation Pillars
        </p>
        <div className="grid grid-cols-2 gap-3">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              className="glass rounded-2xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <span className="text-2xl">{pillar.icon}</span>
              <p className="font-semibold text-xs mt-2">{pillar.title}</p>
              <p className="text-[10px] text-artha-muted mt-1">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Architecture */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-xs text-artha-muted text-center mb-4">
          Architecture
        </p>
        <div className="glass rounded-2xl p-4 font-mono text-[10px] text-artha-muted leading-relaxed">
          <p className="text-artha-accent">Next.js 16 + TypeScript</p>
          <p className="ml-2">├── Behavioral Analysis Engine</p>
          <p className="ml-2">├── GPT-4o AI Coach</p>
          <p className="ml-2">├── Projection & Compound Math</p>
          <p className="ml-2">├── Framer Motion Animations</p>
          <p className="ml-2">├── XP & Engagement System</p>
          <p className="ml-2">└── ElevenLabs Voice TTS</p>
          <div className="border-t border-artha-surface mt-2 pt-2">
            <p className="text-artha-green">PNC Integration Vision:</p>
            <p className="ml-2">SDK embedded in PNC Mobile App</p>
            <p className="ml-2">Real transaction data via PNC API</p>
            <p className="ml-2">PNC product recommendations</p>
          </div>
        </div>
      </motion.div>

      {/* Logo */}
      <motion.div
        className="text-center mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <h2 className="font-display text-3xl font-bold text-artha-accent">
          artha
        </h2>
        <p className="text-artha-muted text-xs mt-1">
          Your financial story, told forward
        </p>
      </motion.div>
    </main>
  );
}
