"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function IntroPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="font-display text-5xl font-bold text-artha-accent">
          artha
        </h1>
        <p className="text-artha-muted mt-2 text-sm tracking-wide">
          your financial story, told forward
        </p>
      </motion.div>

      {/* Problem statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-12 text-center max-w-xs"
      >
        <div className="glass rounded-2xl p-6">
          <p className="text-sm font-semibold text-artha-text">
            Meet Maya Chen, 23
          </p>
          <p className="text-xs text-artha-muted mt-2 leading-relaxed">
            She uses 3 finance apps. They show her what she spent last month.
            None of them show her{" "}
            <span className="text-artha-accent font-semibold">
              who she&apos;s becoming
            </span>
            .
          </p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 2.5 }}
        className="mt-10"
      >
        <Link href="/moments">
          <motion.button
            className="bg-artha-accent text-white font-semibold px-8 py-3 rounded-full text-sm"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            See Maya&apos;s story
          </motion.button>
        </Link>
      </motion.div>

      {/* Subtle brand */}
      <motion.p
        className="absolute bottom-8 text-[10px] text-artha-muted/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        Built for the PNC Financial Challenge
      </motion.p>
    </main>
  );
}
