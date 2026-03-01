"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { EngagementProvider } from "@/components/EngagementProvider";
import { EngagementHeader } from "@/components/EngagementHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCoach = pathname === "/coach";

  return (
    <EngagementProvider>
      <div className="flex flex-col h-[100svh] relative">
        {!isCoach && <EngagementHeader />}
        <div className={`flex-1 min-h-0 ${isCoach ? "" : "pt-12"} pb-16`}>
          {children}
        </div>
        <NavBar />
      </div>
    </EngagementProvider>
  );
}
