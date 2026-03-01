"use client";

import { useState, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import { motion } from "framer-motion";
import { Bank } from "@phosphor-icons/react";

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
}

export function PlaidLinkButton({ onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const createLinkToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/plaid/create-link-token", {
        method: "POST",
      });
      const data = await res.json();
      if (data.linkToken) {
        setLinkToken(data.linkToken);
      }
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      try {
        await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicToken,
            institutionName: metadata.institution?.name,
          }),
        });
        setConnected(true);
        onSuccess?.();
      } catch {
        // handle error
      }
    },
  });

  const handleClick = async () => {
    if (linkToken) {
      open();
    } else {
      await createLinkToken();
    }
  };

  // Open Plaid Link once token is ready
  if (linkToken && ready) {
    open();
  }

  if (connected) {
    return (
      <div className="glass rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-artha-green/20 flex items-center justify-center">
          <Bank size={20} className="text-artha-green" />
        </div>
        <div>
          <p className="font-semibold text-sm text-artha-green">Bank Connected</p>
          <p className="text-xs text-artha-muted">Syncing transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={isLoading}
      className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors disabled:opacity-50"
    >
      <div className="w-10 h-10 rounded-full bg-artha-accent/20 flex items-center justify-center">
        <Bank size={20} className="text-artha-accent" />
      </div>
      <div className="text-left">
        <p className="font-semibold text-sm">
          {isLoading ? "Connecting..." : "Connect Your Bank"}
        </p>
        <p className="text-xs text-artha-muted">
          See real spending patterns
        </p>
      </div>
    </motion.button>
  );
}
