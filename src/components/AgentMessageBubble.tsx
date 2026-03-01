"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AgentMessage } from "@/types";
import { AGENT_MESSAGE_STYLES, formatRelativeTime } from "@/lib/agent-messages";
import { ArthaAvatar } from "./ArthaAvatar";
import { useEngagement } from "./EngagementProvider";

interface AgentMessageBubbleProps {
  message: AgentMessage;
  scrollRoot: React.RefObject<HTMLDivElement | null>;
  onQuickReply?: (text: string) => void;
}

export function AgentMessageBubble({ message, scrollRoot, onQuickReply }: AgentMessageBubbleProps) {
  const { recordAgentMessageRead, state } = useEngagement();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const style = AGENT_MESSAGE_STYLES[message.type];
  const isRead = state.agentMessagesRead.includes(message.id);

  useEffect(() => {
    if (isRead) return;
    const el = bubbleRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          recordAgentMessageRead(message.id);
          observer.disconnect();
        }
      },
      { root: scrollRoot.current, threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isRead, message.id, recordAgentMessageRead, scrollRoot]);

  return (
    <motion.div
      ref={bubbleRef}
      className="flex justify-start mb-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mr-2 mt-1">
        <ArthaAvatar size="sm" />
      </div>

      {/* Message bubble with colored left border */}
      <div className={`max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 glass border-l-4 ${style.borderColor}`}>
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${style.bgColor}`}
            style={{ color: style.color }}
          >
            {style.label}
          </span>
          <span className="text-[10px] text-artha-muted">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Quick reply chips */}
        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {message.quickReplies.map((reply) => (
              <motion.button
                key={reply}
                className="text-xs px-3 py-1 rounded-full border border-artha-accent/20 text-artha-muted hover:text-artha-text hover:border-artha-accent/40 transition-colors"
                whileTap={{ scale: 0.95 }}
                onClick={() => onQuickReply?.(reply)}
              >
                {reply}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
