"use client";

import { useEngagement } from "./EngagementProvider";
import { StreakBadge } from "./StreakBadge";

export function EngagementHeader() {
  const { state } = useEngagement();

  return (
    <div className="z-30 absolute top-3 left-4">
      <StreakBadge streak={state.streak} />
    </div>
  );
}
