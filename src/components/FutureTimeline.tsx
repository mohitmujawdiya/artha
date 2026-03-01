"use client";

import { useState, useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ProjectionAdjustment } from "@/types";
import {
  calculateProjection,
  calculateCompoundGrowth,
  defaultAdjustments,
} from "@/lib/projections";
import { ProjectionSlider } from "./ProjectionSlider";
import { DualPathChart } from "./DualPathChart";
import { AnimatedNumber } from "./AnimatedNumber";
import { RevealNumber } from "./RevealNumber";
import { ConfettiCelebration } from "./ConfettiCelebration";

interface FutureTimelineProps {
  onLeverToggle?: (id: string) => void;
}

export function FutureTimeline({ onLeverToggle }: FutureTimelineProps) {
  const [adjustments, setAdjustments] = useState<ProjectionAdjustment[]>(
    defaultAdjustments
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleAdjustment = (id: string) => {
    setAdjustments((prev) => {
      const next = prev.map((a) =>
        a.id === id ? { ...a, enabled: !a.enabled } : a
      );
      // Check if all enabled after toggle
      if (next.every((a) => a.enabled)) {
        setTimeout(() => setShowConfetti(true), 300);
      }
      return next;
    });
    onLeverToggle?.(id);
  };

  const currentMonthlySavings = 200;
  const currentSavings = 1840;

  const projection = useMemo(
    () =>
      calculateProjection(currentSavings, currentMonthlySavings, adjustments, 60),
    [adjustments]
  );

  const additionalMonthly = adjustments
    .filter((a) => a.enabled)
    .reduce((sum, a) => sum + a.monthlySavings, 0);

  const compoundTotal = useMemo(
    () => calculateCompoundGrowth(additionalMonthly, 0.07, 42),
    [additionalMonthly]
  );

  const allEnabled = adjustments.every((a) => a.enabled);

  // Scroll-linked progress for chart draw animation
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto overflow-x-hidden pb-16">
      <ConfettiCelebration trigger={showConfetti} />

      {/* Act 1: Where you are */}
      <motion.section
        className="h-[100svh] flex flex-col items-center justify-center px-4"
      >
        <motion.p
          className="text-xs tracking-widest text-artha-accent/60 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Where you are
        </motion.p>

        <motion.div
          className="mt-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="font-display text-6xl font-bold text-artha-text">
            $
          </span>
          <AnimatedNumber
            value={currentSavings}
            className="font-display text-6xl font-bold text-artha-text"
            duration={1200}
          />
        </motion.div>

        <motion.p
          className="text-artha-muted text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          current savings
        </motion.p>

        <motion.div
          className="flex gap-6 mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div>
            <p className="font-display text-lg font-semibold">$3,200</p>
            <p className="text-xs text-artha-muted">monthly income</p>
          </div>
          <div className="w-px bg-artha-surface" />
          <div>
            <p className="font-display text-lg font-semibold text-artha-green">
              $200/mo
            </p>
            <p className="text-xs text-artha-muted">saving rate</p>
          </div>
        </motion.div>

        <motion.p
          className="text-artha-muted/50 text-xs mt-12 animate-bounce"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Scroll to see your future
        </motion.p>
      </motion.section>

      {/* Act 2+3: Chart (sticky) + Levers */}
      <section className="px-4">
        {/* Sticky chart header */}
        <motion.div
          className="sticky top-0 z-10 pt-6 pb-4 bg-[#0a0a0f]/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="font-display text-2xl font-bold text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Two Paths Diverge
          </motion.h2>

          <motion.div
            className="mt-4 w-full max-w-sm mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <DualPathChart
              projection={projection}
              months={60}
              progress={scrollYProgress}
            />
          </motion.div>

          <div className="flex justify-between mt-3 px-2 w-full max-w-sm mx-auto">
            <div className="text-center">
              <p className="text-xs text-artha-muted">Current path</p>
              <p className="font-display text-lg text-artha-muted">
                ${projection.totalSaved.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-artha-accent">Optimized path</p>
              <p className="font-display text-lg text-artha-accent">
                ${projection.totalOptimized.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Levers scroll beneath the sticky chart */}
        <motion.div
          className="pt-8 pb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h3
            className="font-display text-xl font-bold text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Your Levers
          </motion.h3>
          <motion.p
            className="text-artha-muted text-center mt-2 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Toggle to see the chart update in real-time
          </motion.p>

          <div className="flex flex-col gap-3 mt-6 max-w-sm mx-auto">
            {adjustments.map((adj, i) => (
              <motion.div
                key={adj.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: i * 0.12,
                }}
              >
                <ProjectionSlider
                  adjustment={adj}
                  onToggle={toggleAdjustment}
                />
              </motion.div>
            ))}
          </div>

          {additionalMonthly > 0 && (
            <motion.div
              className="mt-6 glass rounded-2xl p-4 text-center max-w-sm mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-sm text-artha-muted">Total additional savings</p>
              <p className="font-display text-2xl font-bold text-artha-green mt-1">
                +${additionalMonthly}/mo
              </p>
            </motion.div>
          )}

          {/* Emergency Fund Race */}
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-display text-xl font-bold">
              Emergency Fund Race
            </h3>

            <div className="flex justify-center gap-8 mt-6">
              <div>
                <p className="text-artha-muted text-xs mb-2">Current pace</p>
                <div className="font-display text-4xl font-bold text-artha-muted">
                  {projection.monthsToEmergencyFund}
                </div>
                <p className="text-xs text-artha-muted mt-1">months</p>
              </div>
              <div className="text-artha-accent text-2xl self-center">→</div>
              <div>
                <p className="text-artha-accent text-xs mb-2">Optimized</p>
                <div className="font-display text-4xl font-bold text-artha-accent">
                  <AnimatedNumber
                    value={projection.monthsToEmergencyFundOptimized}
                    duration={800}
                  />
                </div>
                <p className="text-xs text-artha-accent mt-1">months</p>
              </div>
            </div>

            <p className="text-artha-muted text-sm mt-4">
              {projection.monthsToEmergencyFund -
                projection.monthsToEmergencyFundOptimized >
              0
                ? `That's ${projection.monthsToEmergencyFund - projection.monthsToEmergencyFundOptimized} months sooner to financial safety.`
                : "Toggle some levers above to see the difference."}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Act 4: The Reveal */}
      <motion.section
        className="flex flex-col items-center justify-center px-4 py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="font-display text-2xl font-bold text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          The 42-Year Effect
        </motion.h2>

        <motion.p
          className="text-artha-muted text-sm mt-3 text-center max-w-xs"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          If you invested the extra ${additionalMonthly}/mo from age 23 to 65 at
          7% return...
        </motion.p>

        <div className="mt-8 mb-6 min-h-[100px] flex items-center justify-center">
          {allEnabled ? (
            <RevealNumber
              value={compoundTotal}
              className="font-display text-6xl font-bold text-artha-accent"
            />
          ) : (
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="font-display text-6xl font-bold text-artha-muted/30">
                $???
              </p>
              <p className="text-artha-muted text-sm mt-4">
                Turn on all the levers to see the magic number
              </p>
            </motion.div>
          )}
        </div>

        {allEnabled && (
          <motion.p
            className="text-artha-accent/80 text-sm text-center max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            That&apos;s the power of small changes compounded over time.
          </motion.p>
        )}
      </motion.section>
    </div>
  );
}
