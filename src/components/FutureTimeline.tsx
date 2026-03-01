"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, useScroll } from "framer-motion";
import { ProjectionAdjustment } from "@/types";
import {
  calculateProjection,
  calculateCompoundGrowth,
  defaultAdjustments,
} from "@/lib/projections";
import { ArrowRight, TrendUp } from "@phosphor-icons/react";
import { ProjectionSlider } from "./ProjectionSlider";
import { DualPathChart } from "./DualPathChart";
import { AnimatedNumber } from "./AnimatedNumber";
import { RevealNumber } from "./RevealNumber";

const SECTION_COUNT = 3;

interface FutureTimelineProps {
  onLeverToggle?: (id: string) => void;
}

export function FutureTimeline({ onLeverToggle }: FutureTimelineProps) {
  const [adjustments, setAdjustments] = useState<ProjectionAdjustment[]>(
    defaultAdjustments
  );
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const chartSectionRef = useRef<HTMLElement>(null);

  const setSectionRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      sectionRefs.current[index] = el;
      if (index === 1) chartSectionRef.current = el;
    },
    []
  );

  // IntersectionObserver to track active section for progress dots
  useEffect(() => {
    const container = containerRef.current;
    const sections = sectionRefs.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let maxIndex = activeSection;
        entries.forEach((entry) => {
          const idx = sections.indexOf(entry.target as HTMLElement);
          if (idx !== -1 && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            maxIndex = idx;
          }
        });
        if (maxRatio > 0) setActiveSection(maxIndex);
      },
      { root: container, threshold: [0, 0.3, 0.6, 1] }
    );

    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const toggleAdjustment = (id: string) => {
    setAdjustments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, enabled: !a.enabled } : a
      )
    );
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

  // Scroll-linked progress scoped to the chart+levers section
  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: chartSectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto overflow-x-hidden snap-y snap-proximity no-scrollbar">
      {/* Progress dots — vertical, right edge */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
        {Array.from({ length: SECTION_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              i === activeSection
                ? "h-6 bg-artha-accent"
                : i < activeSection
                  ? "h-1.5 bg-artha-accent/50"
                  : "h-1.5 bg-artha-surface"
            }`}
          />
        ))}
      </div>

      {/* Act 1: Where you are */}
      <motion.section
        ref={setSectionRef(0)}
        className="snap-start h-[100svh] flex flex-col items-center justify-center px-4"
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
      <section ref={setSectionRef(1)} className="snap-start px-4">
        {/* Sticky chart header */}
        <motion.div
          className="sticky top-0 z-10 pt-6 pb-4 bg-artha-bg/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="font-display text-3xl font-bold text-center"
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
          <motion.p
            className="text-xs tracking-widest text-artha-accent/60 uppercase text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Toggle to see the chart update
          </motion.p>
          <motion.h3
            className="font-display text-2xl font-bold text-center mt-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Your Levers
          </motion.h3>

          <div className="flex flex-col gap-3 mt-6 max-w-sm mx-auto">
            {adjustments.map((adj, i) => (
              <motion.div
                key={adj.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                  delay: i * 0.15,
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
              <div className="flex items-center justify-center gap-2 mt-1">
                <TrendUp size={20} weight="bold" className="text-artha-green" />
                <p className="font-display text-2xl font-bold text-artha-green">
                  +${additionalMonthly}/mo
                </p>
              </div>
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
            <h3 className="font-display text-2xl font-bold">
              Emergency Fund Race
            </h3>

            <div className="flex justify-center gap-8 mt-6">
              <div>
                <p className="text-artha-muted text-xs mb-2">Current pace</p>
                <div className="font-display text-5xl font-bold text-artha-muted">
                  {projection.monthsToEmergencyFund}
                </div>
                <p className="text-xs text-artha-muted mt-1">months</p>
              </div>
              <div className="self-center">
                <ArrowRight size={20} className="text-artha-accent" />
              </div>
              <div>
                <p className="text-artha-accent text-xs mb-2">Optimized</p>
                <div className="font-display text-5xl font-bold text-artha-accent">
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
        ref={setSectionRef(2)}
        className="snap-start min-h-[100svh] flex flex-col items-center justify-center px-4 py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="font-display text-3xl font-bold text-center"
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
