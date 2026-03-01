"use client";

import { motion } from "framer-motion";
import { ChatMessage as ChatMessageType } from "@/types";
import { ArthaAvatar } from "./ArthaAvatar";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className="mr-2 mt-1">
          <ArthaAvatar size="sm" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-artha-accent text-white rounded-br-sm"
            : "glass rounded-bl-sm"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Inline data card with staggered row animations */}
        {message.dataCard && (
          <div className="mt-3 bg-artha-bg/50 rounded-xl p-3">
            <p className="text-xs font-semibold text-artha-accent mb-2">
              {message.dataCard.title}
            </p>
            {message.dataCard.items.map((item, i) => (
              <motion.div
                key={i}
                className="flex justify-between items-center py-1 border-b border-artha-surface/50 last:border-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.1 }}
              >
                <span className="text-xs text-artha-muted">{item.label}</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: item.color || "#e2e8f0" }}
                >
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="mr-2 mt-1">
        <ArthaAvatar size="sm" pulse />
      </div>
      <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-artha-muted rounded-full"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
