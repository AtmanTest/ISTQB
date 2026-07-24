// ===== ISTQB CTFL v4.0.1 — Spaced Repetition Tests =====

import { describe, it, expect } from 'vitest';
import { calcNextReview, getDueFlashcards, sortByPriority } from '@/utils/spaced-repetition';
import type { Flashcard } from '@/types';

// ── calcNextReview ───────────────────────────────────

describe('calcNextReview', () => {
  // 'again' resets interval to 1 and streak to 0
  it("'again' resets interval to 1", () => {
    const result = calcNextReview('again', 30, 5);
    expect(result.intervalDays).toBe(1);
    expect(result.newStreak).toBe(0);
  });

  it("'hard' sets interval to at least 3", () => {
    const result = calcNextReview('hard', 30, 5);
    // hard: max(SPACED_REPETITION_INTERVALS.hard(3), round(30 * 0.5)) = max(3, 15) = 15
    expect(result.intervalDays).toBe(15);
  });

  it("'hard' uses minimum 3 when interval * 0.5 is less than 3", () => {
    const result = calcNextReview('hard', 1, 0);
    // hard: max(3, round(1 * 0.5)) = max(3, 1) = 3
    expect(result.intervalDays).toBe(3);
  });

  it("'good' sets interval to at least 7", () => {
    const result = calcNextReview('good', 0, 0);
    // good with streak=0: multiplier=1, max(7, round(0 * 1)) = 7
    expect(result.intervalDays).toBe(7);
  });

  it("'good' with existing streak doubles the interval", () => {
    const result = calcNextReview('good', 10, 3);
    // good with streak>0: multiplier=2, max(7, round(10 * 2)) = 20
    expect(result.intervalDays).toBe(20);
  });

  it("'easy' sets interval to at least 14", () => {
    const result = calcNextReview('easy', 0, 0);
    // easy with streak=0: multiplier=2, max(14, round(0 * 2)) = 14
    expect(result.intervalDays).toBe(14);
  });

  it("'easy' with existing streak applies 3x multiplier", () => {
    const result = calcNextReview('easy', 10, 2);
    // easy with streak>0: multiplier=3, max(14, round(10 * 3)) = 30
    expect(result.intervalDays).toBe(30);
  });

  it('correct streak increments on good/easy', () => {
    const good = calcNextReview('good', 5, 2);
    expect(good.newStreak).toBe(3);

    const easy = calcNextReview('easy', 5, 2);
    expect(easy.newStreak).toBe(3);
  });

  it('correct streak resets on again', () => {
    const result = calcNextReview('again', 10, 5);
    expect(result.newStreak).toBe(0);
  });

  it('hard preserves the existing streak', () => {
    const result = calcNextReview('hard', 10, 5);
    expect(result.newStreak).toBe(5);
  });

  it('next review date calculation is in the future', () => {
    const result = calcNextReview('good', 7, 1);
    const nextDate = new Date(result.nextReviewAt);
    const now = new Date();
    expect(nextDate.getTime()).toBeGreaterThan(now.getTime());
  });

  it('maximum interval cap at 365 days', () => {
    // Push interval far beyond cap
    const result = calcNextReview('easy', 1000, 10);
    expect(result.intervalDays).toBeLessThanOrEqual(365);
  });

  it('handles currentInterval of 0 for new cards', () => {
    const result = calcNextReview('good', 0, 0);
    expect(result.intervalDays).toBe(7);
    expect(result.newStreak).toBe(1);
  });
});

// ── getDueFlashcards ─────────────────────────────────

describe('getDueFlashcards', () => {
  const baseCard = {
    id: 'fc1',
    chapterId: 'ch1',
    lessonId: null,
    loId: null,
    front: 'Front',
    back: 'Back',
    hint: null,
    tags: [],
    difficulty: 'medium' as const,
    intervalDays: 1,
    reviewCount: 1,
    correctStreak: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('returns cards with null nextReviewAt', () => {
    const cards: Flashcard[] = [
      { ...baseCard, id: 'fc1', nextReviewAt: null },
      { ...baseCard, id: 'fc2', nextReviewAt: '2099-01-01T00:00:00.000Z' },
    ];
    const due = getDueFlashcards(cards);
    expect(due).toHaveLength(1);
    expect(due[0].id).toBe('fc1');
  });

  it('returns cards with past nextReviewAt', () => {
    const cards: Flashcard[] = [
      { ...baseCard, id: 'fc1', nextReviewAt: '2020-01-01T00:00:00.000Z' },
      { ...baseCard, id: 'fc2', nextReviewAt: '2099-01-01T00:00:00.000Z' },
    ];
    const due = getDueFlashcards(cards);
    expect(due).toHaveLength(1);
    expect(due[0].id).toBe('fc1');
  });

  it('excludes future cards', () => {
    const cards: Flashcard[] = [
      { ...baseCard, id: 'fc1', nextReviewAt: '2099-01-01T00:00:00.000Z' },
      { ...baseCard, id: 'fc2', nextReviewAt: '2099-06-01T00:00:00.000Z' },
    ];
    const due = getDueFlashcards(cards);
    expect(due).toHaveLength(0);
  });

  it('sorts null nextReviewAt before past dates', () => {
    const cards: Flashcard[] = [
      { ...baseCard, id: 'fc1', nextReviewAt: '2020-01-01T00:00:00.000Z' },
      { ...baseCard, id: 'fc2', nextReviewAt: null },
    ];
    const due = getDueFlashcards(cards);
    expect(due[0].id).toBe('fc2');
  });
});

// ── sortByPriority ───────────────────────────────────

describe('sortByPriority', () => {
  const baseCard = {
    chapterId: 'ch1',
    lessonId: null,
    loId: null,
    front: 'Front',
    back: 'Back',
    hint: null,
    tags: [],
    intervalDays: 1,
    reviewCount: 1,
    correctStreak: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('puts due cards before non-due cards', () => {
    const cards: Flashcard[] = [
      { ...baseCard, id: 'fc1', difficulty: 'medium', nextReviewAt: '2099-01-01T00:00:00.000Z' },
      { ...baseCard, id: 'fc2', difficulty: 'easy', nextReviewAt: null },
    ];
    const sorted = sortByPriority(cards);
    expect(sorted[0].id).toBe('fc2');
  });

  it('sorts hard difficulty before medium and easy', () => {
    const cards: Flashcard[] = [
      { ...baseCard, id: 'fc1', difficulty: 'medium', nextReviewAt: '2020-01-01T00:00:00.000Z' },
      { ...baseCard, id: 'fc2', difficulty: 'hard', nextReviewAt: '2020-01-01T00:00:00.000Z' },
      { ...baseCard, id: 'fc3', difficulty: 'easy', nextReviewAt: '2020-01-01T00:00:00.000Z' },
    ];
    const sorted = sortByPriority(cards);
    expect(sorted[0].id).toBe('fc2');
    expect(sorted[1].id).toBe('fc1');
    expect(sorted[2].id).toBe('fc3');
  });
});
