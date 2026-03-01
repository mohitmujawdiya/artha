"use client";

import { Suspense } from "react";
import { ChatInterface } from "@/components/ChatInterface";

export default function CoachPage() {
  return (
    <main className="h-full overflow-hidden">
      <Suspense fallback={<div className="h-screen" />}>
        <ChatInterface />
      </Suspense>
    </main>
  );
}
