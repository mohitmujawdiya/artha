"use client";

import {
  Plant,
  MagnifyingGlass,
  ChartBar,
  Coin,
  Lightbulb,
  Compass,
  Lightning,
  Buildings,
  Crown,
  StarFour,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const ICON_MAP: Record<string, Icon> = {
  plant: Plant,
  "magnifying-glass": MagnifyingGlass,
  "chart-bar": ChartBar,
  coin: Coin,
  lightbulb: Lightbulb,
  compass: Compass,
  lightning: Lightning,
  buildings: Buildings,
  crown: Crown,
  "star-four": StarFour,
};

interface LevelIconProps {
  icon: string;
  size?: number;
  className?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}

export function LevelIcon({ icon, size = 16, className = "text-artha-accent", weight = "fill" }: LevelIconProps) {
  const IconComponent = ICON_MAP[icon] || StarFour;
  return <IconComponent size={size} weight={weight} className={className} />;
}
