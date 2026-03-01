"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { EngagementState, ActiveChallenge } from "@/types";
import { getAgentMessages } from "@/lib/agent-messages";

const STORAGE_KEY = "artha-engagement";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultState(): EngagementState {
  return {
    streak: 5,
    lastCheckIn: todayStr(),
    activeChallenges: [],
    agentMessagesRead: [],
  };
}

function loadState(): EngagementState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EngagementState;
      const today = todayStr();
      if (parsed.lastCheckIn !== today) {
        const last = new Date(parsed.lastCheckIn);
        const now = new Date(today);
        const diffDays = Math.floor(
          (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          parsed.streak += 1;
        } else if (diffDays > 1) {
          parsed.streak = 1;
        }
        parsed.lastCheckIn = today;
      }
      if (!parsed.agentMessagesRead) {
        parsed.agentMessagesRead = [];
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return getDefaultState();
}

interface EngagementContextValue {
  state: EngagementState;
  acceptChallenge: (insightId: string, title: string) => void;
  recordAgentMessageRead: (messageId: string) => void;
  unreadAgentCount: number;
}

const EngagementContext = createContext<EngagementContextValue | null>(null);

export function useEngagement() {
  const ctx = useContext(EngagementContext);
  if (!ctx)
    throw new Error("useEngagement must be used within EngagementProvider");
  return ctx;
}

export function EngagementProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EngagementState>(getDefaultState);
  const initialized = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setState(loadState());
    }
  }, []);

  // Persist to localStorage on state change
  useEffect(() => {
    if (initialized.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const acceptChallenge = useCallback(
    (insightId: string, title: string) => {
      setState((prev) => {
        if (prev.activeChallenges.some((c) => c.insightId === insightId))
          return prev;
        const challenge: ActiveChallenge = {
          insightId,
          title,
          acceptedAt: Date.now(),
        };
        return {
          ...prev,
          activeChallenges: [...prev.activeChallenges, challenge],
        };
      });
    },
    []
  );

  const recordAgentMessageRead = useCallback(
    (messageId: string) => {
      setState((prev) => {
        if (prev.agentMessagesRead.includes(messageId)) return prev;
        return { ...prev, agentMessagesRead: [...prev.agentMessagesRead, messageId] };
      });
    },
    []
  );

  const visibleAgentMessages = getAgentMessages(3);
  const unreadAgentCount = visibleAgentMessages.filter(
    (m) => !state.agentMessagesRead.includes(m.id)
  ).length;

  return (
    <EngagementContext.Provider
      value={{
        state,
        acceptChallenge,
        recordAgentMessageRead,
        unreadAgentCount,
      }}
    >
      {children}
    </EngagementContext.Provider>
  );
}
