// ===== ISTQB CTFL v4.0.1 — ISTQB Store Tests =====

import { describe, it, expect, beforeEach } from 'vitest';
import { useISTQBStore } from '@/store/useISTQBStore';
import type { QuizResult, ExamResult, WeakTopic } from '@/types';

describe('useISTQBStore', () => {
  // Reset the store before each test
  beforeEach(() => {
    useISTQBStore.setState({
      user: {
        id: 'local',
        name: 'Candidat',
        email: null,
        isNativeSpeaker: true,
        targetExamDate: null,
        dailyGoalMinutes: 60,
        preferredMode: 'system',
        createdAt: expect.any(String) as unknown as string,
        updatedAt: expect.any(String) as unknown as string,
      },
      progressChapters: [],
      progressLos: [],
      quizResults: [],
      examResults: [],
      examSessions: [],
      weakTopics: [],
      flashcardReviews: [],
      studyPlans: [],
      activeStudyPlanId: null,
    });
  });

  it('setUser updates user state', () => {
    const store = useISTQBStore.getState();
    store.setUser({ name: 'Jean Dupont', isNativeSpeaker: false });

    const state = useISTQBStore.getState();
    expect(state.user.name).toBe('Jean Dupont');
    expect(state.user.isNativeSpeaker).toBe(false);
  });

  it('setUser merges partial user data', () => {
    const store = useISTQBStore.getState();
    store.setUser({ dailyGoalMinutes: 120 });

    const state = useISTQBStore.getState();
    expect(state.user.dailyGoalMinutes).toBe(120);
    expect(state.user.name).toBe('Candidat'); // unchanged
  });

  it('addQuizResult adds to quizResults array', () => {
    const store = useISTQBStore.getState();
    const quizResult: QuizResult = {
      id: 'qr1',
      quizId: 'q1',
      userId: 'local',
      score: 8,
      totalQuestions: 10,
      percentage: 80,
      timeSpentSeconds: 300,
      answers: [],
      weakTopicsGenerated: false,
      completedAt: new Date().toISOString(),
    };

    store.addQuizResult(quizResult);
    const state = useISTQBStore.getState();
    expect(state.quizResults).toHaveLength(1);
    expect(state.quizResults[0].id).toBe('qr1');
    expect(state.quizResults[0].score).toBe(8);
  });

  it('addQuizResult appends multiple results', () => {
    const store = useISTQBStore.getState();

    store.addQuizResult({
      id: 'qr1',
      quizId: 'q1',
      userId: 'local',
      score: 8,
      totalQuestions: 10,
      percentage: 80,
      timeSpentSeconds: 300,
      answers: [],
      weakTopicsGenerated: false,
      completedAt: new Date().toISOString(),
    });

    store.addQuizResult({
      id: 'qr2',
      quizId: 'q2',
      userId: 'local',
      score: 5,
      totalQuestions: 10,
      percentage: 50,
      timeSpentSeconds: 200,
      answers: [],
      weakTopicsGenerated: false,
      completedAt: new Date().toISOString(),
    });

    const state = useISTQBStore.getState();
    expect(state.quizResults).toHaveLength(2);
    expect(state.quizResults[1].id).toBe('qr2');
  });

  it('addExamResult adds to examResults array', () => {
    const store = useISTQBStore.getState();
    const examResult: ExamResult = {
      id: 'er1',
      sessionId: 's1',
      userId: 'local',
      score: 26,
      percentage: 65,
      passed: true,
      timeSpentSeconds: 3600,
      answers: [],
      breakdownByChapter: {},
      breakdownByLo: {},
      breakdownByKLevel: {},
      flaggedQuestions: [],
      completedAt: new Date().toISOString(),
    };

    store.addExamResult(examResult);
    const state = useISTQBStore.getState();
    expect(state.examResults).toHaveLength(1);
    expect(state.examResults[0].id).toBe('er1');
    expect(state.examResults[0].passed).toBe(true);
  });

  it('weakTopics are properly set via direct state set', () => {
    const weakTopics: WeakTopic[] = [
      {
        id: 'wt_lo_FL-1.1.1',
        userId: 'local',
        type: 'lo',
        targetId: 'FL-1.1.1',
        targetName: 'FL-1.1.1',
        errorCount: 3,
        lastErrorAt: new Date().toISOString(),
        firstErrorAt: new Date().toISOString(),
        priorityScore: 75,
        suggestedAction: 'Review core concepts.',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    useISTQBStore.setState({ weakTopics });

    const state = useISTQBStore.getState();
    expect(state.weakTopics).toHaveLength(1);
    expect(state.weakTopics[0].priorityScore).toBe(75);
  });

  it('mastery scores update correctly via updateProgressChapter', () => {
    const store = useISTQBStore.getState();
    store.updateProgressChapter('ch1', {
      masteryScore: 85,
      lessonsCompleted: 5,
      totalLessons: 10,
      quizAverage: 90,
      examAverage: 80,
    });

    const state = useISTQBStore.getState();
    const chapter = state.progressChapters.find((pc) => pc.chapterId === 'ch1');
    expect(chapter).toBeDefined();
    expect(chapter!.masteryScore).toBe(85);
  });

  it('resetAll returns state to initial', () => {
    const store = useISTQBStore.getState();

    // Add some data
    store.setUser({ name: 'Modified' });
    store.addQuizResult({
      id: 'qr1',
      quizId: 'q1',
      userId: 'local',
      score: 8,
      totalQuestions: 10,
      percentage: 80,
      timeSpentSeconds: 300,
      answers: [],
      weakTopicsGenerated: false,
      completedAt: new Date().toISOString(),
    });

    // Reset
    store.resetAll();

    const state = useISTQBStore.getState();
    expect(state.user.name).toBe('Candidat');
    expect(state.quizResults).toHaveLength(0);
    expect(state.examResults).toHaveLength(0);
    expect(state.weakTopics).toHaveLength(0);
  });
});
