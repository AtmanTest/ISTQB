// ===== ISTQB CTFL v4.0.1 — Main Zustand Store (persisted to localStorage) =====

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  User,
  ProgressChapter,
  ProgressLo,
  QuizResult,
  ExamResult,
  ExamSession,
  WeakTopic,
  FlashcardReview,
  StudyPlan,
} from '@/types';
import { generateId } from '@/lib/utils';
import type { identifyWeakTopics } from '@/utils/weak-topics';

// ── State Shape ─────────────────────────────────────

export interface ISTQBState {
  user: User;
  progressChapters: ProgressChapter[];
  progressLos: ProgressLo[];
  quizResults: QuizResult[];
  examResults: ExamResult[];
  examSessions: ExamSession[];
  weakTopics: WeakTopic[];
  flashcardReviews: FlashcardReview[];
  studyPlans: StudyPlan[];
  activeStudyPlanId: string | null;
}

// ── Actions ─────────────────────────────────────────

export interface ISTQBActions {
  setUser: (user: Partial<User>) => void;
  updateProgressChapter: (
    chapterId: string,
    updates: Partial<ProgressChapter>,
  ) => void;
  updateProgressLo: (loId: string, updates: Partial<ProgressLo>) => void;
  addQuizResult: (result: QuizResult) => void;
  addExamResult: (result: ExamResult) => void;
  addExamSession: (session: ExamSession) => void;
  updateExamSession: (
    sessionId: string,
    updates: Partial<ExamSession>,
  ) => void;
  addFlashcardReview: (review: FlashcardReview) => void;
  generateWeakTopics: (
    quizResults: QuizResult[],
    examResults: ExamResult[],
    chapters: Parameters<typeof identifyWeakTopics>[2],
    los: Parameters<typeof identifyWeakTopics>[3],
  ) => void;
  setStudyPlan: (plan: StudyPlan) => void;
  setActiveStudyPlan: (planId: string | null) => void;
  resetAll: () => void;
}

export type ISTQBStore = ISTQBState & ISTQBActions;

// ── Default User ────────────────────────────────────

const defaultUser: User = {
  id: 'local',
  name: 'Candidat',
  email: null,
  isNativeSpeaker: true,
  targetExamDate: null,
  dailyGoalMinutes: 60,
  preferredMode: 'system',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ── Initial State ───────────────────────────────────

const initialState: ISTQBState = {
  user: defaultUser,
  progressChapters: [],
  progressLos: [],
  quizResults: [],
  examResults: [],
  examSessions: [],
  weakTopics: [],
  flashcardReviews: [],
  studyPlans: [],
  activeStudyPlanId: null,
};

// ── Store ───────────────────────────────────────────

export const useISTQBStore = create<ISTQBStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (partial) =>
        set((state) => ({
          user: {
            ...state.user,
            ...partial,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateProgressChapter: (chapterId, updates) =>
        set((state) => {
          const existing = state.progressChapters.findIndex(
            (pc) => pc.chapterId === chapterId,
          );
          if (existing >= 0) {
            const updated = [...state.progressChapters];
            updated[existing] = {
              ...updated[existing],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            return { progressChapters: updated };
          }
          // Create new ProgressChapter record
          const now = new Date().toISOString();
          return {
            progressChapters: [
              ...state.progressChapters,
              {
                id: generateId(),
                userId: state.user.id,
                chapterId,
                status: 'not_started',
                lessonsCompleted: 0,
                totalLessons: 0,
                quizAverage: 0,
                examAverage: 0,
                masteryScore: 0,
                timeSpentMinutes: 0,
                lastActivityAt: now,
                updatedAt: now,
                ...updates,
              },
            ],
          };
        }),

      updateProgressLo: (loId, updates) =>
        set((state) => {
          const existing = state.progressLos.findIndex(
            (pl) => pl.loId === loId,
          );
          if (existing >= 0) {
            const updated = [...state.progressLos];
            updated[existing] = {
              ...updated[existing],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            return { progressLos: updated };
          }
          const now = new Date().toISOString();
          return {
            progressLos: [
              ...state.progressLos,
              {
                id: generateId(),
                userId: state.user.id,
                loId,
                chapterId: '',
                masteryScore: 0,
                questionsAttempted: 0,
                questionsCorrect: 0,
                lastAttemptAt: now,
                updatedAt: now,
                ...updates,
              },
            ],
          };
        }),

      addQuizResult: (result) =>
        set((state) => ({
          quizResults: [...state.quizResults, result],
        })),

      addExamResult: (result) =>
        set((state) => ({
          examResults: [...state.examResults, result],
        })),

      addExamSession: (session) =>
        set((state) => ({
          examSessions: [...state.examSessions, session],
        })),

      updateExamSession: (sessionId, updates) =>
        set((state) => ({
          examSessions: state.examSessions.map((s) =>
            s.id === sessionId ? { ...s, ...updates } : s,
          ),
        })),

      addFlashcardReview: (review) =>
        set((state) => ({
          flashcardReviews: [...state.flashcardReviews, review],
        })),

      generateWeakTopics: (quizResults, examResults, chapters, los) => {
        // Dynamic import to keep bundle lean
        import('@/utils/weak-topics').then(({ identifyWeakTopics }) => {
          const topics = identifyWeakTopics(
            quizResults,
            examResults,
            chapters,
            los,
          );
          set({ weakTopics: topics });
        });
      },

      setStudyPlan: (plan) =>
        set((state) => {
          const existing = state.studyPlans.findIndex((sp) => sp.id === plan.id);
          if (existing >= 0) {
            const updated = [...state.studyPlans];
            updated[existing] = plan;
            return { studyPlans: updated };
          }
          return { studyPlans: [...state.studyPlans, plan] };
        }),

      setActiveStudyPlan: (planId) => set({ activeStudyPlanId: planId }),

      resetAll: () => set(initialState),
    }),
    {
      name: 'istqb-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        progressChapters: state.progressChapters,
        progressLos: state.progressLos,
        quizResults: state.quizResults,
        examResults: state.examResults,
        examSessions: state.examSessions,
        weakTopics: state.weakTopics,
        flashcardReviews: state.flashcardReviews,
        studyPlans: state.studyPlans,
        activeStudyPlanId: state.activeStudyPlanId,
      }),
    },
  ),
);
