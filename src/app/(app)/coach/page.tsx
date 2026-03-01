"use client";

import { Suspense } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { useEngagement } from "@/components/EngagementProvider";

function CoachContent() {
  const { recordCoachMessage } = useEngagement();

  return <ChatInterface onCoachMessage={recordCoachMessage} />;
}

export default function CoachPage() {
  return (
    <main className="h-full overflow-hidden">
      <Suspense fallback={<div className="h-screen" />}>
        <CoachContent />
      </Suspense>
    </main>
  );
}
