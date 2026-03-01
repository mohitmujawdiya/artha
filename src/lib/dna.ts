import { BehavioralPattern } from "@/types";

/**
 * Derives a money personality label from behavioral patterns.
 */
export function derivePersonality(patterns: BehavioralPattern[]): string {
  const hasSavings = patterns.some((p) => p.type === "saving");
  const hasTiming = patterns.some((p) => p.type === "timing");
  const hasSubs = patterns.some((p) => p.type === "subscription");

  if (hasSavings && !hasTiming && !hasSubs) return "The Strategist";
  if (hasSavings && hasTiming) return "The Balanced Realist";
  if (hasSavings && hasSubs) return "The Comfort Optimizer";
  if (!hasSavings && hasTiming) return "The Momentum Spender";

  return "The Balanced Realist";
}

export interface DNAAxis {
  label: string;
  emoji: string;
  value: number; // 0-1 normalized intensity
  pattern: BehavioralPattern;
  angle: number; // radians
}

export interface DNAData {
  axes: DNAAxis[];
  points: { x: number; y: number }[];
}

/**
 * Transforms behavioral patterns into radial chart data.
 * Normalizes pattern impacts to a 0-1 scale based on severity and monthly impact.
 */
export function computeDNA(
  patterns: BehavioralPattern[],
  cx: number = 0,
  cy: number = 0,
  radius: number = 1
): DNAData {
  // Use up to 7 patterns; pad with synthetic entries if fewer
  const patternSlice = patterns.slice(0, 7);

  // Compute raw intensity for each pattern
  const raw = patternSlice.map((p) => {
    // Combine monthly impact magnitude + severity weight
    const severityWeight: Record<string, number> = {
      positive: 0.9,
      high: 0.85,
      moderate: 0.65,
      neutral: 0.4,
    };
    const sw = severityWeight[p.severity] ?? 0.5;
    // Normalize monthly impact: $0 -> 0, $200+ -> 1
    const impactNorm = Math.min(Math.abs(p.monthlyImpact) / 200, 1);
    return impactNorm * 0.6 + sw * 0.4;
  });

  // Ensure minimum visibility
  const intensities = raw.map((v) => Math.max(0.15, Math.min(1, v)));

  const count = patternSlice.length;
  const angleStep = (Math.PI * 2) / Math.max(count, 1);

  const axes: DNAAxis[] = patternSlice.map((p, i) => ({
    label: p.name,
    emoji: p.emoji,
    value: intensities[i],
    pattern: p,
    angle: -Math.PI / 2 + i * angleStep, // Start from top
  }));

  const points = axes.map((a) => ({
    x: cx + radius * a.value * Math.cos(a.angle),
    y: cy + radius * a.value * Math.sin(a.angle),
  }));

  return { axes, points };
}

/**
 * Generate a smooth closed SVG path through points using cubic bezier.
 */
export function dnaPath(points: { x: number; y: number }[]): string {
  if (points.length < 3) return "";

  const n = points.length;
  const d: string[] = [];

  d.push(`M ${points[0].x} ${points[0].y}`);

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    // Catmull-Rom to cubic bezier
    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }

  d.push("Z");
  return d.join(" ");
}
