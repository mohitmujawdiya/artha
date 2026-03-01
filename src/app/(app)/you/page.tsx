"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Gear, Plus, PencilSimple, Check, X } from "@phosphor-icons/react";
import { GoalProgress } from "@/components/GoalProgress";
import { PlaidLinkButton } from "@/components/PlaidLink";
import { useTransactions } from "@/hooks/useTransactions";
import type { FinancialGoal } from "@/types";

const EMOJI_OPTIONS = ["🎯", "🏠", "🚗", "✈️", "🎓", "💰", "📱", "🏋️", "🎸", "👶", "💍", "🏖️", "📚", "🩺"];

interface ProfileData {
  name: string;
  age: number | null;
  monthlyIncome: number | null;
  currentSavings: number | null;
  goals: FinancialGoal[];
}

export default function YouPage() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { transactions } = useTransactions();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "", emoji: "🎯" });
  const [savingGoal, setSavingGoal] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch { /* fallback */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Compute spending by category from transactions
  const spendingByCategory = transactions.reduce<Record<string, number>>(
    (acc, txn) => {
      if (txn.amount > 0) {
        acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
      }
      return acc;
    },
    {}
  );
  const topCategories = Object.entries(spendingByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  async function saveField(field: string, value: number) {
    if (!profile) return;
    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          [field]: value,
        }),
      });
      setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
    } catch { /* ignore */ }
    setEditingField(null);
  }

  function startEdit(field: string, currentValue: number | null) {
    setEditingField(field);
    setEditValue(currentValue != null ? String(currentValue) : "");
  }

  function cancelEdit() {
    setEditingField(null);
    setEditValue("");
  }

  async function handleCreateGoal() {
    if (!newGoal.name.trim() || !newGoal.targetAmount || Number(newGoal.targetAmount) <= 0) return;
    setSavingGoal(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGoal.name.trim(),
          targetAmount: Number(newGoal.targetAmount),
          emoji: newGoal.emoji,
        }),
      });
      if (res.ok) {
        setShowGoalForm(false);
        setNewGoal({ name: "", targetAmount: "", emoji: "🎯" });
        fetchProfile();
      }
    } catch { /* ignore */ }
    finally { setSavingGoal(false); }
  }

  const userName = clerkUser?.firstName || profile?.name || "You";
  const hasProfile = profile && profile.monthlyIncome != null;

  if (isLoading) {
    return (
      <main className="h-full flex items-center justify-center">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-artha-accent border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </main>
    );
  }

  return (
    <main className="h-full overflow-y-auto px-5 py-6 no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.h1
          className="font-display text-2xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {userName}
        </motion.h1>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/settings")}
          className="p-2 rounded-full hover:bg-white/5 transition-colors"
        >
          <Gear size={24} className="text-artha-muted" />
        </motion.button>
      </div>

      <div className="mt-6 space-y-4">
        {/* Profile Card */}
        <motion.div
          className="glass rounded-2xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs text-artha-muted uppercase tracking-wider mb-3">
            Financial Profile
          </p>

          {!hasProfile ? (
            <div className="text-center py-4">
              <p className="text-sm text-artha-muted mb-3">
                Complete your profile to get personalized insights
              </p>
              <button
                onClick={() => router.push("/onboarding")}
                className="px-4 py-2 bg-artha-accent rounded-full text-sm font-semibold text-white"
              >
                Complete Profile
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Monthly Income */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-artha-muted">Monthly Income</span>
                {editingField === "monthlyIncome" ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-artha-muted">$</span>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 bg-transparent outline-none text-sm text-right text-artha-text border-b border-artha-accent"
                      autoFocus
                    />
                    <button onClick={() => saveField("monthlyIncome", Number(editValue))} className="p-1">
                      <Check size={14} className="text-artha-green" />
                    </button>
                    <button onClick={cancelEdit} className="p-1">
                      <X size={14} className="text-red-400" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit("monthlyIncome", profile.monthlyIncome)}
                    className="flex items-center gap-1 group"
                  >
                    <span className="text-sm font-semibold">
                      ${profile.monthlyIncome?.toLocaleString() ?? "—"}
                    </span>
                    <PencilSimple size={12} className="text-artha-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>

              {/* Current Savings */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-artha-muted">Savings</span>
                {editingField === "currentSavings" ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-artha-muted">$</span>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 bg-transparent outline-none text-sm text-right text-artha-text border-b border-artha-accent"
                      autoFocus
                    />
                    <button onClick={() => saveField("currentSavings", Number(editValue))} className="p-1">
                      <Check size={14} className="text-artha-green" />
                    </button>
                    <button onClick={cancelEdit} className="p-1">
                      <X size={14} className="text-red-400" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit("currentSavings", profile.currentSavings)}
                    className="flex items-center gap-1 group"
                  >
                    <span className="text-sm font-semibold">
                      ${profile.currentSavings?.toLocaleString() ?? "—"}
                    </span>
                    <PencilSimple size={12} className="text-artha-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>

              {/* Age */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-artha-muted">Age</span>
                {editingField === "age" ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-16 bg-transparent outline-none text-sm text-right text-artha-text border-b border-artha-accent"
                      autoFocus
                    />
                    <button onClick={() => saveField("age", Number(editValue))} className="p-1">
                      <Check size={14} className="text-artha-green" />
                    </button>
                    <button onClick={cancelEdit} className="p-1">
                      <X size={14} className="text-red-400" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit("age", profile.age)}
                    className="flex items-center gap-1 group"
                  >
                    <span className="text-sm font-semibold">
                      {profile.age ?? "—"}
                    </span>
                    <PencilSimple size={12} className="text-artha-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Goals Section */}
        <motion.div
          className="glass rounded-2xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-artha-muted uppercase tracking-wider">
              Your Goals
            </p>
            {(!profile?.goals || profile.goals.length < 3) && (
              <button
                onClick={() => setShowGoalForm(true)}
                className="p-1 rounded-full hover:bg-white/5 transition-colors"
              >
                <Plus size={16} className="text-artha-accent" />
              </button>
            )}
          </div>

          {profile?.goals && profile.goals.length > 0 ? (
            <div className="space-y-4">
              {profile.goals.map((goal) => (
                <GoalProgress
                  key={goal.id}
                  name={goal.name}
                  current={goal.currentAmount}
                  target={goal.targetAmount}
                  emoji={goal.emoji || "🎯"}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-artha-muted">
                No goals yet. Tap + to add your first goal.
              </p>
            </div>
          )}

          {/* Inline Goal Creation Form */}
          <AnimatePresence>
            {showGoalForm && (
              <motion.div
                className="mt-4 glass rounded-2xl p-4 border border-artha-accent/20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewGoal((g) => ({ ...g, emoji }))}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-colors ${
                        newGoal.emoji === emoji
                          ? "bg-artha-accent/30 ring-1 ring-artha-accent"
                          : "hover:bg-white/5"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal((g) => ({ ...g, name: e.target.value }))}
                  placeholder="Goal name (e.g. Emergency fund)"
                  maxLength={100}
                  className="w-full bg-transparent outline-none text-sm text-artha-text placeholder:text-artha-muted/40 mb-2"
                  autoFocus
                />
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-artha-muted text-sm">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal((g) => ({ ...g, targetAmount: e.target.value }))}
                    placeholder="Target amount"
                    className="w-full bg-transparent outline-none text-sm text-artha-text placeholder:text-artha-muted/40"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateGoal}
                    disabled={savingGoal || !newGoal.name.trim() || !newGoal.targetAmount}
                    className="flex-1 py-2 bg-artha-accent rounded-full text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {savingGoal ? "Saving..." : "Add Goal"}
                  </button>
                  <button
                    onClick={() => { setShowGoalForm(false); setNewGoal({ name: "", targetAmount: "", emoji: "🎯" }); }}
                    className="px-4 py-2 text-xs text-artha-muted hover:text-artha-text transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bank Connection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-artha-muted uppercase tracking-wider mb-2">
            Bank Connection
          </p>
          <PlaidLinkButton />
        </motion.div>

        {/* Spending Summary */}
        {topCategories.length > 0 && (
          <motion.div
            className="glass rounded-2xl p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs text-artha-muted uppercase tracking-wider mb-3">
              Spending Summary
            </p>
            <div className="space-y-2">
              {topCategories.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-artha-text capitalize">{category}</span>
                  <span className="text-sm font-semibold">${Math.round(amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
