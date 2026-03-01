"use client";

import { motion } from "framer-motion";
import { useUser, SignOutButton } from "@clerk/nextjs";

import { ChannelPreferences } from "@/components/ChannelPreferences";
import { SignOut } from "@phosphor-icons/react";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useUser();
  const [prefsOpen, setPrefsOpen] = useState(false);

  return (
    <main className="h-full overflow-y-auto px-5 py-6 no-scrollbar">
      <motion.h1
        className="font-display text-2xl font-bold"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Settings
      </motion.h1>

      <div className="mt-6 space-y-4">
        {/* Profile */}
        {user && (
          <motion.div
            className="glass rounded-2xl p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xs text-artha-muted uppercase tracking-wider mb-2">
              Profile
            </p>
            <p className="font-semibold">{user.fullName || user.firstName}</p>
            <p className="text-sm text-artha-muted">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </motion.div>
        )}

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-artha-muted uppercase tracking-wider mb-2">
            Notifications
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setPrefsOpen(true)}
            className="w-full glass rounded-2xl p-4 text-left"
          >
            <p className="font-semibold text-sm">Channel Preferences</p>
            <p className="text-xs text-artha-muted">Choose how Artha reaches you</p>
          </motion.button>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SignOutButton>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:bg-red-500/10 transition-colors"
            >
              <SignOut size={20} className="text-red-400" />
              <p className="font-semibold text-sm text-red-400">Sign Out</p>
            </motion.button>
          </SignOutButton>
        </motion.div>
      </div>

      <ChannelPreferences
        isOpen={prefsOpen}
        onClose={() => setPrefsOpen(false)}
      />
    </main>
  );
}
