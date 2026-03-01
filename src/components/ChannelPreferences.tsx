"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PaperPlaneTilt, Phone, ChatCircle } from "@phosphor-icons/react";
import { ChannelPreferences as ChannelPrefsType } from "@/types";

const STORAGE_KEY = "artha-channel-prefs";

const channels = [
  { key: "telegram" as const, label: "Telegram", icon: PaperPlaneTilt, description: "Instant nudges & wins" },
  { key: "whatsapp" as const, label: "WhatsApp", icon: Phone, description: "Daily summaries" },
  { key: "imessage" as const, label: "iMessage", icon: ChatCircle, description: "Important alerts only" },
];

function loadPrefs(): ChannelPrefsType {
  if (typeof window === "undefined") return { telegram: false, whatsapp: false, imessage: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { telegram: false, whatsapp: false, imessage: false };
}

interface ChannelPreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChannelPreferences({ isOpen, onClose }: ChannelPreferencesProps) {
  const [prefs, setPrefs] = useState<ChannelPrefsType>(loadPrefs);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const toggle = (key: keyof ChannelPrefsType) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="bg-artha-surface rounded-t-2xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold">Notifications</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-artha-muted hover:text-artha-text"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Channel rows */}
              <div className="space-y-4">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  const enabled = prefs[channel.key];
                  return (
                    <div key={channel.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-artha-accent/10 flex items-center justify-center">
                          <Icon size={20} className="text-artha-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{channel.label}</p>
                          <p className="text-xs text-artha-muted">{channel.description}</p>
                        </div>
                      </div>

                      {/* Toggle switch */}
                      <button
                        onClick={() => toggle(channel.key)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          enabled ? "bg-artha-accent" : "bg-artha-muted/30"
                        }`}
                      >
                        <motion.div
                          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                          animate={{ left: enabled ? 22 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Coming soon note */}
              <p className="text-xs text-artha-muted text-center mt-6 pb-2">
                Coming soon — we&apos;ll notify you when channels are live
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
