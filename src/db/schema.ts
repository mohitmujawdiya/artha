import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  json,
  boolean,
  serial,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  name: text("name").notNull(),
  age: integer("age"),
  monthlyIncome: real("monthly_income"),
  currentSavings: real("current_savings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const financialGoals = pgTable("financial_goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").notNull().default(0),
  deadline: text("deadline"),
  emoji: text("emoji").default("🎯"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  date: text("date").notNull(),
  amount: real("amount").notNull(),
  merchant: text("merchant").notNull(),
  category: text("category").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  hour: integer("hour").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  isSubscription: boolean("is_subscription").default(false),
  lastUsed: text("last_used"),
  plaidTransactionId: text("plaid_transaction_id"),
});

export const engagementState = pgTable("engagement_state", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  streak: integer("streak").notNull().default(0),
  lastCheckIn: text("last_check_in"),
  activeChallenges: json("active_challenges").$type<
    { insightId: string; title: string; acceptedAt: string }[]
  >().default([]),
  agentMessagesRead: json("agent_messages_read").$type<string[]>().default([]),
});

export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  dataCard: json("data_card"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const aiMemory = pgTable("ai_memory", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  fact: text("fact").notNull(),
  category: text("category").notNull(), // "preference" | "goal" | "habit" | "life_event"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plaidItems = pgTable("plaid_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  accessToken: text("access_token").notNull(),
  itemId: text("item_id").notNull(),
  institutionName: text("institution_name"),
  cursor: text("cursor"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const channelPreferences = pgTable("channel_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  telegram: boolean("telegram").default(false),
  whatsapp: boolean("whatsapp").default(false),
  imessage: boolean("imessage").default(false),
});
