"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { NavBar } from "@/components/NavBar";
import { EngagementProvider } from "@/components/EngagementProvider";
import { EngagementHeader } from "@/components/EngagementHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const isCoach = pathname === "/coach";
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setCheckingOnboarding(false);
      return;
    }

    // Check localStorage cache first
    const cached = localStorage.getItem("artha-onboarding-complete");
    if (cached === "true") {
      setCheckingOnboarding(false);
      return;
    }

    // Fetch user to check onboarding status
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.monthlyIncome) {
          router.push("/onboarding");
        } else {
          localStorage.setItem("artha-onboarding-complete", "true");
          setCheckingOnboarding(false);
        }
      })
      .catch(() => {
        setCheckingOnboarding(false);
      });
  }, [isLoaded, isSignedIn, router]);

  if (checkingOnboarding && isSignedIn) {
    return (
      <div className="flex items-center justify-center h-[100svh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-artha-accent border-t-transparent animate-spin" />
          <p className="text-xs text-artha-muted">Loading...</p>
        </div>
      </div>
    );
  }

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
