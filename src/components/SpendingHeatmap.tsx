"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Transaction } from "@/types";
import { buildHeatmap, HeatmapCell } from "@/lib/heatmap";

interface SpendingHeatmapProps {
  transactions: Transaction[];
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const HOUR_LABELS = [
  { hour: 0, label: "12a" },
  { hour: 6, label: "6a" },
  { hour: 12, label: "12p" },
  { hour: 18, label: "6p" },
];

function cellColor(intensity: number): string {
  if (intensity === 0) return "rgba(108, 99, 255, 0.04)";
  // Interpolate from artha-accent (purple) at low → artha-gold at high
  const t = Math.min(intensity, 1);
  // HSL: purple (253, 95%, 69%) → gold (45, 97%, 56%)
  const h = 253 - t * 208; // 253 → 45
  const s = 95 + t * 2; // 95% → 97%
  const l = 69 - t * 13; // 69% → 56%
  const a = 0.25 + t * 0.65; // 0.25 → 0.9
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

export function SpendingHeatmap({ transactions }: SpendingHeatmapProps) {
  const [activeCell, setActiveCell] = useState<HeatmapCell | null>(null);
  const heatmap = useMemo(() => buildHeatmap(transactions), [transactions]);

  const cellSize = 10;
  const gap = 2;
  const labelOffset = 18;
  const totalW = labelOffset + 24 * (cellSize + gap);
  const totalH = labelOffset + 7 * (cellSize + gap);

  return (
    <div className="relative w-full flex flex-col items-center">
      <svg
        width="100%"
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="max-w-full"
      >
        {/* Hour labels along top */}
        {HOUR_LABELS.map(({ hour, label }) => (
          <text
            key={`h-${hour}`}
            x={labelOffset + hour * (cellSize + gap) + cellSize / 2}
            y={10}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={6}
            fontFamily="sans-serif"
          >
            {label}
          </text>
        ))}

        {/* Day labels along left */}
        {DAY_LABELS.map((label, day) => (
          <text
            key={`d-${day}`}
            x={8}
            y={labelOffset + day * (cellSize + gap) + cellSize / 2 + 2}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={6}
            fontFamily="sans-serif"
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        {heatmap.cells.map((row, day) =>
          row.map((cell, hour) => {
            const intensity =
              heatmap.maxTotal > 0 ? cell.total / heatmap.maxTotal : 0;
            const x = labelOffset + hour * (cellSize + gap);
            const y = labelOffset + day * (cellSize + gap);
            const isActive =
              activeCell?.day === day && activeCell?.hour === hour;

            return (
              <motion.rect
                key={`${day}-${hour}`}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={cellColor(intensity)}
                stroke={isActive ? "#fbbf24" : "transparent"}
                strokeWidth={isActive ? 1 : 0}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: (day * 24 + hour) * 0.003,
                }}
                onPointerEnter={() => setActiveCell(cell)}
                onPointerLeave={() => setActiveCell(null)}
                style={{ cursor: cell.count > 0 ? "pointer" : "default" }}
              />
            );
          })
        )}
      </svg>

      {/* Tooltip */}
      {activeCell && activeCell.count > 0 && (
        <motion.div
          className="glass rounded-xl px-3 py-2 mt-2 text-center"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[10px] text-artha-muted">
            {DAY_LABELS[activeCell.day]}
            {activeCell.day === 0
              ? "un"
              : activeCell.day === 1
                ? "on"
                : activeCell.day === 2
                  ? "ue"
                  : activeCell.day === 3
                    ? "ed"
                    : activeCell.day === 4
                      ? "hu"
                      : activeCell.day === 5
                        ? "ri"
                        : "at"}{" "}
            {activeCell.hour === 0
              ? "12am"
              : activeCell.hour < 12
                ? `${activeCell.hour}am`
                : activeCell.hour === 12
                  ? "12pm"
                  : `${activeCell.hour - 12}pm`}
          </p>
          <p className="text-xs font-semibold text-artha-accent">
            ${activeCell.total.toFixed(0)} · {activeCell.count} transactions
          </p>
          {activeCell.topMerchant && (
            <p className="text-[10px] text-artha-muted">
              Top: {activeCell.topMerchant}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
