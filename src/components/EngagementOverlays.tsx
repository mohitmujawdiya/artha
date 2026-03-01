"use client";

import { useEngagement } from "./EngagementProvider";
import { LevelUpModal } from "./LevelUpModal";
import { DailyCompleteModal } from "./DailyCompleteModal";

export function EngagementOverlays() {
  const { levelUp, dismissLevelUp, dailyComplete, awardXP } =
    useEngagement();

  return (
    <>
      <LevelUpModal levelUp={levelUp} onDismiss={dismissLevelUp} />
      <DailyCompleteModal
        complete={dailyComplete}
        awardXP={awardXP}
      />
    </>
  );
}
