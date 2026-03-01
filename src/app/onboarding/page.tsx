"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getOnboardingData } from "@/lib/onboarding";

type Phase = "age" | "income" | "savings" | "goals";

interface GoalEntry {
  name: string;
  targetAmount: string;
  emoji: string;
}

const STORAGE_KEY = "artha-onboarding-progress";

const EMOJI_OPTIONS = [
  "🏠", "🚗", "✈️", "🎓", "💰", "📱", "🏋️", "🎸",
  "👶", "💍", "🏖️", "📚", "🩺", "🐕", "🎮", "👗",
];

const INCOME_CHIPS = [1500, 3000, 5000, 8000];
const SAVINGS_CHIPS = [500, 2000, 5000, 10000];

function loadProgress(): {
  age: string;
  monthlyIncome: string;
  currentSavings: string;
  goals: GoalEntry[];
  phase: Phase;
} {
  if (typeof window === "undefined") {
    return { age: "", monthlyIncome: "", currentSavings: "", goals: [{ name: "", targetAmount: "", emoji: "🎯" }], phase: "age" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { age: "", monthlyIncome: "", currentSavings: "", goals: [{ name: "", targetAmount: "", emoji: "🎯" }], phase: "age" };
}

function saveProgress(data: {
  age: string;
  monthlyIncome: string;
  currentSavings: string;
  goals: GoalEntry[];
  phase: Phase;
}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user: clerkUser } = useUser();

  const stored = loadProgress();
  const [phase, setPhase] = useState<Phase>(stored.phase);
  const [age, setAge] = useState(stored.age);
  const [monthlyIncome, setMonthlyIncome] = useState(stored.monthlyIncome);
  const [currentSavings, setCurrentSavings] = useState(stored.currentSavings);
  const [goals, setGoals] = useState<GoalEntry[]>(stored.goals);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const userName =
    clerkUser?.firstName ||
    getOnboardingData()?.name ||
    "friend";

  // Auto-focus input on phase change
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, [phase]);

  // Persist progress
  useEffect(() => {
    saveProgress({ age, monthlyIncome, currentSavings, goals, phase });
  }, [age, monthlyIncome, currentSavings, goals, phase]);

  function nextPhase() {
    const order: Phase[] = ["age", "income", "savings", "goals"];
    const idx = order.indexOf(phase);
    if (idx < order.length - 1) {
      setPhase(order[idx + 1]);
    }
  }

  function canContinue(): boolean {
    switch (phase) {
      case "age": return age !== "" && Number(age) >= 13 && Number(age) <= 120;
      case "income": return monthlyIncome !== "" && Number(monthlyIncome) > 0;
      case "savings": return currentSavings !== "" && Number(currentSavings) >= 0;
      case "goals": return goals.some((g) => g.name.trim() && Number(g.targetAmount) > 0);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: userName,
      };
      if (age) payload.age = Number(age);
      if (monthlyIncome) payload.monthlyIncome = Number(monthlyIncome);
      if (currentSavings) payload.currentSavings = Number(currentSavings);

      const validGoals = goals
        .filter((g) => g.name.trim() && Number(g.targetAmount) > 0)
        .map((g) => ({
          name: g.name.trim(),
          targetAmount: Number(g.targetAmount),
          emoji: g.emoji,
        }));
      if (validGoals.length > 0) payload.goals = validGoals;

      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Mark onboarding complete
      localStorage.setItem("artha-onboarding-complete", "true");
      localStorage.removeItem(STORAGE_KEY);
      router.push("/moments");
    } catch {
      setIsSubmitting(false);
    }
  }

  async function handleSkipAll() {
    setIsSubmitting(true);
    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName }),
      });
      localStorage.setItem("artha-onboarding-complete", "true");
      localStorage.removeItem(STORAGE_KEY);
      router.push("/moments");
    } catch {
      setIsSubmitting(false);
    }
  }

  function updateGoal(index: number, field: keyof GoalEntry, value: string) {
    setGoals((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addGoal() {
    if (goals.length < 3) {
      setGoals((prev) => [...prev, { name: "", targetAmount: "", emoji: "🎯" }]);
    }
  }

  function removeGoal(index: number) {
    if (goals.length > 1) {
      setGoals((prev) => prev.filter((_, i) => i !== index));
    }
  }

  const phaseNumber = ["age", "income", "savings", "goals"].indexOf(phase) + 1;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Progress dots */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              n <= phaseNumber ? "bg-artha-accent" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Phase 1: Age ── */}
        {phase === "age" && (
          <motion.div
            key="age"
            className="text-center z-10 w-full max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <motion.h1
              className="font-display text-2xl font-bold text-artha-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Hey {userName}, how old are you?
            </motion.h1>
            <motion.p
              className="mt-2 text-sm text-artha-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              We&apos;ll tailor advice to your life stage
            </motion.p>

            <motion.div
              className="mt-8 glass rounded-2xl px-4 py-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canContinue()) nextPhase();
                }}
                placeholder="Your age"
                className="w-full bg-transparent outline-none text-center font-display text-2xl text-artha-text placeholder:text-artha-muted/40"
              />
            </motion.div>

            <motion.div
              className="mt-6 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                className="px-8 py-3 bg-artha-accent rounded-full font-semibold text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.95 }}
                disabled={!canContinue()}
                onClick={nextPhase}
              >
                Continue
              </motion.button>
              <button
                onClick={nextPhase}
                className="text-xs text-artha-muted hover:text-artha-text transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ── Phase 2: Income ── */}
        {phase === "income" && (
          <motion.div
            key="income"
            className="text-center z-10 w-full max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <motion.h1
              className="font-display text-2xl font-bold text-artha-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              What&apos;s your monthly income?
            </motion.h1>
            <motion.p
              className="mt-2 text-sm text-artha-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              After taxes — approximate is fine
            </motion.p>

            <motion.div
              className="mt-8 glass rounded-2xl px-4 py-3 flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-artha-muted text-2xl font-display mr-1">$</span>
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canContinue()) nextPhase();
                }}
                placeholder="0"
                className="w-full bg-transparent outline-none text-center font-display text-2xl text-artha-text placeholder:text-artha-muted/40"
              />
            </motion.div>

            <motion.div
              className="mt-4 flex flex-wrap justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {INCOME_CHIPS.map((val) => (
                <button
                  key={val}
                  onClick={() => setMonthlyIncome(String(val))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    monthlyIncome === String(val)
                      ? "bg-artha-accent text-white"
                      : "glass text-artha-muted hover:text-artha-text"
                  }`}
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </motion.div>

            <motion.div
              className="mt-6 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                className="px-8 py-3 bg-artha-accent rounded-full font-semibold text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.95 }}
                disabled={!canContinue()}
                onClick={nextPhase}
              >
                Continue
              </motion.button>
              <button
                onClick={nextPhase}
                className="text-xs text-artha-muted hover:text-artha-text transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ── Phase 3: Savings ── */}
        {phase === "savings" && (
          <motion.div
            key="savings"
            className="text-center z-10 w-full max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <motion.h1
              className="font-display text-2xl font-bold text-artha-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              How much do you have saved?
            </motion.h1>
            <motion.p
              className="mt-2 text-sm text-artha-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Total across all accounts
            </motion.p>

            <motion.div
              className="mt-8 glass rounded-2xl px-4 py-3 flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-artha-muted text-2xl font-display mr-1">$</span>
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canContinue()) nextPhase();
                }}
                placeholder="0"
                className="w-full bg-transparent outline-none text-center font-display text-2xl text-artha-text placeholder:text-artha-muted/40"
              />
            </motion.div>

            <motion.div
              className="mt-4 flex flex-wrap justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {SAVINGS_CHIPS.map((val) => (
                <button
                  key={val}
                  onClick={() => setCurrentSavings(String(val))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    currentSavings === String(val)
                      ? "bg-artha-accent text-white"
                      : "glass text-artha-muted hover:text-artha-text"
                  }`}
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </motion.div>

            <motion.div
              className="mt-6 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                className="px-8 py-3 bg-artha-accent rounded-full font-semibold text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.95 }}
                disabled={!canContinue()}
                onClick={nextPhase}
              >
                Continue
              </motion.button>
              <button
                onClick={nextPhase}
                className="text-xs text-artha-muted hover:text-artha-text transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ── Phase 4: Goals ── */}
        {phase === "goals" && (
          <motion.div
            key="goals"
            className="text-center z-10 w-full max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <motion.h1
              className="font-display text-2xl font-bold text-artha-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              What are you saving for?
            </motion.h1>
            <motion.p
              className="mt-2 text-sm text-artha-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Add up to 3 goals
            </motion.p>

            <motion.div
              className="mt-6 space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {goals.map((goal, idx) => (
                <div key={idx} className="glass rounded-2xl p-4 text-left">
                  {/* Emoji picker */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => updateGoal(idx, "emoji", emoji)}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${
                          goal.emoji === emoji
                            ? "bg-artha-accent/30 ring-1 ring-artha-accent"
                            : "hover:bg-white/5"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <input
                    ref={idx === 0 ? inputRef : undefined}
                    type="text"
                    value={goal.name}
                    onChange={(e) => updateGoal(idx, "name", e.target.value)}
                    placeholder="Goal name (e.g. Emergency fund)"
                    maxLength={100}
                    className="w-full bg-transparent outline-none text-sm text-artha-text placeholder:text-artha-muted/40 mb-2"
                  />

                  <div className="flex items-center gap-1">
                    <span className="text-artha-muted text-sm">$</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={goal.targetAmount}
                      onChange={(e) => updateGoal(idx, "targetAmount", e.target.value)}
                      placeholder="Target amount"
                      className="w-full bg-transparent outline-none text-sm text-artha-text placeholder:text-artha-muted/40"
                    />
                  </div>

                  {goals.length > 1 && (
                    <button
                      onClick={() => removeGoal(idx)}
                      className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {goals.length < 3 && (
                <button
                  onClick={addGoal}
                  className="w-full glass rounded-2xl p-3 text-sm text-artha-muted hover:text-artha-text transition-colors border border-dashed border-white/10"
                >
                  + Add another goal
                </button>
              )}
            </motion.div>

            <motion.div
              className="mt-6 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                className="px-8 py-3 bg-artha-accent rounded-full font-semibold text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting || !canContinue()}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Setting up..." : "Let\u2019s go"}
              </motion.button>
              <button
                onClick={handleSkipAll}
                disabled={isSubmitting}
                className="text-xs text-artha-muted hover:text-artha-text transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
