"use client";

import { motion } from "framer-motion";
import { CardStack } from "@/components/CardStack";
import { useTransactions } from "@/hooks/useTransactions";
import { useEngagement } from "@/components/EngagementProvider";
import { PlaidLinkButton } from "@/components/PlaidLink";
import { Bank } from "@phosphor-icons/react";

export default function MomentsPage() {
  const { insights, patterns, transactions, isDemo, isLoading } = useTransactions();
  const { acceptChallenge } = useEngagement();

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

  if (isDemo) {
    return (
      <main className="h-full overflow-y-auto px-5 py-6 no-scrollbar">
        <motion.div
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-artha-accent/20 flex items-center justify-center mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Bank size={32} className="text-artha-accent" />
          </motion.div>

          <h1 className="font-display text-2xl font-bold">
            Connect your bank to get started
          </h1>
          <p className="text-sm text-artha-muted mt-2 max-w-xs">
            We&apos;ll analyze your spending patterns and give you personalized insights
          </p>

          <div className="w-full max-w-sm mt-8">
            <PlaidLinkButton onSuccess={() => window.location.reload()} />
          </div>

          <motion.p
            className="text-xs text-artha-muted/60 mt-6 max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Your data is encrypted and never shared. We use Plaid for secure bank connections.
          </motion.p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="h-full overflow-hidden">
      <motion.div
        className="h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <CardStack
          insights={insights}
          patterns={patterns}
          transactions={transactions}
          onChallengeAccept={(id) => {
            const insight = insights.find((i) => i.id === id);
            if (insight) acceptChallenge(id, insight.title);
          }}
        />
      </motion.div>
    </main>
  );
}
