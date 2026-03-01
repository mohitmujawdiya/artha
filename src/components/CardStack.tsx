"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { Insight, BehavioralPattern, Transaction } from "@/types";
import { StoryCard } from "./StoryCard";
import { useState, useCallback, useRef, useEffect } from "react";

interface CardStackProps {
  insights: Insight[];
  patterns?: BehavioralPattern[];
  transactions?: Transaction[];
  onCardView?: (insightId: string) => void;
  onChallengeAccept?: (insightId: string) => void;
}

const SWIPE_THRESHOLD = 0.2;
const VELOCITY_THRESHOLD = 300;

export function CardStack({ insights, patterns, transactions, onCardView, onChallengeAccept }: CardStackProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [navigatingAway, setNavigatingAway] = useState(false);
  const dragStarted = useRef(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-8, 0, 8]);
  const cardOpacity = useTransform(
    x,
    [-250, -120, 0, 120, 250],
    [0.4, 0.85, 1, 0.85, 0.4]
  );

  // Peek card reacts to drag distance
  const absX = useTransform(x, (v) => Math.abs(v));
  const peekScale = useTransform(absX, [0, 60, 250], [0.95, 0.97, 1]);
  const peekY = useTransform(absX, [0, 250], [8, 0]);

  const total = insights.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= total - 1;

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      dragStarted.current = false;
      if (isAnimating || navigatingAway) return;

      const cardWidth = window.innerWidth;
      const swipeDistance = Math.abs(info.offset.x);
      const velocity = Math.abs(info.velocity.x);
      const isSwipe =
        swipeDistance > cardWidth * SWIPE_THRESHOLD ||
        velocity > VELOCITY_THRESHOLD;

      // Determine direction: negative offset = swiped left = forward
      const dir = info.offset.x < 0 ? 1 : -1;

      // Block: backward on first card, forward on last card already handled below
      if (!isSwipe || (dir === -1 && isFirst)) {
        animate(x, 0, {
          type: "spring",
          stiffness: 400,
          damping: 30,
        });
        return;
      }

      const flyTo = dir === 1 ? -cardWidth : cardWidth;
      setIsAnimating(true);

      animate(x, flyTo, {
        type: "tween",
        duration: 0.2,
        ease: "easeOut",
        onComplete: () => {
          if (dir === 1 && isLast) {
            // Last card — keep it off-screen and navigate
            setNavigatingAway(true);
            router.push("/future");
          } else if (dir === -1) {
            // Going backward
            setCurrentIndex((prev) => Math.max(0, prev - 1));
            x.set(0);
            setIsAnimating(false);
          } else {
            // Going forward
            setCurrentIndex((prev) => prev + 1);
            x.set(0);
            setIsAnimating(false);
          }
        },
      });
    },
    [isAnimating, navigatingAway, isFirst, isLast, x, router]
  );

  // Fire onCardView when currentIndex changes
  useEffect(() => {
    if (onCardView && insights[currentIndex]) {
      onCardView(insights[currentIndex].id);
    }
  }, [currentIndex, onCardView, insights]);

  const handleTap = useCallback(() => {
    if (!dragStarted.current && !isAnimating && !navigatingAway) {
      if (isLast) {
        // Last card tap — fly off and navigate
        setIsAnimating(true);
        setNavigatingAway(true);
        animate(x, -window.innerWidth, {
          type: "tween",
          duration: 0.2,
          ease: "easeOut",
          onComplete: () => {
            router.push("/future");
          },
        });
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  }, [isAnimating, navigatingAway, isLast, x, router]);

  // Don't render anything if navigating away (card stays off-screen)
  if (navigatingAway) {
    return <div className="min-h-screen" />;
  }

  // Render current + next card, keyed by insight.id for DOM reuse
  const visibleIndices = [currentIndex + 1, currentIndex].filter(
    (i) => i >= 0 && i < total
  );

  return (
    <div className="relative h-full px-5 pt-3 pb-2 flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pb-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-6 bg-artha-accent"
                : i < currentIndex
                  ? "w-1.5 bg-artha-accent/50"
                  : "w-1.5 bg-artha-surface"
            }`}
          />
        ))}
      </div>

      {/* Card area — relative wrapper sizes to its content */}
      <div className="relative">
        {visibleIndices.map((i) => {
          const isCurrent = i === currentIndex;
          const insight = insights[i];

          if (isCurrent) {
            return (
              <motion.div
                key={insight.id}
                className="touch-pan-y rounded-3xl overflow-hidden"
                style={{
                  x,
                  rotate,
                  opacity: cardOpacity,
                  zIndex: 20,
                  position: "relative",
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                dragMomentum={false}
                onDragStart={() => {
                  dragStarted.current = true;
                }}
                onDragEnd={handleDragEnd}
                onClick={handleTap}
              >
                <StoryCard
                  insight={insight}
                  patterns={patterns}
                  transactions={transactions}
                  onAction={insight.type === "challenge" && onChallengeAccept ? () => onChallengeAccept(insight.id) : undefined}
                />
              </motion.div>
            );
          }

          // Next card behind — absolute, layered under the current card
          return (
            <motion.div
              key={insight.id}
              className="absolute inset-x-0 top-0 pointer-events-none rounded-3xl overflow-hidden"
              style={{
                scale: peekScale,
                y: peekY,
                zIndex: 10,
              }}
            >
              <StoryCard
                insight={insight}
                patterns={patterns}
                transactions={transactions}
                animated={false}
                peek
              />
            </motion.div>
          );
        })}
      </div>

      {/* Navigation hint — right under the card */}
      <div className="text-center text-artha-muted/50 text-xs pt-3">
        {isLast ? "Swipe to see your future" : "Swipe or tap to continue"}
      </div>
    </div>
  );
}
