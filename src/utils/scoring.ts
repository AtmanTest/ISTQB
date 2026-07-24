// ===== ISTQB CTFL v4.0.1 — Scoring Algorithms =====

import { K_LEVEL_WEIGHTS, EXAM_RULES } from '@/lib/constants';
import { clamp } from '@/lib/utils';

/**
 * Calculate a chapter's composite mastery score (0–100).
 *
 * Weighted average of:
 *  - Lesson completion ratio (20 %)
 *  - Quiz average (40 %)
 *  - Exam average (40 %)
 */
export function calcMasteryChapter(
  lessonsCompleted: number,
  totalLessons: number,
  quizAvg: number,
  examAvg: number
): number {
  const lessonRatio = totalLessons > 0 ? lessonsCompleted / totalLessons : 0;
  const score = lessonRatio * 20 + quizAvg * 0.4 + examAvg * 0.4;
  return clamp(Math.round(score), 0, 100);
}

/**
 * Calculate mastery for a single learning objective (0–100).
 *
 * Returns `null` if fewer than MIN_ATTEMPTS attempts have been made
 * (insufficient data for a reliable estimate).
 *
 * Formula: (correct / attempted) * 100
 */
export function calcMasteryLo(
  correct: number,
  attempted: number
): number | null {
  const MIN_ATTEMPTS = 3;
  if (attempted < MIN_ATTEMPTS) return null;

  const ratio = attempted > 0 ? correct / attempted : 0;
  return clamp(Math.round(ratio * 100), 0, 100);
}

/**
 * Compute a rolling weighted average over the last N scores.
 *
 * More recent scores have a higher weight using a linear decay.
 * The last score gets weight N, the (N-1)th gets weight N-1, etc.
 *
 * Returns 0 for empty arrays.
 */
export function calcRollingAverage(scores: number[], maxSamples: number = 10): number {
  if (scores.length === 0) return 0;

  const recent = scores.slice(-maxSamples);
  const n = recent.length;

  let weightedSum = 0;
  let weightSum = 0;

  for (let i = 0; i < n; i++) {
    const weight = i + 1; // linear — most recent gets highest
    weightedSum += recent[i] * weight;
    weightSum += weight;
  }

  return weightSum > 0 ? Math.round((weightedSum / weightSum) * 100) / 100 : 0;
}

/**
 * Calculate priority score for a weak topic (0–100).
 *
 * Factors:
 *  - errorCount: more errors → higher priority
 *  - daysSinceLastError: recent errors → higher priority (decays over 30 days)
 *  - kLevel: K3 > K2 > K1 weight multiplier
 *
 * Higher score = more urgent to review.
 */
export function calcWeakTopicPriority(
  errorCount: number,
  daysSinceLastError: number,
  kLevel: 'K1' | 'K2' | 'K3'
): number {
  const kWeight = K_LEVEL_WEIGHTS[kLevel] ?? 1;

  // Error count score: sigmoid-ish capped at 10 errors
  const errorScore = Math.min(errorCount / 10, 1) * 50;

  // Recency score: decays linearly over 30 days
  const recencyScore = Math.max(1 - daysSinceLastError / 30, 0) * 30;

  // K-level bonus: up to 20 points
  const kBonus = ((kWeight - 1) / 2) * 20;

  const raw = errorScore + recencyScore + kBonus;
  return clamp(Math.round(raw), 0, 100);
}

/**
 * Analyze a confidence-vs-correctness mismatch.
 *
 * - If the answer was correct and confidence >= 4: 'accurate'
 * - If the answer was correct and confidence <= 2: 'underconfident'
 * - If the answer was wrong and confidence >= 4: 'overconfident'
 * - If the answer was wrong and confidence <= 2: 'accurate' (knew they didn't know)
 * - Otherwise: 'accurate'
 */
export function analyzeConfidenceMismatch(
  confidence: number,
  isCorrect: boolean
): 'overconfident' | 'underconfident' | 'accurate' {
  if (isCorrect && confidence <= 2) {
    return 'underconfident';
  }
  if (!isCorrect && confidence >= 4) {
    return 'overconfident';
  }
  return 'accurate';
}

/**
 * Check whether a raw exam score meets the passing threshold.
 *
 * The pass threshold is defined by EXAM_RULES.passScore / totalQuestions.
 * For the standard 40-question exam this is 26 / 40 = 65 %.
 */
export function checkExamPass(score: number): boolean {
  return score >= EXAM_RULES.passScore;
}
