// ===== ISTQB CTFL v4.0.1 — Spaced Repetition =====

import type { Flashcard } from '@/types';
import { SPACED_REPETITION_INTERVALS } from '@/lib/constants';

// ── Constants ──────────────────────────────────────
const MAX_INTERVAL_DAYS = 365; // cap at 1 year
const STREAK_MULTIPLIER = 2; // boost factor for consecutive good/easy reviews

// ── Result Type ────────────────────────────────────
export interface NextReviewResult {
  intervalDays: number;
  nextReviewAt: string;
  newStreak: number;
}

/**
 * Calculate the next review interval and date using a simplified SM-2 algorithm.
 *
 * @param result - The review result ('again' | 'hard' | 'good' | 'easy')
 * @param currentInterval - Current interval in days (0 for new cards)
 * @param correctStreak - Number of consecutive correct reviews
 *
 * Rules:
 *  - 'again': interval = SPACED_REPETITION_INTERVALS.again, streak resets to 0
 *  - 'hard':  interval = SPACED_REPETITION_INTERVALS.hard, streak unchanged
 *  - 'good':  interval = currentInterval * STREAK_MULTIPLIER (min INTERVALS.good), streak +1
 *  - 'easy':  interval = currentInterval * STREAK_MULTIPLIER * 1.5 (min INTERVALS.easy), streak +1
 *
 * Returns the new interval in days, the ISO date for next review, and the new streak count.
 */
export function calcNextReview(
  result: 'again' | 'hard' | 'good' | 'easy',
  currentInterval: number,
  correctStreak: number
): NextReviewResult {
  let intervalDays: number;
  let newStreak: number;

  switch (result) {
    case 'again': {
      intervalDays = SPACED_REPETITION_INTERVALS.again;
      newStreak = 0;
      break;
    }
    case 'hard': {
      intervalDays = Math.max(
        SPACED_REPETITION_INTERVALS.hard,
        Math.round(currentInterval * 0.5)
      );
      newStreak = Math.max(correctStreak, 0);
      break;
    }
    case 'good': {
      const multiplier = correctStreak > 0 ? STREAK_MULTIPLIER : 1;
      intervalDays = Math.max(
        SPACED_REPETITION_INTERVALS.good,
        Math.round(currentInterval * multiplier)
      );
      newStreak = correctStreak + 1;
      break;
    }
    case 'easy': {
      const multiplier = correctStreak > 0 ? STREAK_MULTIPLIER * 1.5 : 2;
      intervalDays = Math.max(
        SPACED_REPETITION_INTERVALS.easy,
        Math.round(currentInterval * multiplier)
      );
      newStreak = correctStreak + 1;
      break;
    }
  }

  // Cap the interval
  intervalDays = Math.min(intervalDays, MAX_INTERVAL_DAYS);

  // Calculate next review date
  const now = new Date();
  const nextReview = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    intervalDays,
    nextReviewAt: nextReview.toISOString(),
    newStreak,
  };
}

/**
 * Filter flashcards whose nextReviewAt is in the past or null (never reviewed).
 * Sorted by due date ascending (most overdue first).
 */
export function getDueFlashcards(flashcards: Flashcard[]): Flashcard[] {
  const now = new Date();

  const due = flashcards.filter((card) => {
    if (card.nextReviewAt === null) return true;
    return new Date(card.nextReviewAt) <= now;
  });

  return due.sort((a, b) => {
    // Null nextReviewAt (never reviewed) comes first
    if (a.nextReviewAt === null && b.nextReviewAt === null) return 0;
    if (a.nextReviewAt === null) return -1;
    if (b.nextReviewAt === null) return 1;
    return new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime();
  });
}

/**
 * Sort flashcards by priority for review.
 *
 * Priority rules (higher = sooner):
 *  1. Due cards (nextReviewAt in the past or null)
 *  2. Hard cards before medium before easy
 *  3. Older cards (lower reviewCount) before newer
 *  4. Shorter interval days before longer
 *
 * Returns a new sorted array (does not mutate input).
 */
export function sortByPriority(flashcards: Flashcard[]): Flashcard[] {
  const now = new Date();

  return [...flashcards].sort((a, b) => {
    // Due status: due cards first
    const aDue =
      a.nextReviewAt === null || new Date(a.nextReviewAt) <= now;
    const bDue =
      b.nextReviewAt === null || new Date(b.nextReviewAt) <= now;

    if (aDue && !bDue) return -1;
    if (!aDue && bDue) return 1;

    // Both due or both not due — difficulty: hard first, then medium, then easy
    const diffOrder: Record<string, number> = { hard: 0, medium: 1, easy: 2 };
    const aDiff = diffOrder[a.difficulty] ?? 1;
    const bDiff = diffOrder[b.difficulty] ?? 1;
    if (aDiff !== bDiff) return aDiff - bDiff;

    // Fewer reviews → higher priority
    if (a.reviewCount !== b.reviewCount) {
      return a.reviewCount - b.reviewCount;
    }

    // Shorter remaining interval → higher priority
    if (a.intervalDays !== b.intervalDays) {
      return a.intervalDays - b.intervalDays;
    }

    // Stable fallback
    return a.createdAt.localeCompare(b.createdAt);
  });
}
