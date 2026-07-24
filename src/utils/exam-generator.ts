// ===== ISTQB CTFL v4.0.1 — Exam & Quiz Generators =====

import type {
  Question,
  Quiz,
  QuizConfig,
  ExamAnswer,
  ExamResult,
} from '@/types';
import { EXAM_RULES } from '@/lib/constants';
import { shuffleArray, generateId, percentage } from '@/lib/utils';

// ── Configuration Defaults ─────────────────────────
const DEFAULT_EXAM_COUNT = 40;

// ── Types ──────────────────────────────────────────

export interface ExamGenerationOptions {
  /** Filter by specific chapter IDs */
  chapterIds?: string[];
  /** Filter by specific learning objective IDs */
  loIds?: string[];
  /** Filter by K-level */
  kLevelFilter?: 'K1' | 'K2' | 'K3';
  /** Number of questions to generate (default: 40) */
  count?: number;
}

export interface QuizGenerationOptions {
  questions: Question[];
  config: QuizConfig;
}

// ── Exam Generator ─────────────────────────────────

/**
 * Generate an exam by filtering a question pool and selecting a subset.
 *
 * Filtering steps:
 *  1. Apply chapterIds filter (if provided)
 *  2. Apply loIds filter (if provided)
 *  3. Apply kLevelFilter (if provided)
 *
 * Selection: random pick from filtered pool, up to count.
 * Returns a new array; does NOT mutate the input pool.
 */
export function generateExam(
  questions: Question[],
  options: ExamGenerationOptions = {}
): Question[] {
  const { chapterIds, loIds, kLevelFilter, count = DEFAULT_EXAM_COUNT } = options;

  let pool = questions;

  // Filter by chapter
  if (chapterIds && chapterIds.length > 0) {
    pool = pool.filter((q) => chapterIds.includes(q.chapterId));
  }

  // Filter by LO
  if (loIds && loIds.length > 0) {
    pool = pool.filter((q) => loIds.includes(q.loId));
  }

  // Filter by K-level
  if (kLevelFilter) {
    pool = pool.filter((q) => q.kLevel === kLevelFilter);
  }

  // If pool is empty, return empty
  if (pool.length === 0) return [];

  // Shuffle and take `count` questions
  const shuffled = shuffleArray([...pool]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ── Quiz Generator ─────────────────────────────────

/**
 * Generate a Quiz from a list of questions and a configuration.
 *
 * The config dictates:
 *  - Whether questions are shuffled
 *  - Whether answer choices are shuffled
 *  - Time limit (null = no limit)
 *
 * Returns a Quiz object with questionIds referencing the (possibly shuffled) questions.
 */
export function generateQuiz(
  questions: Question[],
  config: QuizConfig
): Quiz {
  if (questions.length === 0) {
    throw new Error('Cannot generate a quiz from an empty question list.');
  }

  let pool = [...questions];

  // Shuffle questions if configured
  if (config.shuffleQuestions) {
    pool = shuffleArray(pool);
  }

  // Shuffle choices within each question if configured
  if (config.shuffleChoices) {
    pool = pool.map((q) => ({
      ...q,
      choices: shuffleArray([...q.choices]),
    }));
  }

  return {
    id: generateId(),
    type: 'quick',
    title: `Quiz: ${pool.length} questions`,
    questionIds: pool.map((q) => q.id),
    timeLimitSeconds: config.showTimer
      ? pool.length * 90 // 90 seconds per question default
      : null,
    config,
    createdAt: new Date().toISOString(),
  };
}

// ── Exam Answer Validator ──────────────────────────

/**
 * Validate a set of submitted exam answers against the source questions.
 *
 * Returns a full ExamResult including score, pass/fail, percentage,
 * breakdowns by chapter, LO, and K-level, and timing info.
 */
export function validateExamAnswers(
  answers: ExamAnswer[],
  questions: Question[]
): ExamResult {
  // Build a lookup map
  const questionMap = new Map<string, Question>();
  for (const q of questions) {
    questionMap.set(q.id, q);
  }

  // Grade each answer
  const gradedAnswers: ExamAnswer[] = answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      return { ...answer, isCorrect: false };
    }

    // For single-choice: exactly one correct match
    // For multiple-choice: all selected must be correct, no missing correct ones
    const correctChoiceIds = question.choices
      .filter((c) => c.isCorrect)
      .map((c) => c.id);

    let isCorrect: boolean;
    if (question.type === 'single') {
      isCorrect = answer.selectedChoiceId === correctChoiceIds[0];
    } else {
      // Multiple: selected set must exactly match correct set
      const selectedSet = new Set([answer.selectedChoiceId]);
      const correctSet = new Set(correctChoiceIds);
      isCorrect =
        selectedSet.size === correctSet.size &&
        [...selectedSet].every((id) => correctSet.has(id));
    }

    return { ...answer, isCorrect };
  });

  const totalQuestions = gradedAnswers.length;
  const score = gradedAnswers.filter((a) => a.isCorrect).length;
  const pct = percentage(score, totalQuestions);
  const totalTime = gradedAnswers.reduce(
    (sum, a) => sum + a.timeSpentSeconds,
    0
  );

  // Breakdown calculators
  const breakdownByChapter = calcBreakdownByChapter(gradedAnswers, questions);
  const breakdownByLo = calcBreakdownByLo(gradedAnswers, questions);
  const breakdownByKLevel = calcBreakdownByKLevel(gradedAnswers, questions);

  const flaggedQuestions = gradedAnswers
    .filter((a) => a.isFlagged)
    .map((a) => a.questionId);

  return {
    id: generateId(),
    sessionId: '',
    userId: '',
    score,
    percentage: pct,
    passed: score >= EXAM_RULES.passScore,
    timeSpentSeconds: totalTime,
    answers: gradedAnswers,
    breakdownByChapter,
    breakdownByLo,
    breakdownByKLevel,
    flaggedQuestions,
    completedAt: new Date().toISOString(),
  };
}

// ── Breakdown Calculators ──────────────────────────

interface BreakdownEntry {
  correct: number;
  total: number;
}

/**
 * Breakdown of exam answers grouped by chapter ID.
 */
export function calcBreakdownByChapter(
  answers: ExamAnswer[],
  questions: Question[]
): Record<string, BreakdownEntry> {
  const questionChapters = new Map<string, string>();
  for (const q of questions) {
    questionChapters.set(q.id, q.chapterId);
  }

  const map = new Map<string, { correct: number; total: number }>();

  for (const answer of answers) {
    const chapterId = questionChapters.get(answer.questionId);
    if (!chapterId) continue;

    const entry = map.get(chapterId) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answer.isCorrect) entry.correct += 1;
    map.set(chapterId, entry);
  }

  return Object.fromEntries(map);
}

/**
 * Breakdown of exam answers grouped by learning objective ID.
 */
export function calcBreakdownByLo(
  answers: ExamAnswer[],
  questions: Question[]
): Record<string, BreakdownEntry> {
  const questionLos = new Map<string, string>();
  for (const q of questions) {
    questionLos.set(q.id, q.loId);
  }

  const map = new Map<string, { correct: number; total: number }>();

  for (const answer of answers) {
    const loId = questionLos.get(answer.questionId);
    if (!loId) continue;

    const entry = map.get(loId) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answer.isCorrect) entry.correct += 1;
    map.set(loId, entry);
  }

  return Object.fromEntries(map);
}

/**
 * Breakdown of exam answers grouped by K-level.
 */
export function calcBreakdownByKLevel(
  answers: ExamAnswer[],
  questions: Question[]
): Record<string, BreakdownEntry> {
  const questionKLevels = new Map<string, 'K1' | 'K2' | 'K3'>();
  for (const q of questions) {
    questionKLevels.set(q.id, q.kLevel);
  }

  const map = new Map<string, { correct: number; total: number }>();

  for (const answer of answers) {
    const kLevel = questionKLevels.get(answer.questionId);
    if (!kLevel) continue;

    const entry = map.get(kLevel) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answer.isCorrect) entry.correct += 1;
    map.set(kLevel, entry);
  }

  return Object.fromEntries(map);
}
