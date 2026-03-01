"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PaperPlaneRight, Phone } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ChatMessage as ChatMessageType } from "@/types";
import { ChatMessage, TypingIndicator } from "./ChatMessage";
import { QuickReplyChip } from "./QuickReplyChip";
import { AnalyzingIndicator } from "./AnalyzingIndicator";
import { AgentMessageBubble } from "./AgentMessageBubble";
import { ArthaAvatar } from "./ArthaAvatar";
import { VoiceMode } from "./VoiceMode";
import { useEngagement } from "./EngagementProvider";
import { getOnboardingData } from "@/lib/onboarding";

function getWelcomeMessage(context: string | null, userName: string): ChatMessageType {
  const greeting = userName === "there" ? "Hey there" : `Hey ${userName}`;
  let content = `${greeting}! I'm Artha, your financial sidekick. Ask me anything — whether you can afford something, how to save more, or what your spending patterns look like.`;

  if (context === "moments") {
    content = `${greeting}! I saw you were checking out your spending patterns. Want to dig deeper into any of those, or ask about something specific?`;
  } else if (context === "future") {
    content = `${greeting}! Those projections are interesting, right? Want to talk through the levers, or ask about something specific?`;
  }

  return {
    id: "welcome",
    role: "assistant",
    content,
    timestamp: Date.now(),
    quickReplies: [
      "Can I afford AirPods?",
      "How am I doing?",
      "Help me save more",
    ],
  };
}

export function ChatInterface() {
  const searchParams = useSearchParams();
  const context = searchParams.get("from");
  const { agentMessages } = useEngagement();

  const [messages, setMessages] = useState<ChatMessageType[]>(() => [
    getWelcomeMessage(context, "there"),
  ]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "Can I afford AirPods?",
    "How am I doing?",
    "Help me save more",
  ]);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const historyLoaded = useRef(false);
  const agentMsgsLoaded = useRef(false);

  // Update welcome message with real name from localStorage on mount
  useEffect(() => {
    const userName = getOnboardingData()?.name;
    if (userName) {
      setMessages((prev) => {
        const first = prev[0];
        if (first?.id === "welcome") {
          return [getWelcomeMessage(context, userName), ...prev.slice(1)];
        }
        return prev;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prepend agent messages once patterns are loaded
  useEffect(() => {
    if (agentMsgsLoaded.current || agentMessages.length === 0) return;
    agentMsgsLoaded.current = true;

    const agentChatMessages: ChatMessageType[] = agentMessages
      .slice(0, 3)
      .reverse()
      .map((am) => ({
        id: am.id,
        role: "assistant" as const,
        content: am.content,
        timestamp: am.timestamp,
        agentMessage: am,
      }));
    setMessages((prev) => [...agentChatMessages, ...prev]);
  }, [agentMessages]);

  // Load persisted chat history on mount
  useEffect(() => {
    if (historyLoaded.current) return;
    historyLoaded.current = true;

    fetch("/api/chat/history?limit=50")
      .then((res) => (res.ok ? res.json() : []))
      .then((dbMessages: { role: string; content: string; dataCard?: unknown; timestamp: string }[]) => {
        if (dbMessages.length > 0) {
          const restored: ChatMessageType[] = dbMessages.map((m, i) => ({
            id: `db-${i}`,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: new Date(m.timestamp).getTime(),
            dataCard: m.dataCard as ChatMessageType["dataCard"],
          }));
          // Replace initial messages with DB history + welcome
          const userName = getOnboardingData()?.name || "there";
          setMessages([...restored, getWelcomeMessage(context, userName)]);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isAnalyzing]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping || isAnalyzing) return;

      const userMessage: ChatMessageType = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setQuickReplies([]);
      // Phase 1: Analyzing animation (0.8s)
      setIsAnalyzing(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsAnalyzing(false);

      // Phase 2: Typing indicator while fetching
      setIsTyping(true);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30_000);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            userName: getOnboardingData()?.name,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const data = await response.json();

        const assistantMessage: ChatMessageType = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.content || "I couldn't generate a response. Try again!",
          timestamp: Date.now(),
          dataCard: data.dataCard,
          quickReplies: data.quickReplies,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setQuickReplies(data.quickReplies || []);
      } catch {
        const errorMessage: ChatMessageType = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Try again in a sec!",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isTyping, isAnalyzing]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleVoiceClose = useCallback(() => {
    setVoiceModeActive(false);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass px-4 py-3 flex items-center gap-3">
        <ArthaAvatar size="md" pulse={isAnalyzing || isTyping} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Artha</p>
          <p className="text-xs text-artha-green">
            {isAnalyzing ? "Analyzing..." : isTyping ? "Typing..." : "Online"}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setVoiceModeActive(true)}
          className="text-artha-green hover:text-artha-green/80 p-1"
        >
          <Phone size={20} weight="fill" />
        </motion.button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar"
      >
        {messages.map((msg) =>
          msg.agentMessage ? (
            <AgentMessageBubble
              key={msg.id}
              message={msg.agentMessage}
              scrollRoot={scrollRef}
              onQuickReply={sendMessage}
            />
          ) : (
            <ChatMessage key={msg.id} message={msg} />
          )
        )}
        {isAnalyzing && <AnalyzingIndicator />}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Quick replies */}
      {quickReplies.length > 0 && !isTyping && !isAnalyzing && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {quickReplies.map((reply, i) => (
            <QuickReplyChip
              key={reply}
              label={reply}
              onClick={sendMessage}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2">
        <div className="glass rounded-full flex items-center px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent outline-none text-sm text-artha-text placeholder:text-artha-muted/50"
          />
          <motion.button
            type="submit"
            className="ml-2 text-artha-accent disabled:text-artha-muted/30"
            disabled={!input.trim() || isTyping || isAnalyzing}
            whileTap={{ scale: 0.95 }}
          >
            <PaperPlaneRight size={18} weight="fill" />
          </motion.button>
        </div>
      </form>

      {/* Overlays */}
      <VoiceMode isActive={voiceModeActive} onClose={handleVoiceClose} />
    </div>
  );
}
