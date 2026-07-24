// ===== ISTQB CTFL v4.0.1 — Exam Generator Tests =====

import { describe, it, expect } from 'vitest';
import {
  generateExam,
  generateQuiz,
  validateExamAnswers,
  calcBreakdownByChapter,
  calcBreakdownByLo,
  calcBreakdownByKLevel,
} from '@/utils/exam-generator';
import type { Question, AnswerChoice, ExamAnswer, QuizConfig } from '@/types';

// ── Helpers ──────────────────────────────────────────

function makeQuestion(
  id: string,
  overrides: Partial<Question> = {},
): Question {
  const choices: AnswerChoice[] = [
    { id: `${id}a`, label: 'A', text: 'Option A', isCorrect: true },
    { id: `${id}b`, label: 'B', text: 'Option B', isCorrect: false },
    { id: `${id}c`, label: 'C', text: 'Option C', isCorrect: false },
    { id: `${id}d`, label: 'D', text: 'Option D', isCorrect: false },
  ];

  return {
    id,
    chapterId: 'ch1',
    loId: 'FL-1.1.1',
    kLevel: 'K1',
    difficulty: 'easy',
    type: 'single',
    stem: `Question ${id}?`,
    choices,
    explanation: {
      correctAnswerRationale: 'A is correct.',
      whyOthersWrong: { B: 'Wrong', C: 'Wrong', D: 'Wrong' },
      relatedLo: 'FL-1.1.1',
      relatedGlossaryTerms: ['test'],
      commonTrap: 'None',
    },
    tags: ['fundamentals'],
    source: 'seed',
    timesAsked: 0,
    timesCorrect: 0,
    createdAt: '2026-01-01',
    ...overrides,
  };
}

function buildPool(): Question[] {
  const pool: Question[] = [];
  for (let i = 1; i <= 60; i++) {
    const chapterId = i <= 15 ? 'ch1' : i <= 30 ? 'ch2' : i <= 45 ? 'ch3' : 'ch4';
    const loId = chapterId === 'ch1'
      ? 'FL-1.1.1'
      : chapterId === 'ch2'
        ? 'FL-2.1.1'
        : chapterId === 'ch3'
          ? 'FL-3.1.1'
          : 'FL-4.2.1';
    const kLevel: 'K1' | 'K2' | 'K3' = i % 3 === 0 ? 'K3' : i % 3 === 1 ? 'K1' : 'K2';

    pool.push(makeQuestion(`q${i}`, { chapterId, loId, kLevel }));
  }
  return pool;
}

// ── generateExam ─────────────────────────────────────

describe('generateExam', () => {
  it('returns exactly 40 questions from a pool of 60', () => {
    const pool = buildPool();
    const exam = generateExam(pool);
    expect(exam).toHaveLength(40);
  });

  it('filters by chapterId correctly', () => {
    const pool = buildPool();
    const exam = generateExam(pool, { chapterIds: ['ch1'] });
    expect(exam.every((q) => q.chapterId === 'ch1')).toBe(true);
    expect(exam.length).toBeLessThanOrEqual(15);
  });

  it('filters by loId correctly', () => {
    const pool = buildPool();
    const exam = generateExam(pool, { loIds: ['FL-1.1.1'] });
    expect(exam.every((q) => q.loId === 'FL-1.1.1')).toBe(true);
  });

  it('filters by kLevel correctly', () => {
    const pool = buildPool();
    const exam = generateExam(pool, { kLevelFilter: 'K3' });
    expect(exam.every((q) => q.kLevel === 'K3')).toBe(true);
  });

  it('empty pool returns empty array', () => {
    expect(generateExam([])).toEqual([]);
  });

  it('non-existent chapter returns empty array', () => {
    const pool = buildPool();
    const exam = generateExam(pool, { chapterIds: ['nonexistent'] });
    expect(exam).toEqual([]);
  });
});

// ── generateQuiz ─────────────────────────────────────

describe('generateQuiz', () => {
  const defaultConfig: QuizConfig = {
    showCorrectionImmediately: true,
    allowNavigation: true,
    showTimer: false,
    shuffleQuestions: false,
    shuffleChoices: false,
  };

  it('returns correct number of questions', () => {
    const pool = buildPool().slice(0, 10);
    const quiz = generateQuiz(pool, defaultConfig);
    expect(quiz.questionIds).toHaveLength(10);
  });

  it('throws on empty question list', () => {
    expect(() => generateQuiz([], defaultConfig)).toThrow(
      'Cannot generate a quiz from an empty question list.',
    );
  });

  it('generates time limit when showTimer is true', () => {
    const pool = buildPool().slice(0, 10);
    const quiz = generateQuiz(pool, { ...defaultConfig, showTimer: true });
    expect(quiz.timeLimitSeconds).toBe(10 * 90);
  });

  it('no time limit when showTimer is false', () => {
    const pool = buildPool().slice(0, 5);
    const quiz = generateQuiz(pool, { ...defaultConfig, showTimer: false });
    expect(quiz.timeLimitSeconds).toBeNull();
  });
});
