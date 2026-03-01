"use client";

import { motion, type MotionValue, useTransform } from "framer-motion";

interface AnimatedPathProps {
  d: string;
  stroke: string;
  strokeWidth?: number;
  fill?: string;
  progress: MotionValue<number>;
  className?: string;
}

/**
 * SVG path that draws itself based on a progress motion value (0-1).
 */
export function AnimatedPath({
  d,
  stroke,
  strokeWidth = 2,
  fill = "none",
  progress,
  className,
}: AnimatedPathProps) {
  const pathLen = useTransform(progress, [0, 1], [0, 1]);

  return (
    <motion.path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      strokeLinecap="round"
      className={className}
      style={{ pathLength: pathLen }}
    />
  );
}
