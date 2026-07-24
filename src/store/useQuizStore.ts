// ===== ISTQB CTFL v4.0.1 — Active Quiz Session Store =====

import { create } from 'zustand';
import type { Quiz, SubmittedAnswer } from '@/types';

// ── State Shape ─────────────────────────────────────

export interface QuizState {
  currentQuiz: Quiz | null;
  currentAnswers: SubmittedAnswer[];
  currentQuestionIndex: number;
  timeRemaining: number | null;
  quizActive: boolean;
}

// ── Actions ─────────────────────────────────────────

export interface QuizActions {
  startQuiz: (quiz: Quiz, timeLimitSeconds?: number | null) => void;
  submitAnswer: (answer: SubmittedAnswer) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setConfidence: (questionId: string, confidence: number) => void;
  finishQuiz: () => { answers: SubmittedAnswer[]; timeSpentSeconds: number };
  resetQuiz: () => void;
}

export type QuizStore = QuizState & QuizActions;

// ── Initial State ───────────────────────────────────

const initialState: QuizState = {
  currentQuiz: null,
  currentAnswers: [],
  currentQuestionIndex: 0,
  timeRemaining: null,
  quizActive: false,
};

// ── Store (non-persisted — session-only) ────────────

export const useQuizStore = create<QuizStore>()((set, get) => ({
  ...initialState,

  startQuiz: (quiz, timeLimitSeconds) =>
    set({
      currentQuiz: quiz,
      currentAnswers: [],
      currentQuestionIndex: 0,
      timeRemaining: timeLimitSeconds ?? quiz.timeLimitSeconds,
      quizActive: true,
    }),

  submitAnswer: (answer) =>
    set((state) => {
      const existing = state.currentAnswers.findIndex(
        (a) => a.questionId === answer.questionId,
      );
      if (existing >= 0) {
        const updated = [...state.currentAnswers];
        updated[existing] = answer;
        return { currentAnswers: updated };
      }
      return { currentAnswers: [...state.currentAnswers, answer] };
    }),

  nextQuestion: () =>
    set((state) => {
      const total = state.currentQuiz?.questionIds.length ?? 0;
      const nextIndex = Math.min(state.currentQuestionIndex + 1, total - 1);
      return { currentQuestionIndex: nextIndex };
    }),

  prevQuestion: () =>
    set((state) => {
      const prevIndex = Math.max(state.currentQuestionIndex - 1, 0);
      return { currentQuestionIndex: prevIndex };
    }),

  setConfidence: (questionId, confidence) =>
    set((state) => ({
      currentAnswers: state.currentAnswers.map((a) =>
        a.questionId === questionId ? { ...a, confidence } : a,
      ),
    })),

  finishQuiz: () => {
    const state = get();
    const quiz = state.currentQuiz;
    const timeLimit = quiz?.timeLimitSeconds;
    let timeSpentSeconds: number;

    if (timeLimit !== null && timeLimit !== undefined && state.timeRemaining !== null) {
      timeSpentSeconds = timeLimit - state.timeRemaining;
    } else {
      // Sum up time from individual answers if available; otherwise 0
      timeSpentSeconds = state.currentAnswers.reduce(
        (sum, a) => sum + (a.timeSpentSeconds ?? 0),
        0,
      );
    }

    set({
      quizActive: false,
      currentQuiz: null,
      timeRemaining: null,
    });

    return {
      answers: state.currentAnswers,
      timeSpentSeconds,
    };
  },

  resetQuiz: () => set(initialState),
}));
