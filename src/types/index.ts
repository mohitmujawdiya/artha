export interface UserProfile {
  id: string;
  name: string;
  age: number;
  monthlyIncome: number;
  currentSavings: number;
  goals: FinancialGoal[];
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  emoji: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  category: string;
  subcategory?: string;
  isRecurring?: boolean;
  isSubscription?: boolean;
  lastUsed?: string;
  dayOfWeek: number;
  hour: number;
}

export interface BehavioralPattern {
  id: string;
  name: string;
  type: "spending" | "saving" | "timing" | "subscription";
  description: string;
  frequency: string;
  monthlyImpact: number;
  annualImpact: number;
  goalImpactDays: number;
  severity: "positive" | "neutral" | "moderate" | "high";
  emoji: string;
  details: string;
}

export type InsightType = "win" | "discovery" | "nudge" | "goal" | "challenge" | "rhythm" | "learn";

export type CoachTone = "hype" | "real-talk";

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  subtitle: string;
  metric: string;
  metricValue: number;
  metricPrefix?: string;
  metricSuffix?: string;
  body: string;
  color: string;
  gradient: string;
  patternId?: string;
  action?: string;
  visualization?: "heatmap";
  goalImpactLine?: string;
  peerComparison?: string;
  personalityLabel?: string;
  savingsRule?: { trigger: string; amount: number };
}

export interface Projection {
  months: number[];
  currentPath: number[];
  optimizedPath: number[];
  totalSaved: number;
  totalOptimized: number;
  monthsToEmergencyFund: number;
  monthsToEmergencyFundOptimized: number;
}

export interface ProjectionAdjustment {
  id: string;
  label: string;
  description: string;
  monthlySavings: number;
  difficulty: "Easy" | "Moderate" | "Hard";
  enabled: boolean;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  dataCard?: InlineDataCard;
  quickReplies?: string[];
  agentMessage?: AgentMessage;
}

export interface InlineDataCard {
  type: "tradeoff" | "comparison" | "goal-impact";
  title: string;
  items: { label: string; value: string; color?: string }[];
}

export interface Subscription {
  name: string;
  merchant: string;
  monthlyAmount: number;
  lastUsed: string;
  category: string;
  isActive: boolean;
}

// Agent message types
export type AgentMessageType = "nudge" | "win" | "discovery" | "goal_update" | "challenge" | "awareness" | "consequence";

export interface AgentMessage {
  id: string;
  type: AgentMessageType;
  content: string;
  emoji: string;
  timestamp: number;
  read: boolean;
  xpAwarded: boolean;
  quickReplies?: string[];
}

// Channel preferences (UI-only for now)
export type NotificationChannel = "telegram" | "whatsapp" | "imessage";
export interface ChannelPreferences {
  telegram: boolean;
  whatsapp: boolean;
  imessage: boolean;
}

// Voice session status
export type VoiceSessionStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

// Engagement / XP System

export type XPSource =
  | "card_viewed"
  | "full_story"
  | "challenge_accepted"
  | "lever_toggled"
  | "all_levers"
  | "coach_message"
  | "daily_complete"
  | "agent_message_read"
  | "voice_session";

export interface XPEvent {
  amount: number;
  source: XPSource;
  label: string;
}

export interface ActiveChallenge {
  insightId: string;
  title: string;
  acceptedAt: number;
}

export interface LevelConfig {
  level: number;
  title: string;
  xpRequired: number;
  icon: string;
}

export interface TabProgress {
  moments: number;
  future: number;
  coach: number;
}

export interface EngagementState {
  xp: number;
  level: number;
  streak: number;
  lastCheckIn: string;
  cardsViewed: string[];
  leversToggled: string[];
  coachMessaged: boolean;
  activeChallenges: ActiveChallenge[];
  agentMessagesRead: string[];
}
