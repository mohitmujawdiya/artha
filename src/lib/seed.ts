import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import rawData from "../../data/transactions.json";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const userId = process.argv[2];
  if (!userId) {
    console.error("Usage: tsx src/lib/seed.ts <clerk-user-id>");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql, { schema });
  const data = rawData as {
    user: { name: string; age: number; monthlyIncome: number; currentSavings: number; goals: { name: string; targetAmount: number; currentAmount: number; deadline?: string; emoji: string }[] };
    transactions: { date: string; amount: number; merchant: string; category: string; dayOfWeek: number; hour: number; isRecurring?: boolean; isSubscription?: boolean; lastUsed?: string }[];
  };

  console.log(`Seeding data for user ${userId}...`);

  // Upsert user
  await db
    .insert(schema.users)
    .values({
      id: userId,
      name: data.user.name,
      age: data.user.age,
      monthlyIncome: data.user.monthlyIncome,
      currentSavings: data.user.currentSavings,
    })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        name: data.user.name,
        age: data.user.age,
        monthlyIncome: data.user.monthlyIncome,
        currentSavings: data.user.currentSavings,
      },
    });

  console.log("  User upserted");

  // Insert goals
  for (const goal of data.user.goals) {
    await db.insert(schema.financialGoals).values({
      userId,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      emoji: goal.emoji,
    });
  }
  console.log(`  ${data.user.goals.length} goals inserted`);

  // Insert transactions in batches of 50
  const txns = data.transactions.map((t) => ({
    userId,
    date: t.date,
    amount: t.amount,
    merchant: t.merchant,
    category: t.category,
    dayOfWeek: t.dayOfWeek,
    hour: t.hour,
    isRecurring: t.isRecurring ?? false,
    isSubscription: t.isSubscription ?? false,
    lastUsed: t.lastUsed,
  }));

  for (let i = 0; i < txns.length; i += 50) {
    await db.insert(schema.transactions).values(txns.slice(i, i + 50));
  }
  console.log(`  ${txns.length} transactions inserted`);

  // Initialize engagement state
  await db
    .insert(schema.engagementState)
    .values({ userId, streak: 5 })
    .onConflictDoUpdate({
      target: schema.engagementState.userId,
      set: { streak: 5 },
    });
  console.log("  Engagement state initialized");

  console.log("Done!");
}

seed().catch(console.error);
