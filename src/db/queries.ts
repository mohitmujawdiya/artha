import { eq, desc } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  financialGoals,
  transactions,
  engagementState,
  chatHistory,
  aiMemory,
  plaidItems,
  channelPreferences,
} from "./schema";

// ── Users ──

export async function getDbUser(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user ?? null;
}

export async function upsertUser(data: {
  id: string;
  name: string;
  age?: number;
  monthlyIncome?: number;
  currentSavings?: number;
}) {
  await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: data.name,
        age: data.age,
        monthlyIncome: data.monthlyIncome,
        currentSavings: data.currentSavings,
      },
    });
}

// ── Goals ──

export async function getUserGoals(userId: string) {
  return db
    .select()
    .from(financialGoals)
    .where(eq(financialGoals.userId, userId));
}

export async function createGoal(data: {
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  emoji?: string;
}) {
  const [goal] = await db.insert(financialGoals).values(data).returning();
  return goal;
}

export async function updateGoal(
  goalId: number,
  data: Partial<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    emoji: string;
  }>
) {
  const [goal] = await db
    .update(financialGoals)
    .set(data)
    .where(eq(financialGoals.id, goalId))
    .returning();
  return goal;
}

export async function deleteGoal(goalId: number) {
  await db.delete(financialGoals).where(eq(financialGoals.id, goalId));
}

// ── Transactions ──

export async function getUserTransactions(userId: string) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId));
}

export async function insertTransactions(
  data: (typeof transactions.$inferInsert)[]
) {
  if (data.length === 0) return;
  await db.insert(transactions).values(data);
}

// ── Engagement ──

export async function getEngagement(userId: string) {
  const [state] = await db
    .select()
    .from(engagementState)
    .where(eq(engagementState.userId, userId));
  return state ?? null;
}

export async function upsertEngagement(
  userId: string,
  data: Partial<{
    streak: number;
    lastCheckIn: string;
    activeChallenges: { insightId: string; title: string; acceptedAt: string }[];
    agentMessagesRead: string[];
  }>
) {
  await db
    .insert(engagementState)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: engagementState.userId,
      set: data,
    });
}

// ── Chat History ──

export async function getChatMessages(userId: string, limit = 20) {
  return db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.userId, userId))
    .orderBy(desc(chatHistory.timestamp))
    .limit(limit);
}

export async function saveChatMessage(data: {
  userId: string;
  role: string;
  content: string;
  dataCard?: unknown;
}) {
  await db.insert(chatHistory).values(data);
}

// ── AI Memory ──

export async function getMemoryFacts(userId: string) {
  return db.select().from(aiMemory).where(eq(aiMemory.userId, userId));
}

export async function addMemoryFact(data: {
  userId: string;
  fact: string;
  category: string;
}) {
  await db.insert(aiMemory).values(data);
}

// ── Plaid ──

export async function getPlaidItems(userId: string) {
  return db.select().from(plaidItems).where(eq(plaidItems.userId, userId));
}

export async function savePlaidItem(data: {
  userId: string;
  accessToken: string;
  itemId: string;
  institutionName?: string;
}) {
  await db.insert(plaidItems).values(data);
}

export async function updatePlaidCursor(itemId: string, cursor: string) {
  await db
    .update(plaidItems)
    .set({ cursor })
    .where(eq(plaidItems.itemId, itemId));
}

// ── Channel Preferences ──

export async function getChannelPrefs(userId: string) {
  const [prefs] = await db
    .select()
    .from(channelPreferences)
    .where(eq(channelPreferences.userId, userId));
  return prefs ?? null;
}

export async function upsertChannelPrefs(
  userId: string,
  data: { telegram?: boolean; whatsapp?: boolean; imessage?: boolean }
) {
  await db
    .insert(channelPreferences)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: channelPreferences.userId,
      set: data,
    });
}
