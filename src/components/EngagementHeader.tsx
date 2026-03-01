"use client";

import { useEngagement } from "./EngagementProvider";
import { StreakBadge } from "./StreakBadge";
import { XPBar } from "./XPBar";
import { getLevelForXP } from "@/lib/engagement";

export function EngagementHeader() {
  const { state } = useEngagement();
  const level = getLevelForXP(state.xp);

  return (
    <div className="z-30 glass border-b border-artha-accent/10 px-4 py-2 flex items-center gap-3 flex-shrink-0">
      <StreakBadge streak={state.streak} />
      <XPBar xp={state.xp} />
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-[10px] text-artha-muted font-medium">
          Lv{level.level}
        </span>
      </div>
    </div>
  );
}
