// ===== ISTQB CTFL v4.0.1 — Active Exam Session Store =====

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ExamSession, ExamAnswer } from '@/types';
import { EXAM_RULES } from '@/lib/constants';

// ── State Shape ─────────────────────────────────────

export interface ExamState {
  currentSession: ExamSession | null;
  currentAnswers: ExamAnswer[];
  currentQuestionIndex: number;
  flaggedQuestions: string[];
  timeRemaining: number;
  examActive: boolean;
}

// ── Actions ─────────────────────────────────────────

export interface ExamActions {
  startExam: (session: ExamSession) => void;
  submitAnswer: (answer: ExamAnswer) => void;
  toggleFlag: (questionId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setConfidence: (questionId: string, confidence: number) => void;
  finishExam: () => {
    answers: ExamAnswer[];
    timeSpentSeconds: number;
    flaggedQuestions: string[];
  };
  goToQuestion: (index: number) => void;
  abandonExam: () => void;
}

export type ExamStore = ExamState & ExamActions;

// ── Initial State ───────────────────────────────────

const initialState: ExamState = {
  currentSession: null,
  currentAnswers: [],
  currentQuestionIndex: 0,
  flaggedQuestions: [],
  timeRemaining: EXAM_RULES.baseTimeSeconds,
  examActive: false,
};

// ── Store (persisted via localStorage) ──────────────

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startExam: (session) =>
        set({
          currentSession: session,
          currentAnswers: [],
          currentQuestionIndex: 0,
          flaggedQuestions: [],
          timeRemaining: session.timeLimitSeconds,
          examActive: true,
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

      toggleFlag: (questionId) =>
        set((state) => {
          const isFlagged = state.flaggedQuestions.includes(questionId);
          const updatedFlags = isFlagged
            ? state.flaggedQuestions.filter((id) => id !== questionId)
            : [...state.flaggedQuestions, questionId];

          // Also update the isFlagged field in the answer if it exists
          const updatedAnswers = state.currentAnswers.map((a) =>
            a.questionId === questionId
              ? { ...a, isFlagged: !isFlagged }
              : a,
          );

          return {
            flaggedQuestions: updatedFlags,
            currentAnswers: updatedAnswers,
          };
        }),

      nextQuestion: () =>
        set((state) => {
          const total = state.currentSession?.questionIds.length ?? 0;
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

      finishExam: () => {
        const state = get();
        const session = state.currentSession;
        const timeLimit = session?.timeLimitSeconds ?? EXAM_RULES.baseTimeSeconds;
        const timeSpentSeconds = timeLimit - state.timeRemaining;

        set({
          examActive: false,
          currentSession: null,
        });

        return {
          answers: state.currentAnswers,
          timeSpentSeconds: Math.max(timeSpentSeconds, 0),
          flaggedQuestions: state.flaggedQuestions,
        };
      },

      goToQuestion: (index: number) =>
        set({
          currentQuestionIndex: Math.max(0, Math.min(index, (get().currentSession?.questionIds.length ?? 1) - 1)),
        }),

      abandonExam: () => set(initialState),
    }),
    {
      name: 'istqb-exam-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
