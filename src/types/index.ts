// ===== ISTQB CTFL v4.0.1 — TypeScript Interfaces =====

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  titleFr: string;
  description: string;
  durationMinutes: number;
  order: number;
  keywords: string[];
  learningObjectives: LearningObjective[];
  sections: Section[];
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  masteryScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  chapterId: string;
  slug: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  chapterId: string;
  sectionId: string;
  slug: string;
  title: string;
  objective: string;
  summary: string;
  content: string;
  examples: Example[];
  antiExamples: AntiExample[];
  examTraps: string[];
  glossaryTerms: string[];
  miniQuiz: Question[];
  flashcards: Flashcard[];
  nextLessonId: string | null;
  prevLessonId: string | null;
  estimatedMinutes: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface Example {
  id: string;
  title: string;
  scenario: string;
  explanation: string;
}

export interface AntiExample {
  id: string;
  title: string;
  scenario: string;
  whyWrong: string;
  correctApproach: string;
}

export interface LearningObjective {
  id: string;
  chapterId: string;
  code: string;
  description: string;
  kLevel: 'K1' | 'K2' | 'K3';
  businessOutcomeId: string;
  masteryScore: number;
  questionCount: number;
  createdAt: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  termFr: string;
  definition: string;
  synonyms: string[];
  relatedTerms: string[];
  chapterIds: string[];
  loIds: string[];
  addedToReview: boolean;
  createdAt: string;
}

export interface Question {
  id: string;
  chapterId: string;
  loId: string;
  kLevel: 'K1' | 'K2' | 'K3';
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'single' | 'multiple';
  stem: string;
  choices: AnswerChoice[];
  explanation: QuestionExplanation;
  tags: string[];
  source: 'seed' | 'user' | 'admin';
  timesAsked: number;
  timesCorrect: number;
  createdAt: string;
}

export interface AnswerChoice {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionExplanation {
  correctAnswerRationale: string;
  whyOthersWrong: Record<string, string>;
  relatedLo: string;
  relatedGlossaryTerms: string[];
  commonTrap: string;
}

export interface Quiz {
  id: string;
  type: 'quick' | 'chapter' | 'lo' | 'review_errors';
  title: string;
  questionIds: string[];
  timeLimitSeconds: number | null;
  config: QuizConfig;
  createdAt: string;
}

export interface QuizConfig {
  showCorrectionImmediately: boolean;
  allowNavigation: boolean;
  showTimer: boolean;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  answers: SubmittedAnswer[];
  weakTopicsGenerated: boolean;
  completedAt: string;
}

export interface SubmittedAnswer {
  questionId: string;
  selectedChoiceIds: string[];
  isCorrect: boolean;
  confidence: number;
  timeSpentSeconds: number;
}

export interface ExamSession {
  id: string;
  type: 'mock_exam';
  title: string;
  questionIds: string[];
  totalQuestions: number;
  timeLimitSeconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt: string | null;
}

export interface ExamResult {
  id: string;
  sessionId: string;
  userId: string;
  score: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  answers: ExamAnswer[];
  breakdownByChapter: Record<string, { correct: number; total: number }>;
  breakdownByLo: Record<string, { correct: number; total: number }>;
  breakdownByKLevel: Record<string, { correct: number; total: number }>;
  flaggedQuestions: string[];
  completedAt: string;
}

export interface ExamAnswer {
  questionId: string;
  selectedChoiceId: string;
  isCorrect: boolean;
  isFlagged: boolean;
  confidence: number;
  timeSpentSeconds: number;
}

export interface WeakTopic {
  id: string;
  userId: string;
  type: 'chapter' | 'lo' | 'k_level' | 'glossary_term';
  targetId: string;
  targetName: string;
  errorCount: number;
  lastErrorAt: string;
  firstErrorAt: string;
  priorityScore: number;
  suggestedAction: string;
  status: 'active' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  chapterId: string;
  lessonId: string | null;
  loId: string | null;
  front: string;
  back: string;
  hint: string | null;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  nextReviewAt: string | null;
  intervalDays: number;
  reviewCount: number;
  correctStreak: number;
  createdAt: string;
}

export interface FlashcardReview {
  id: string;
  flashcardId: string;
  userId: string;
  result: 'again' | 'hard' | 'good' | 'easy';
  reviewedAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  type: '2_weeks' | '4_weeks' | '6_weeks' | '8_weeks' | 'intensive';
  title: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  status: 'active' | 'completed' | 'paused';
  tasks: StudyPlanTask[];
  createdAt: string;
}

export interface StudyPlanTask {
  id: string;
  planId: string;
  dayNumber: number;
  title: string;
  description: string;
  type: 'read' | 'quiz' | 'flashcard' | 'exam' | 'review';
  chapterId: string | null;
  loId: string | null;
  estimatedMinutes: number;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt: string | null;
}

export interface ProgressChapter {
  id: string;
  userId: string;
  chapterId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  lessonsCompleted: number;
  totalLessons: number;
  quizAverage: number;
  examAverage: number;
  masteryScore: number;
  timeSpentMinutes: number;
  lastActivityAt: string;
  updatedAt: string;
}

export interface ProgressLo {
  id: string;
  userId: string;
  loId: string;
  chapterId: string;
  masteryScore: number;
  questionsAttempted: number;
  questionsCorrect: number;
  lastAttemptAt: string;
  updatedAt: string;
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  description: string;
  type: 'syllabus' | 'sample_exam' | 'glossary' | 'guide' | 'tool';
  category: 'official' | 'community' | 'tool';
  chapterIds: string[];
  createdAt: string;
}

export interface CheatSheet {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  keyPoints: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  isNativeSpeaker: boolean;
  targetExamDate: string | null;
  dailyGoalMinutes: number;
  preferredMode: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}
