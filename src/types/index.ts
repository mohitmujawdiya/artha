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

export type InsightType = "win" | "discovery" | "nudge" | "goal" | "challenge" | "rhythm";

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
  emoji: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  dataCard?: InlineDataCard;
  quickReplies?: string[];
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
