"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEngagement } from "./EngagementProvider";
import { StreakBadge } from "./StreakBadge";
import { getOnboardingData } from "@/lib/onboarding";
import { useUser } from "@clerk/nextjs";

export function EngagementHeader() {
  const { state, unreadAgentCount } = useEngagement();
  const { user } = useUser();
  const [localName, setLocalName] = useState<string | null>(null);

  useEffect(() => {
    setLocalName(getOnboardingData()?.name || null);
  }, []);

  const name = user?.firstName || localName || "there";

  return (
    <div className="z-30 absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3">
      <StreakBadge streak={state.streak} />

      <p className="text-sm font-medium text-artha-text">
        Hey {name}
      </p>

      <Link href="/coach" className="relative">
        <Bell size={22} className="text-artha-muted" />
        <AnimatePresence>
          {unreadAgentCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center"
            >
              <span className="text-[9px] font-bold text-white">
                {unreadAgentCount}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </div>
  );
}
