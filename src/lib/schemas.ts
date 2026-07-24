// ===== ISTQB CTFL v4.0.1 — Zod Schemas =====
// Schemas matching all interfaces in types/index.ts

import { z } from 'zod';

// ── Helpers ────────────────────────────────────────
const isoDateString = z.string().datetime({ offset: true }).or(z.string().datetime()).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));
const slug = z.string().min(1).max(100);
const id = z.string().min(1);

// ── Enums ──────────────────────────────────────────
const statusEnum = z.enum(['locked', 'available', 'in_progress', 'completed']);
const kLevelEnum = z.enum(['K1', 'K2', 'K3']);
const difficultyEnum = z.enum(['easy', 'medium', 'hard']);
const questionTypeEnum = z.enum(['single', 'multiple']);
const sourceEnum = z.enum(['seed', 'user', 'admin']);
const quizTypeEnum = z.enum(['quick', 'chapter', 'lo', 'review_errors']);
const examSessionTypeEnum = z.enum(['mock_exam']);
const examSessionStatusEnum = z.enum(['in_progress', 'completed', 'abandoned']);
const weakTopicTypeEnum = z.enum(['chapter', 'lo', 'k_level', 'glossary_term']);
const weakTopicStatusEnum = z.enum(['active', 'resolved']);
const reviewResultEnum = z.enum(['again', 'hard', 'good', 'easy']);
const studyPlanTypeEnum = z.enum(['2_weeks', '4_weeks', '6_weeks', '8_weeks', 'intensive']);
const studyPlanStatusEnum = z.enum(['active', 'completed', 'paused']);
const taskTypeEnum = z.enum(['read', 'quiz', 'flashcard', 'exam', 'review']);
const taskStatusEnum = z.enum(['pending', 'in_progress', 'completed']);
const progressChapterStatusEnum = z.enum(['not_started', 'in_progress', 'completed']);
const resourceTypeEnum = z.enum(['syllabus', 'sample_exam', 'glossary', 'guide', 'tool']);
const resourceCategoryEnum = z.enum(['official', 'community', 'tool']);
const modeEnum = z.enum(['light', 'dark', 'system']);

// ── Example Schema ─────────────────────────────────
export const ExampleSchema = z.object({
  id,
  title: z.string().min(1),
  scenario: z.string().min(1),
  explanation: z.string().min(1),
});
export type ExampleType = z.infer<typeof ExampleSchema>;

// ── AntiExample Schema ─────────────────────────────
export const AntiExampleSchema = z.object({
  id,
  title: z.string().min(1),
  scenario: z.string().min(1),
  whyWrong: z.string().min(1),
  correctApproach: z.string().min(1),
});
export type AntiExampleType = z.infer<typeof AntiExampleSchema>;

// ── Flashcard Schema ───────────────────────────────
export const FlashcardSchema = z.object({
  id,
  chapterId: id,
  lessonId: z.string().nullable(),
  loId: z.string().nullable(),
  front: z.string().min(1),
  back: z.string().min(1),
  hint: z.string().nullable(),
  tags: z.array(z.string()),
  difficulty: difficultyEnum,
  nextReviewAt: z.string().nullable(),
  intervalDays: z.number().int().min(0),
  reviewCount: z.number().int().min(0),
  correctStreak: z.number().int().min(0),
  createdAt: isoDateString,
});
export type FlashcardType = z.infer<typeof FlashcardSchema>;

// ── FlashcardReview Schema ─────────────────────────
export const FlashcardReviewSchema = z.object({
  id,
  flashcardId: id,
  userId: id,
  result: reviewResultEnum,
  reviewedAt: isoDateString,
});
export type FlashcardReviewType = z.infer<typeof FlashcardReviewSchema>;

// ── AnswerChoice Schema ────────────────────────────
export const AnswerChoiceSchema = z.object({
  id,
  label: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});
export type AnswerChoiceType = z.infer<typeof AnswerChoiceSchema>;

// ── QuestionExplanation Schema ─────────────────────
export const QuestionExplanationSchema = z.object({
  correctAnswerRationale: z.string().min(1),
  whyOthersWrong: z.record(z.string(), z.string()),
  relatedLo: z.string(),
  relatedGlossaryTerms: z.array(z.string()),
  commonTrap: z.string(),
});
export type QuestionExplanationType = z.infer<typeof QuestionExplanationSchema>;

// ── Question Schema ────────────────────────────────
export const QuestionSchema = z.object({
  id,
  chapterId: id,
  loId: id,
  kLevel: kLevelEnum,
  difficulty: difficultyEnum,
  type: questionTypeEnum,
  stem: z.string().min(1),
  choices: z.array(AnswerChoiceSchema).min(2),
  explanation: QuestionExplanationSchema,
  tags: z.array(z.string()),
  source: sourceEnum,
  timesAsked: z.number().int().min(0),
  timesCorrect: z.number().int().min(0),
  createdAt: isoDateString,
});
export type QuestionType = z.infer<typeof QuestionSchema>;

// ── QuizConfig Schema ──────────────────────────────
export const QuizConfigSchema = z.object({
  showCorrectionImmediately: z.boolean(),
  allowNavigation: z.boolean(),
  showTimer: z.boolean(),
  shuffleQuestions: z.boolean(),
  shuffleChoices: z.boolean(),
});
export type QuizConfigType = z.infer<typeof QuizConfigSchema>;

// ── Quiz Schema ────────────────────────────────────
export const QuizSchema = z.object({
  id,
  type: quizTypeEnum,
  title: z.string().min(1),
  questionIds: z.array(id),
  timeLimitSeconds: z.number().int().positive().nullable(),
  config: QuizConfigSchema,
  createdAt: isoDateString,
});
export type QuizType = z.infer<typeof QuizSchema>;

// ── SubmittedAnswer Schema ─────────────────────────
export const SubmittedAnswerSchema = z.object({
  questionId: id,
  selectedChoiceIds: z.array(z.string()),
  isCorrect: z.boolean(),
  confidence: z.number().int().min(1).max(5),
  timeSpentSeconds: z.number().int().min(0),
});
export type SubmittedAnswerType = z.infer<typeof SubmittedAnswerSchema>;

// ── QuizResult Schema ──────────────────────────────
export const QuizResultSchema = z.object({
  id,
  quizId: id,
  userId: id,
  score: z.number().int().min(0),
  totalQuestions: z.number().int().positive(),
  percentage: z.number().min(0).max(100),
  timeSpentSeconds: z.number().int().min(0),
  answers: z.array(SubmittedAnswerSchema),
  weakTopicsGenerated: z.boolean(),
  completedAt: isoDateString,
});
export type QuizResultType = z.infer<typeof QuizResultSchema>;

// ── LearningObjective Schema ───────────────────────
export const LearningObjectiveSchema = z.object({
  id,
  chapterId: id,
  code: z.string().min(1),
  description: z.string().min(1),
  kLevel: kLevelEnum,
  businessOutcomeId: z.string(),
  masteryScore: z.number().min(0).max(100),
  questionCount: z.number().int().min(0),
  createdAt: isoDateString,
});
export type LearningObjectiveType = z.infer<typeof LearningObjectiveSchema>;

// ── Section Schema ─────────────────────────────────
export const SectionSchema = z.object({
  id,
  chapterId: id,
  slug,
  title: z.string().min(1),
  order: z.number().int().min(0),
  lessons: z.array(z.lazy(() => LessonSchema)),
});
export type SectionType = z.infer<typeof SectionSchema>;

// ── Lesson Schema ──────────────────────────────────
const LessonSchema: z.ZodType<any> = z.object({
  id,
  chapterId: id,
  sectionId: id,
  slug,
  title: z.string().min(1),
  objective: z.string(),
  summary: z.string(),
  content: z.string(),
  examples: z.array(ExampleSchema),
  antiExamples: z.array(AntiExampleSchema),
  examTraps: z.array(z.string()),
  glossaryTerms: z.array(z.string()),
  miniQuiz: z.array(QuestionSchema),
  flashcards: z.array(FlashcardSchema),
  nextLessonId: z.string().nullable(),
  prevLessonId: z.string().nullable(),
  estimatedMinutes: z.number().int().positive(),
  status: statusEnum,
  createdAt: isoDateString,
});
export type LessonType = z.infer<typeof LessonSchema>;

// ── Chapter Schema ─────────────────────────────────
export const ChapterSchema: z.ZodType<any> = z.object({
  id,
  slug,
  title: z.string().min(1),
  titleFr: z.string().min(1),
  description: z.string(),
  durationMinutes: z.number().int().positive(),
  order: z.number().int().min(1),
  keywords: z.array(z.string()),
  learningObjectives: z.array(LearningObjectiveSchema),
  sections: z.array(SectionSchema),
  status: statusEnum,
  masteryScore: z.number().min(0).max(100),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});
export type ChapterType = z.infer<typeof ChapterSchema>;

// ── GlossaryTerm Schema ────────────────────────────
export const GlossaryTermSchema = z.object({
  id,
  term: z.string().min(1),
  termFr: z.string().min(1),
  definition: z.string().min(1),
  definitionFr: z.string(),
  synonyms: z.array(z.string()),
  relatedTerms: z.array(z.string()),
  chapterIds: z.array(z.string()),
  loIds: z.array(z.string()),
  addedToReview: z.boolean(),
  createdAt: isoDateString,
});
export type GlossaryTermType = z.infer<typeof GlossaryTermSchema>;

// ── ExamAnswer Schema ──────────────────────────────
export const ExamAnswerSchema = z.object({
  questionId: id,
  selectedChoiceId: z.string(),
  isCorrect: z.boolean(),
  isFlagged: z.boolean(),
  confidence: z.number().int().min(1).max(5),
  timeSpentSeconds: z.number().int().min(0),
});
export type ExamAnswerType = z.infer<typeof ExamAnswerSchema>;

// ── ExamSession Schema ─────────────────────────────
export const ExamSessionSchema = z.object({
  id,
  type: examSessionTypeEnum,
  title: z.string().min(1),
  questionIds: z.array(id),
  totalQuestions: z.number().int().positive(),
  timeLimitSeconds: z.number().int().positive(),
  status: examSessionStatusEnum,
  startedAt: isoDateString,
  completedAt: isoDateString.nullable(),
});
export type ExamSessionType = z.infer<typeof ExamSessionSchema>;

// ── ExamResult Schema ──────────────────────────────
const BreakdownEntrySchema = z.object({
  correct: z.number().int().min(0),
  total: z.number().int().min(0),
});

export const ExamResultSchema = z.object({
  id,
  sessionId: id,
  userId: id,
  score: z.number().int().min(0),
  percentage: z.number().min(0).max(100),
  passed: z.boolean(),
  timeSpentSeconds: z.number().int().min(0),
  answers: z.array(ExamAnswerSchema),
  breakdownByChapter: z.record(z.string(), BreakdownEntrySchema),
  breakdownByLo: z.record(z.string(), BreakdownEntrySchema),
  breakdownByKLevel: z.record(z.string(), BreakdownEntrySchema),
  flaggedQuestions: z.array(z.string()),
  completedAt: isoDateString,
});
export type ExamResultType = z.infer<typeof ExamResultSchema>;

// ── WeakTopic Schema ───────────────────────────────
export const WeakTopicSchema = z.object({
  id,
  userId: id,
  type: weakTopicTypeEnum,
  targetId: id,
  targetName: z.string().min(1),
  errorCount: z.number().int().min(0),
  lastErrorAt: isoDateString,
  firstErrorAt: isoDateString,
  priorityScore: z.number().min(0).max(100),
  suggestedAction: z.string(),
  status: weakTopicStatusEnum,
  createdAt: isoDateString,
  updatedAt: isoDateString,
});
export type WeakTopicType = z.infer<typeof WeakTopicSchema>;

// ── StudyPlanTask Schema ───────────────────────────
export const StudyPlanTaskSchema = z.object({
  id,
  planId: id,
  dayNumber: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  type: taskTypeEnum,
  chapterId: z.string().nullable(),
  loId: z.string().nullable(),
  estimatedMinutes: z.number().int().positive(),
  status: taskStatusEnum,
  completedAt: isoDateString.nullable(),
});
export type StudyPlanTaskType = z.infer<typeof StudyPlanTaskSchema>;

// ── StudyPlan Schema ───────────────────────────────
export const StudyPlanSchema = z.object({
  id,
  userId: id,
  type: studyPlanTypeEnum,
  title: z.string().min(1),
  startDate: isoDateString,
  endDate: isoDateString,
  totalTasks: z.number().int().min(0),
  completedTasks: z.number().int().min(0),
  status: studyPlanStatusEnum,
  tasks: z.array(StudyPlanTaskSchema),
  createdAt: isoDateString,
});
export type StudyPlanType = z.infer<typeof StudyPlanSchema>;

// ── ProgressChapter Schema ─────────────────────────
export const ProgressChapterSchema = z.object({
  id,
  userId: id,
  chapterId: id,
  status: progressChapterStatusEnum,
  lessonsCompleted: z.number().int().min(0),
  totalLessons: z.number().int().positive(),
  quizAverage: z.number().min(0).max(100),
  examAverage: z.number().min(0).max(100),
  masteryScore: z.number().min(0).max(100),
  timeSpentMinutes: z.number().int().min(0),
  lastActivityAt: isoDateString,
  updatedAt: isoDateString,
});
export type ProgressChapterType = z.infer<typeof ProgressChapterSchema>;

// ── ProgressLo Schema ──────────────────────────────
export const ProgressLoSchema = z.object({
  id,
  userId: id,
  loId: id,
  chapterId: id,
  masteryScore: z.number().min(0).max(100),
  questionsAttempted: z.number().int().min(0),
  questionsCorrect: z.number().int().min(0),
  lastAttemptAt: isoDateString,
  updatedAt: isoDateString,
});
export type ProgressLoType = z.infer<typeof ProgressLoSchema>;

// ── ResourceLink Schema ────────────────────────────
export const ResourceLinkSchema = z.object({
  id,
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string(),
  type: resourceTypeEnum,
  category: resourceCategoryEnum,
  chapterIds: z.array(z.string()),
  createdAt: isoDateString,
});
export type ResourceLinkType = z.infer<typeof ResourceLinkSchema>;

// ── CheatSheet Schema ──────────────────────────────
export const CheatSheetSchema = z.object({
  id,
  chapterId: id,
  title: z.string().min(1),
  content: z.string(),
  keyPoints: z.array(z.string()),
  createdAt: isoDateString,
});
export type CheatSheetType = z.infer<typeof CheatSheetSchema>;

// ── User Schema ────────────────────────────────────
export const UserSchema = z.object({
  id,
  name: z.string().min(1),
  email: z.string().email().nullable(),
  isNativeSpeaker: z.boolean(),
  targetExamDate: isoDateString.nullable(),
  dailyGoalMinutes: z.number().int().positive(),
  preferredMode: modeEnum,
  createdAt: isoDateString,
  updatedAt: isoDateString,
});
export type UserType = z.infer<typeof UserSchema>;
