"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneDisconnect } from "@phosphor-icons/react";
import { useConversation } from "@elevenlabs/react";

interface VoiceModeProps {
  isActive: boolean;
  onClose: () => void;
}

export function VoiceMode({ isActive, onClose }: VoiceModeProps) {
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    onError: (err: string) => {
      console.error("Voice error:", err);
      setError("Connection error — try again");
    },
    onConnect: () => {
      setError(null);
    },
    onDisconnect: () => {
      onClose();
    },
  });

  const { status, isSpeaking } = conversation;

  const startSession = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/voice/conversation");
      const data = await res.json();

      if (!res.ok || !data.signedUrl) {
        setError(data.error || "Voice not configured");
        return;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        setError("Microphone not available");
        return;
      }

      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ signedUrl: data.signedUrl });
    } catch (err) {
      console.error("Failed to start voice session:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
    }
  }, [conversation]);

  const endSession = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch {
      // Already disconnected
    }
    onClose();
  }, [conversation, onClose]);

  useEffect(() => {
    if (isActive) {
      startSession();
    }
    return () => {
      if (status === "connected") {
        conversation.endSession().catch(() => {});
      }
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const statusText =
    error ? error :
    status === "connecting" ? "Connecting..." :
    status === "connected" && isSpeaking ? "Artha is speaking..." :
    status === "connected" ? "Listening..." :
    "Starting...";

  // Orb animation variants based on state
  const orbAnimate = status === "connected" && isSpeaking
    ? { scale: [1, 1.15, 1], opacity: 1 }
    : status === "connected"
    ? { scale: [1, 1.05, 1], opacity: 1 }
    : { scale: 1, opacity: [0.5, 1, 0.5] };

  const orbTransition = status === "connected" && isSpeaking
    ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const }
    : status === "connected"
    ? { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
    : { duration: 2, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-60 bg-artha-bg flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          {/* Status text */}
          <motion.p
            className="text-artha-muted text-sm mb-8"
            animate={{ opacity: error ? 1 : [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: error ? 0 : Infinity }}
          >
            {statusText}
          </motion.p>

          {/* Animated orb */}
          <div className="relative">
            {/* Glow ring (visible when speaking) */}
            {status === "connected" && isSpeaking && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  width: 144,
                  height: 144,
                  left: -8,
                  top: -8,
                  background: "radial-gradient(circle, rgba(108,99,255,0.3) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            <motion.div
              className="w-32 h-32 rounded-full"
              style={{
                background: "linear-gradient(135deg, #6c63ff 0%, #4ade80 100%)",
              }}
              animate={orbAnimate}
              transition={orbTransition}
            />
          </div>

          {/* End call button */}
          <motion.button
            className="mt-16 w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30"
            whileTap={{ scale: 0.9 }}
            onClick={endSession}
          >
            <PhoneDisconnect size={28} weight="fill" className="text-white" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
