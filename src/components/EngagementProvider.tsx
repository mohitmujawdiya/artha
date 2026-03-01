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
import {
  EngagementState,
  ActiveChallenge,
  XPEvent,
  TabProgress,
} from "@/types";
import { getAgentMessages } from "@/lib/agent-messages";
import {
  LEVELS,
  XP_REWARDS,
  getLevelForXP,
  getNextLevel,
  TOTAL_CARDS,
  TOTAL_LEVERS,
} from "@/lib/engagement";

const STORAGE_KEY = "artha-engagement";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultState(): EngagementState {
  return {
    xp: 280,
    level: 3,
    streak: 5,
    lastCheckIn: todayStr(),
    cardsViewed: [],
    leversToggled: [],
    coachMessaged: false,
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
      // Streak logic: check lastCheckIn
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
        // Reset daily progress
        parsed.cardsViewed = [];
        parsed.leversToggled = [];
        parsed.coachMessaged = false;
      }
      // Ensure agentMessagesRead exists (migration from older state)
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
  xpEvents: XPEvent[];
  levelUp: { level: number; title: string; emoji: string } | null;
  dismissLevelUp: () => void;
  tabProgress: TabProgress;
  awardXP: (event: XPEvent) => void;
  recordCardView: (insightId: string) => void;
  recordLeverToggle: (leverId: string) => void;
  recordCoachMessage: () => void;
  acceptChallenge: (insightId: string, title: string) => void;
  dailyComplete: boolean;
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
  const [xpEvents, setXpEvents] = useState<XPEvent[]>([]);
  const [levelUp, setLevelUp] = useState<{
    level: number;
    title: string;
    emoji: string;
  } | null>(null);
  const [dailyComplete, setDailyComplete] = useState(false);
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

  const tabProgress: TabProgress = {
    moments: Math.min(state.cardsViewed.length / TOTAL_CARDS, 1),
    future: Math.min(state.leversToggled.length / TOTAL_LEVERS, 1),
    coach: state.coachMessaged ? 1 : 0,
  };

  // Check daily complete
  useEffect(() => {
    if (
      tabProgress.moments >= 1 &&
      tabProgress.future >= 1 &&
      tabProgress.coach >= 1 &&
      !dailyComplete
    ) {
      setDailyComplete(true);
    }
  }, [tabProgress, dailyComplete]);

  const awardXP = useCallback(
    (event: XPEvent) => {
      setXpEvents((prev) => [...prev.slice(-2), event]);

      // Auto-dismiss after 2s
      setTimeout(() => {
        setXpEvents((prev) => prev.slice(1));
      }, 2500);

      setState((prev) => {
        const newXP = prev.xp + event.amount;
        const currentLevel = getLevelForXP(prev.xp);
        const newLevel = getLevelForXP(newXP);

        if (newLevel.level > currentLevel.level) {
          setLevelUp({
            level: newLevel.level,
            title: newLevel.title,
            emoji: newLevel.emoji,
          });
        }

        return {
          ...prev,
          xp: newXP,
          level: newLevel.level,
        };
      });
    },
    []
  );

  const recordCardView = useCallback(
    (insightId: string) => {
      setState((prev) => {
        if (prev.cardsViewed.includes(insightId)) return prev;
        const updated = { ...prev, cardsViewed: [...prev.cardsViewed, insightId] };
        return updated;
      });
      // Award XP outside setState to avoid stale closure
      if (!state.cardsViewed.includes(insightId)) {
        awardXP({
          amount: XP_REWARDS.card_viewed,
          source: "card_viewed",
          label: "Card viewed",
        });
        // Check if full story
        if (state.cardsViewed.length + 1 >= TOTAL_CARDS) {
          setTimeout(() => {
            awardXP({
              amount: XP_REWARDS.full_story,
              source: "full_story",
              label: "Full story!",
            });
          }, 500);
        }
      }
    },
    [state.cardsViewed, awardXP]
  );

  const recordLeverToggle = useCallback(
    (leverId: string) => {
      setState((prev) => {
        if (prev.leversToggled.includes(leverId)) return prev;
        return { ...prev, leversToggled: [...prev.leversToggled, leverId] };
      });
      if (!state.leversToggled.includes(leverId)) {
        awardXP({
          amount: XP_REWARDS.lever_toggled,
          source: "lever_toggled",
          label: "Lever toggled",
        });
        // Check if all levers
        if (state.leversToggled.length + 1 >= TOTAL_LEVERS) {
          setTimeout(() => {
            awardXP({
              amount: XP_REWARDS.all_levers,
              source: "all_levers",
              label: "All levers!",
            });
          }, 500);
        }
      }
    },
    [state.leversToggled, awardXP]
  );

  const recordCoachMessage = useCallback(() => {
    setState((prev) => {
      if (prev.coachMessaged) return prev;
      return { ...prev, coachMessaged: true };
    });
    if (!state.coachMessaged) {
      awardXP({
        amount: XP_REWARDS.coach_message,
        source: "coach_message",
        label: "Coach messaged",
      });
    }
  }, [state.coachMessaged, awardXP]);

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
      if (!state.activeChallenges.some((c) => c.insightId === insightId)) {
        awardXP({
          amount: XP_REWARDS.challenge_accepted,
          source: "challenge_accepted",
          label: "Challenge accepted!",
        });
      }
    },
    [state.activeChallenges, awardXP]
  );

  const recordAgentMessageRead = useCallback(
    (messageId: string) => {
      setState((prev) => {
        if (prev.agentMessagesRead.includes(messageId)) return prev;
        return { ...prev, agentMessagesRead: [...prev.agentMessagesRead, messageId] };
      });
      if (!state.agentMessagesRead.includes(messageId)) {
        awardXP({
          amount: XP_REWARDS.agent_message_read,
          source: "agent_message_read",
          label: "Message read",
        });
      }
    },
    [state.agentMessagesRead, awardXP]
  );

  const visibleAgentMessages = getAgentMessages(3);
  const unreadAgentCount = visibleAgentMessages.filter(
    (m) => !state.agentMessagesRead.includes(m.id)
  ).length;

  const dismissLevelUp = useCallback(() => setLevelUp(null), []);

  return (
    <EngagementContext.Provider
      value={{
        state,
        xpEvents,
        levelUp,
        dismissLevelUp,
        tabProgress,
        awardXP,
        recordCardView,
        recordLeverToggle,
        recordCoachMessage,
        acceptChallenge,
        dailyComplete,
        recordAgentMessageRead,
        unreadAgentCount,
      }}
    >
      {children}
    </EngagementContext.Provider>
  );
}
