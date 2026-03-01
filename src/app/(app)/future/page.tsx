"use client";

import { FutureTimeline } from "@/components/FutureTimeline";
import { useEngagement } from "@/components/EngagementProvider";

export default function FuturePage() {
  const { recordLeverToggle } = useEngagement();

  return (
    <main className="h-full overflow-hidden">
      <FutureTimeline onLeverToggle={recordLeverToggle} />
    </main>
  );
}
