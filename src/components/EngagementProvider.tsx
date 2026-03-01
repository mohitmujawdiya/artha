"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { EngagementState, ActiveChallenge, AgentMessage } from "@/types";
import { generateAgentMessages } from "@/lib/agent-messages";
import { useTransactions } from "@/hooks/useTransactions";

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

function persistToApi(state: EngagementState) {
  fetch("/api/engagement", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      streak: state.streak,
      lastCheckIn: state.lastCheckIn,
      activeChallenges: state.activeChallenges,
      agentMessagesRead: state.agentMessagesRead,
    }),
  }).catch(() => {});
}

interface EngagementContextValue {
  state: EngagementState;
  acceptChallenge: (insightId: string, title: string) => void;
  recordAgentMessageRead: (messageId: string) => void;
  unreadAgentCount: number;
  agentMessages: AgentMessage[];
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
  const { patterns, user } = useTransactions();

  const agentMessages = useMemo(
    () => generateAgentMessages(patterns, user),
    [patterns, user]
  );

  // Load from localStorage on mount, then try API
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const localState = loadState();
      setState(localState);

      // Try to fetch from API (may fail if unauthenticated)
      fetch("/api/engagement")
        .then((res) => (res.ok ? res.json() : null))
        .then((apiState) => {
          if (apiState && apiState.streak !== undefined) {
            const merged: EngagementState = {
              streak: Math.max(apiState.streak, localState.streak),
              lastCheckIn: localState.lastCheckIn,
              activeChallenges: apiState.activeChallenges ?? localState.activeChallenges,
              agentMessagesRead: apiState.agentMessagesRead ?? localState.agentMessagesRead,
            };
            setState(merged);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Write-through: persist to both localStorage and API on state change
  useEffect(() => {
    if (initialized.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      persistToApi(state);
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

  const unreadAgentCount = agentMessages
    .slice(0, 3)
    .filter((m) => !state.agentMessagesRead.includes(m.id)).length;

  return (
    <EngagementContext.Provider
      value={{
        state,
        acceptChallenge,
        recordAgentMessageRead,
        unreadAgentCount,
        agentMessages,
      }}
    >
      {children}
    </EngagementContext.Provider>
  );
}
