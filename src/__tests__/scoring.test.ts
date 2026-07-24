// ===== ISTQB CTFL v4.0.1 — Scoring Algorithm Tests =====

import { describe, it, expect } from 'vitest';
import {
  calcMasteryChapter,
  calcMasteryLo,
  calcRollingAverage,
  calcWeakTopicPriority,
  analyzeConfidenceMismatch,
  checkExamPass,
} from '@/utils/scoring';

// ── calcMasteryChapter ───────────────────────────────

describe('calcMasteryChapter', () => {
  it('returns 0 when no lessons completed and no averages', () => {
    expect(calcMasteryChapter(0, 10, 0, 0)).toBe(0);
  });

  it('returns 100 when everything is maxed out', () => {
    expect(calcMasteryChapter(10, 10, 100, 100)).toBe(100);
  });

  it('calculates weighted average correctly: 20% lesson, 40% quiz, 40% exam', () => {
    // lesson ratio = 5/10 = 0.5 → 0.5 * 20 = 10
    // quiz = 80 * 0.4 = 32
    // exam = 60 * 0.4 = 24
    // total = 10 + 32 + 24 = 66
    expect(calcMasteryChapter(5, 10, 80, 60)).toBe(66);
  });

  it('handles zero total lessons gracefully', () => {
    expect(calcMasteryChapter(0, 0, 100, 100)).toBe(80);
  });

  it('clamps to 0 for negative inputs', () => {
    expect(calcMasteryChapter(-1, 10, -10, -10)).toBe(0);
  });

  it('returns integer result', () => {
    const result = calcMasteryChapter(3, 7, 75.5, 82.3);
    expect(Number.isInteger(result)).toBe(true);
  });
});

// ── calcMasteryLo ────────────────────────────────────

describe('calcMasteryLo', () => {
  it('returns null for fewer than MIN_ATTEMPTS (3) attempts', () => {
    expect(calcMasteryLo(2, 2)).toBeNull();
    expect(calcMasteryLo(1, 1)).toBeNull();
    expect(calcMasteryLo(0, 0)).toBeNull();
  });

  it('returns 100 when all questions correct', () => {
    expect(calcMasteryLo(5, 5)).toBe(100);
  });

  it('returns 0 when all questions wrong', () => {
    expect(calcMasteryLo(0, 5)).toBe(0);
  });

  it('calculates percentage rounded', () => {
    // 3/4 = 0.75 * 100 = 75
    expect(calcMasteryLo(3, 4)).toBe(75);
    // 2/3 ≈ 66.67 → 67
    expect(calcMasteryLo(2, 3)).toBe(67);
  });

  it('returns 0 for zero total but handles gracefully', () => {
    expect(calcMasteryLo(3, 3)).not.toBeNull();
  });
});

// ── calcRollingAverage ──────────────────────────────

describe('calcRollingAverage', () => {
  it('returns 0 for empty array', () => {
    expect(calcRollingAverage([])).toBe(0);
  });

  it('returns the single value for a one-element array', () => {
    expect(calcRollingAverage([85])).toBe(85);
  });

  it('applies higher weight to recent scores', () => {
    // scores: [50, 100]
    // weights: w0=1, w1=2
    // weightedSum = 50*1 + 100*2 = 250
    // weightSum = 3
    // result = 250/3 ≈ 83.33
    const result = calcRollingAverage([50, 100]);
    expect(result).toBe(83.33);
  });

  it('respects maxSamples limit', () => {
    const scores = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
    // Only last 10 should be used: [30, 40, 50, 60, 70, 80, 90, 100, 110, 120]
    const result = calcRollingAverage(scores, 10);
    // Each weight = i + 1
    // weightedSum = 30*1 + 40*2 + 50*3 + 60*4 + 70*5 + 80*6 + 90*7 + 100*8 + 110*9 + 120*10
    // = 30 + 80 + 150 + 240 + 350 + 480 + 630 + 800 + 990 + 1200 = 4950
    // weightSum = 1+2+3+4+5+6+7+8+9+10 = 55
    // result = 4950/55 = 90
    expect(result).toBe(90);
  });

  it('handles all-zero scores', () => {
    expect(calcRollingAverage([0, 0, 0])).toBe(0);
  });
});

// ── calcWeakTopicPriority ────────────────────────────

describe('calcWeakTopicPriority', () => {
  it('returns minimum score for 0 errors, old error, K1', () => {
    // errorScore = 0/10 * 50 = 0
    // recencyScore = max(1 - 30/30, 0) * 30 = 0
    // kBonus = ((1 - 1) / 2) * 20 = 0
    expect(calcWeakTopicPriority(0, 30, 'K1')).toBe(0);
  });

  it('returns high score for many recent errors at K3', () => {
    // errorScore = min(10/10, 1) * 50 = 50
    // recencyScore = max(1 - 0/30, 0) * 30 = 30
    // kBonus = ((3 - 1) / 2) * 20 = 20
    // total = 100
    expect(calcWeakTopicPriority(10, 0, 'K3')).toBe(100);
  });

  it('applies K-level bonus correctly', () => {
    // K1: bonus = 0
    const k1 = calcWeakTopicPriority(3, 5, 'K1');
    // K3 should be higher
    const k3 = calcWeakTopicPriority(3, 5, 'K3');
    expect(k3).toBeGreaterThan(k1);
  });

  it('scores are clamped to 0–100', () => {
    const high = calcWeakTopicPriority(999, 0, 'K3');
    expect(high).toBeLessThanOrEqual(100);
    expect(high).toBeGreaterThanOrEqual(0);
  });

  it('recency decays over 30 days', () => {
    const recent = calcWeakTopicPriority(5, 1, 'K2');
    const old = calcWeakTopicPriority(5, 29, 'K2');
    expect(recent).toBeGreaterThan(old);
  });
});

// ── analyzeConfidenceMismatch ────────────────────────

describe('analyzeConfidenceMismatch', () => {
  it('returns "accurate" when correct with moderate confidence (3)', () => {
    expect(analyzeConfidenceMismatch(3, true)).toBe('accurate');
  });

  it('returns "underconfident" when correct with low confidence (≤2)', () => {
    expect(analyzeConfidenceMismatch(1, true)).toBe('underconfident');
    expect(analyzeConfidenceMismatch(2, true)).toBe('underconfident');
  });

  it('returns "overconfident" when wrong with high confidence (≥4)', () => {
    expect(analyzeConfidenceMismatch(4, false)).toBe('overconfident');
    expect(analyzeConfidenceMismatch(5, false)).toBe('overconfident');
  });

  it('returns "accurate" when wrong with low confidence (knew they didn\'t know)', () => {
    expect(analyzeConfidenceMismatch(1, false)).toBe('accurate');
    expect(analyzeConfidenceMismatch(2, false)).toBe('accurate');
  });

  it('returns "accurate" for edge case confidence 3, wrong', () => {
    expect(analyzeConfidenceMismatch(3, false)).toBe('accurate');
  });

  it('returns "accurate" for confidence 5, correct', () => {
    expect(analyzeConfidenceMismatch(5, true)).toBe('accurate');
  });
});

// ── checkExamPass ────────────────────────────────────

describe('checkExamPass', () => {
  it('returns true for score ≥ 26 (pass threshold)', () => {
    expect(checkExamPass(26)).toBe(true);
    expect(checkExamPass(30)).toBe(true);
    expect(checkExamPass(40)).toBe(true);
  });

  it('returns false for score < 26', () => {
    expect(checkExamPass(25)).toBe(false);
    expect(checkExamPass(0)).toBe(false);
    expect(checkExamPass(10)).toBe(false);
  });

  it('pass threshold is exactly 26/40 = 65%', () => {
    // 65% of 40 = 26
    expect(checkExamPass(26)).toBe(true);
    expect(checkExamPass(25)).toBe(false);
  });
});
