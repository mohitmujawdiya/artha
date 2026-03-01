"use client";

import { useState, useCallback, useRef } from "react";

interface UseVoiceResult {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  isMuted: boolean;
  toggleMute: () => void;
}

export function useVoice(): UseVoiceResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    async (text: string) => {
      if (isMuted) return;

      try {
        setIsSpeaking(true);

        const response = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          setIsSpeaking(false);
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.pause();
        }

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };

        await audio.play();
      } catch {
        setIsSpeaking(false);
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev && audioRef.current) {
        audioRef.current.pause();
        setIsSpeaking(false);
      }
      return !prev;
    });
  }, []);

  return { speak, isSpeaking, isMuted, toggleMute };
}
