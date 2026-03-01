"use client";

import { Suspense } from "react";
import { ChatInterface } from "@/components/ChatInterface";

export default function CoachPage() {
  return (
    <main className="pb-16">
      <Suspense fallback={<div className="h-screen" />}>
        <ChatInterface />
      </Suspense>
    </main>
  );
}
