import { LevelConfig, XPSource } from "@/types";

export const LEVELS: LevelConfig[] = [
  { level: 1, title: "Curious Spender", xpRequired: 0, icon: "plant" },
  { level: 2, title: "Pattern Spotter", xpRequired: 100, icon: "magnifying-glass" },
  { level: 3, title: "Budget Apprentice", xpRequired: 300, icon: "chart-bar" },
  { level: 4, title: "Savings Starter", xpRequired: 550, icon: "coin" },
  { level: 5, title: "Money Aware", xpRequired: 900, icon: "lightbulb" },
  { level: 6, title: "Financial Explorer", xpRequired: 1400, icon: "compass" },
  { level: 7, title: "Habit Hacker", xpRequired: 2000, icon: "lightning" },
  { level: 8, title: "Wealth Builder", xpRequired: 2800, icon: "buildings" },
  { level: 9, title: "Money Master", xpRequired: 3800, icon: "crown" },
  { level: 10, title: "Financial Zen", xpRequired: 5000, icon: "star-four" },
];

export const XP_REWARDS: Record<XPSource, number> = {
  card_viewed: 10,
  full_story: 100,
  challenge_accepted: 50,
  lever_toggled: 25,
  all_levers: 200,
  coach_message: 15,
  daily_complete: 500,
  agent_message_read: 5,
  voice_session: 20,
};

export function getLevelForXP(xp: number): LevelConfig {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

export function getNextLevel(currentLevel: number): LevelConfig | null {
  const idx = LEVELS.findIndex((l) => l.level === currentLevel);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

// Total insight cards in the app
export const TOTAL_CARDS = 9;
// Total levers on the future page
export const TOTAL_LEVERS = 4;
