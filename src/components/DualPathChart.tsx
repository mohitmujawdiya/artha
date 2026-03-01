"use client";

import { useMemo } from "react";
import {
  motion,
  type MotionValue,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Projection } from "@/types";

interface DualPathChartProps {
  projection: Projection;
  months?: number;
  progress?: MotionValue<number>;
}

const CHART_W = 320;
const CHART_H = 180;
const PAD = { top: 10, right: 10, bottom: 25, left: 40 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

function buildLinePath(
  values: number[],
  maxVal: number,
  step: number
): string {
  return values
    .map((v, i) => {
      const x = PAD.left + i * step;
      const y = PAD.top + INNER_H - (v / maxVal) * INNER_H;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function buildAreaPath(
  values: number[],
  maxVal: number,
  step: number
): string {
  const line = values.map((v, i) => {
    const x = PAD.left + i * step;
    const y = PAD.top + INNER_H - (v / maxVal) * INNER_H;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  });
  const lastX = PAD.left + (values.length - 1) * step;
  const baseY = PAD.top + INNER_H;
  line.push(`L ${lastX} ${baseY}`);
  line.push(`L ${PAD.left} ${baseY}`);
  line.push("Z");
  return line.join(" ");
}

export function DualPathChart({
  projection,
  months = 60,
  progress,
}: DualPathChartProps) {
  // Fallback motion value so hooks are always called in same order
  const fallbackProgress = useMotionValue(1);
  const activeProgress = progress || fallbackProgress;

  // Always call useTransform unconditionally
  const drawProgress = useTransform(activeProgress, [0, 0.5], [0, 1]);
  const hasScrollProgress = !!progress;

  // Sample every 3 months for cleaner display
  const data = useMemo(() => {
    const currentVals: number[] = [];
    const optimized: number[] = [];
    const labels: string[] = [];
    for (let i = 0; i <= months; i += 3) {
      currentVals.push(projection.currentPath[i] || 0);
      optimized.push(projection.optimizedPath[i] || 0);
      labels.push(`${Math.floor(i / 12)}y`);
    }
    return { current: currentVals, optimized, labels };
  }, [projection, months]);

  const maxVal = useMemo(
    () => Math.max(...data.optimized, ...data.current, 1),
    [data]
  );

  const step = INNER_W / Math.max(data.current.length - 1, 1);

  const { current: currentVals, optimized: optimizedVals } = data;

  const currentLine = useMemo(
    () => buildLinePath(currentVals, maxVal, step),
    [currentVals, maxVal, step]
  );
  const optimizedLine = useMemo(
    () => buildLinePath(optimizedVals, maxVal, step),
    [optimizedVals, maxVal, step]
  );
  const currentArea = useMemo(
    () => buildAreaPath(currentVals, maxVal, step),
    [currentVals, maxVal, step]
  );
  const optimizedArea = useMemo(
    () => buildAreaPath(optimizedVals, maxVal, step),
    [optimizedVals, maxVal, step]
  );

  // Endpoint positions for dots
  const currentEndpoint = useMemo(() => {
    const lastIdx = currentVals.length - 1;
    const x = PAD.left + lastIdx * step;
    const y = PAD.top + INNER_H - (currentVals[lastIdx] / maxVal) * INNER_H;
    return { x, y };
  }, [currentVals, maxVal, step]);

  const optimizedEndpoint = useMemo(() => {
    const lastIdx = optimizedVals.length - 1;
    const x = PAD.left + lastIdx * step;
    const y = PAD.top + INNER_H - (optimizedVals[lastIdx] / maxVal) * INNER_H;
    return { x, y };
  }, [optimizedVals, maxVal, step]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => {
      const val = (maxVal / count) * i;
      const y = PAD.top + INNER_H - (val / maxVal) * INNER_H;
      return { val, y };
    });
  }, [maxVal]);

  // X-axis ticks (every 12 months)
  const xTicks = useMemo(() => {
    const ticks: { label: string; x: number }[] = [];
    data.labels.forEach((label, i) => {
      if (i % 4 === 0) {
        ticks.push({ label, x: PAD.left + i * step });
      }
    });
    return ticks;
  }, [data.labels, step]);

  return (
    <div className="w-full">
      <svg
        width="100%"
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="currentAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="optimizedAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6c63ff" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#6c63ff" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <line
            key={`grid-${i}`}
            x1={PAD.left}
            y1={t.y}
            x2={CHART_W - PAD.right}
            y2={t.y}
            stroke="rgba(148,163,184,0.06)"
            strokeWidth={0.5}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((t, i) => (
          <text
            key={`ylabel-${i}`}
            x={PAD.left - 5}
            y={t.y + 3}
            textAnchor="end"
            fill="#94a3b8"
            fontSize={8}
          >
            ${(t.val / 1000).toFixed(0)}k
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((t, i) => (
          <text
            key={`xlabel-${i}`}
            x={t.x}
            y={CHART_H - 5}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={8}
          >
            {t.label}
          </text>
        ))}

        {/* Current path area */}
        <motion.path
          d={currentArea}
          fill="url(#currentAreaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Optimized path area */}
        <motion.path
          d={optimizedArea}
          fill="url(#optimizedAreaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Current path line */}
        <motion.path
          d={currentLine}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={hasScrollProgress ? undefined : { pathLength: 1 }}
          style={hasScrollProgress ? { pathLength: drawProgress } : undefined}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Optimized path line */}
        <motion.path
          d={optimizedLine}
          fill="none"
          stroke="#6c63ff"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={hasScrollProgress ? undefined : { pathLength: 1 }}
          style={hasScrollProgress ? { pathLength: drawProgress } : undefined}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />

        {/* Current path endpoint dot */}
        <motion.circle
          cx={currentEndpoint.x}
          cy={currentEndpoint.y}
          r={3}
          fill="#94a3b8"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.3, ease: "easeOut" }}
        />

        {/* Optimized path endpoint dot with pulse */}
        <motion.circle
          cx={optimizedEndpoint.x}
          cy={optimizedEndpoint.y}
          r={4}
          fill="#6c63ff"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.7, 1], scale: [0, 1.3, 1, 1] }}
          transition={{ duration: 1.2, delay: 1.6, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
