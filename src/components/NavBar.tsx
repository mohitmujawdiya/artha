"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkle, TrendUp, ChatCircleDots, UserCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEngagement } from "./EngagementProvider";

const tabs = [
  { href: "/moments", label: "Moments", icon: Sparkle },
  { href: "/future", label: "Future", icon: TrendUp },
  { href: "/coach", label: "Coach", icon: ChatCircleDots },
  { href: "/you", label: "You", icon: UserCircle },
];

export function NavBar() {
  const pathname = usePathname();
  const { unreadAgentCount } = useEngagement();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass border-t border-artha-accent/10 z-50">
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          const showBadge = tab.href === "/coach" && unreadAgentCount > 0;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 py-1 px-3"
            >
              <div className="relative">
                <Icon
                  size={22}
                  weight={isActive ? "fill" : "regular"}
                  className={
                    isActive ? "text-artha-accent" : "text-artha-muted"
                  }
                />
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-artha-accent rounded-full"
                  />
                )}
                <AnimatePresence>
                  {showBadge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-[9px] font-bold text-white">{unreadAgentCount}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span
                className={`text-[10px] ${
                  isActive ? "text-artha-accent" : "text-artha-muted"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
