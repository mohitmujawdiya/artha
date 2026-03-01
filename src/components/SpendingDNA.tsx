"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BehavioralPattern } from "@/types";
import { computeDNA, dnaPath } from "@/lib/dna";

interface SpendingDNAProps {
  patterns: BehavioralPattern[];
  size?: number;
  mini?: boolean;
}

export function SpendingDNA({
  patterns,
  size = 280,
  mini = false,
}: SpendingDNAProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - (mini ? 20 : 50);

  const dna = useMemo(
    () => computeDNA(patterns, cx, cy, maxR),
    [patterns, cx, cy, maxR]
  );

  const shapePath = useMemo(() => dnaPath(dna.points), [dna.points]);

  // Concentric guide rings
  const rings = mini ? [0.5, 1.0] : [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="dna-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6c63ff" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#6c63ff" stopOpacity={0.08} />
          </radialGradient>
          <radialGradient id="dna-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6c63ff" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#6c63ff" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <circle cx={cx} cy={cy} r={maxR + 10} fill="url(#dna-glow)" />

        {/* Guide rings */}
        {rings.map((r) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={maxR * r}
            fill="none"
            stroke="rgba(108, 99, 255, 0.08)"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {dna.axes.map((axis, i) => (
          <motion.line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={cx + maxR * Math.cos(axis.angle)}
            y2={cy + maxR * Math.sin(axis.angle)}
            stroke="rgba(108, 99, 255, 0.15)"
            strokeWidth={1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
          />
        ))}

        {/* Filled shape */}
        {shapePath && (
          <motion.path
            d={shapePath}
            fill="url(#dna-fill)"
            stroke="#6c63ff"
            strokeWidth={2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          />
        )}

        {/* Data points */}
        {dna.points.map((pt, i) => (
          <motion.circle
            key={`point-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={activeIdx === i ? 6 : 4}
            fill={activeIdx === i ? "#fbbf24" : "#6c63ff"}
            stroke={activeIdx === i ? "#fbbf24" : "rgba(108,99,255,0.6)"}
            strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
            onPointerEnter={() => setActiveIdx(i)}
            onPointerLeave={() => setActiveIdx(null)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>

      {/* Labels around the outside */}
      {!mini &&
        dna.axes.map((axis, i) => {
          const labelR = maxR + 30;
          const lx = cx + labelR * Math.cos(axis.angle);
          const ly = cy + labelR * Math.sin(axis.angle);
          const isLeft = Math.cos(axis.angle) < -0.1;
          const isCenter = Math.abs(Math.cos(axis.angle)) < 0.1;

          return (
            <motion.div
              key={`label-${i}`}
              className="absolute text-center pointer-events-none"
              style={{
                left: lx,
                top: ly,
                transform: `translate(${isCenter ? "-50%" : isLeft ? "-100%" : "0%"}, -50%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: activeIdx === i ? 1 : 0.7 }}
              transition={{ duration: 0.4, delay: 0.8 + i * 0.06 }}
            >
              <span className="text-sm">{axis.emoji}</span>
              <p
                className={`text-[9px] leading-tight max-w-[70px] ${
                  activeIdx === i ? "text-artha-accent" : "text-artha-muted"
                }`}
              >
                {axis.label}
              </p>
            </motion.div>
          );
        })}

      {/* Tooltip */}
      {activeIdx !== null && !mini && (
        <motion.div
          className="absolute glass rounded-xl px-3 py-2 pointer-events-none z-10"
          style={{ left: cx - 70, top: cy - 20 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-xs font-semibold text-artha-accent">
            {dna.axes[activeIdx].emoji} {dna.axes[activeIdx].label}
          </p>
          <p className="text-[10px] text-artha-muted">
            ${Math.abs(dna.axes[activeIdx].pattern.monthlyImpact)}/mo impact
          </p>
        </motion.div>
      )}

    </div>
  );
}
