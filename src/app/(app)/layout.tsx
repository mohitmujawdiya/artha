"use client";

import { NavBar } from "@/components/NavBar";
import { EngagementProvider } from "@/components/EngagementProvider";
import { EngagementHeader } from "@/components/EngagementHeader";
import { EngagementOverlays } from "@/components/EngagementOverlays";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EngagementProvider>
      <div className="flex flex-col h-[100svh] relative">
        <EngagementHeader />
        <div className="flex-1 min-h-0 pt-12 pb-16">
          {children}
        </div>
        <NavBar />
      </div>
      <EngagementOverlays />
    </EngagementProvider>
  );
}
