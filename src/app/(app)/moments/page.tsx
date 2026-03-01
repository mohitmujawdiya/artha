"use client";

import { motion } from "framer-motion";
import { CardStack } from "@/components/CardStack";
import { useTransactions } from "@/hooks/useTransactions";
import { useEngagement } from "@/components/EngagementProvider";

export default function MomentsPage() {
  const { insights, patterns, transactions } = useTransactions();
  const { recordCardView, acceptChallenge } = useEngagement();

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
          onCardView={recordCardView}
          onChallengeAccept={(id) => {
            const insight = insights.find((i) => i.id === id);
            if (insight) acceptChallenge(id, insight.title);
          }}
        />
      </motion.div>
    </main>
  );
}
