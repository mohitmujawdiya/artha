"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkle, TrendUp, ChatCircleDots, UserCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const tabs = [
  { href: "/moments", label: "Moments", icon: Sparkle },
  { href: "/future", label: "Future", icon: TrendUp },
  { href: "/coach", label: "Coach", icon: ChatCircleDots },
  { href: "/you", label: "You", icon: UserCircle },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass border-t border-artha-accent/10 z-50">
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
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
