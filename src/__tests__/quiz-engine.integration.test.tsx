// ===== ISTQB CTFL v4.0.1 — Quiz Engine Integration Tests =====

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuizEngine from '@/components/quiz/quiz-engine';
import { useISTQBStore } from '@/store/useISTQBStore';
import type { Question, AnswerChoice } from '@/types';

// ── Helpers ──────────────────────────────────────────

function makeQuestion(id: string, overrides: Partial<Question> = {}): Question {
  const choices: AnswerChoice[] = [
    { id: `${id}a`, label: 'A', text: 'Correct Answer', isCorrect: true },
    { id: `${id}b`, label: 'B', text: 'Wrong Answer', isCorrect: false },
    { id: `${id}c`, label: 'C', text: 'Also Wrong', isCorrect: false },
    { id: `${id}d`, label: 'D', text: 'Wrong Too', isCorrect: false },
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

// ── Tests ────────────────────────────────────────────

describe('QuizEngine Integration', () => {
  beforeEach(() => {
    // Reset store before each test
    useISTQBStore.setState({
      user: {
        id: 'local',
        name: 'Candidat',
        email: null,
        isNativeSpeaker: true,
        targetExamDate: null,
        dailyGoalMinutes: 60,
        preferredMode: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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

  it('renders quiz with questions showing K-level badge', () => {
    const questions = [makeQuestion('q1', { kLevel: 'K3' })];
    render(
      <QuizEngine
        questions={questions}
        title="Test Quiz"
        quizType="quick"
      />,
    );

    // Check K-level badge
    expect(screen.getByText('K3')).toBeInTheDocument();
    // Check the "Choix unique" badge for single-choice question
    expect(screen.getByText('Choix unique')).toBeInTheDocument();
    // Check answer progress indicator (text is split across nodes)
    expect(screen.getByText(/questions répondues/)).toBeInTheDocument();
    // The question is displayed (stem text rendered)
    expect(screen.getByText('Question q1?')).toBeInTheDocument();
  });

  it('displays answer choices as buttons', () => {
    const questions = [makeQuestion('q1')];
    render(
      <QuizEngine
        questions={questions}
        title="Test Quiz"
        quizType="quick"
      />,
    );

    // Each choice is a button with accessible name combining label and text
    const btnA = screen.getByRole('button', { name: /A\.\s*Correct Answer/ });
    const btnB = screen.getByRole('button', { name: /B\.\s*Wrong Answer/ });
    const btnC = screen.getByRole('button', { name: /C\.\s*Also Wrong/ });
    const btnD = screen.getByRole('button', { name: /D\.\s*Wrong Too/ });

    expect(btnA).toBeInTheDocument();
    expect(btnB).toBeInTheDocument();
    expect(btnC).toBeInTheDocument();
    expect(btnD).toBeInTheDocument();
  });

  it('allows selecting an answer choice', async () => {
    const questions = [makeQuestion('q1')];
    render(
      <QuizEngine
        questions={questions}
        title="Test Quiz"
        quizType="quick"
      />,
    );

    const correctBtn = screen.getByRole('button', { name: /A\.\s*Correct Answer/ });
    await fireEvent.click(correctBtn);

    // Button should still be in document
    expect(screen.getByRole('button', { name: /A\.\s*Correct Answer/ })).toBeInTheDocument();
  });

  it('shows timer when timeLimitSeconds is provided', () => {
    const questions = [makeQuestion('q1')];
    render(
      <QuizEngine
        questions={questions}
        title="Timed Quiz"
        quizType="quick"
        timeLimitSeconds={180}
      />,
    );

    // Timer should be visible (formatted as MM:SS)
    expect(screen.getByText('03:00')).toBeInTheDocument();
  });

  it('shows empty state when no questions provided', () => {
    render(
      <QuizEngine
        questions={[]}
        title="Empty Quiz"
        quizType="quick"
      />,
    );

    expect(screen.getByText('Aucune question disponible')).toBeInTheDocument();
  });
});
