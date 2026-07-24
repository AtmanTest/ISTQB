// ===== ISTQB CTFL v4.0.1 — Weak Topic Analysis =====

import type {
  QuizResult,
  ExamResult,
  Chapter,
  LearningObjective,
  WeakTopic,
} from '@/types';
import { calcWeakTopicPriority } from '@/utils/scoring';

// ── Configuration ──────────────────────────────────
const MIN_ERRORS_FOR_WEAK = 2;
const DECAY_DAYS_THRESHOLD = 14; // errors > 14 days old get lower priority

// ── Helpers ────────────────────────────────────────

interface ErrorEntry {
  targetId: string;
  targetName: string;
  type: 'chapter' | 'lo' | 'k_level' | 'glossary_term';
  timestamp: string;
  kLevel: 'K1' | 'K2' | 'K3';
}

/**
 * Extract error entries from quiz results and exam results.
 */
function extractErrors(
  quizResults: QuizResult[],
  examResults: ExamResult[]
): ErrorEntry[] {
  const errors: ErrorEntry[] = [];

  for (const quiz of quizResults) {
    for (const answer of quiz.answers) {
      if (!answer.isCorrect) {
        errors.push({
          targetId: answer.questionId,
          targetName: `Question ${answer.questionId}`,
          type: 'lo',
          timestamp: quiz.completedAt,
          kLevel: 'K2', // fallback — real impl would look up the question
        });
      }
    }
  }

  for (const exam of examResults) {
    for (const answer of exam.answers) {
      if (!answer.isCorrect) {
        errors.push({
          targetId: answer.questionId,
          targetName: `Question ${answer.questionId}`,
          type: 'lo',
          timestamp: exam.completedAt,
          kLevel: 'K2',
        });
      }
    }
  }

  return errors;
}

/**
 * Map question-level errors to learning objective and chapter level,
 * then compute priority scores for each weak topic.
 */
export function identifyWeakTopics(
  quizResults: QuizResult[],
  examResults: ExamResult[],
  chapters: Chapter[],
  los: LearningObjective[]
): WeakTopic[] {
  const errors = extractErrors(quizResults, examResults);

  if (errors.length === 0) return [];

  // Build a lookup: questionId → loId → chapterId
  // Since we don't have a direct question→LO mapping in types yet,
  // we infer from the LOS that are provided.
  const loMap = new Map<string, LearningObjective>();
  for (const lo of los) {
    loMap.set(lo.id, lo);
  }

  const chapterMap = new Map<string, Chapter>();
  for (const ch of chapters) {
    chapterMap.set(ch.id, ch);
  }

  // Group errors by LO
  const loErrors = new Map<string, ErrorEntry[]>();
  for (const error of errors) {
    const list = loErrors.get(error.targetId) ?? [];
    list.push(error);
    loErrors.set(error.targetId, list);
  }

  // Also aggregate by chapter
  const chapterErrors = new Map<string, ErrorEntry[]>();
  for (const [loId, errs] of loErrors) {
    const lo = loMap.get(loId);
    if (lo) {
      const list = chapterErrors.get(lo.chapterId) ?? [];
      list.push(...errs);
      chapterErrors.set(lo.chapterId, list);
    }
  }

  const now = new Date().toISOString();
  const weakTopics: WeakTopic[] = [];
  let idx = 0;

  // Generate WeakTopic entries for each LO
  for (const [loId, errs] of loErrors) {
    if (errs.length < MIN_ERRORS_FOR_WEAK) continue;

    const lo = loMap.get(loId);
    const timestamps = errs.map((e) => new Date(e.timestamp).getTime());
    const lastErrorAt = new Date(Math.max(...timestamps)).toISOString();
    const firstErrorAt = new Date(Math.min(...timestamps)).toISOString();
    const daysSinceLastError =
      (Date.now() - new Date(lastErrorAt).getTime()) / (1000 * 60 * 60 * 24);
    const kLevel = lo?.kLevel ?? 'K2';

    const priority = calcWeakTopicPriority(
      errs.length,
      Math.round(daysSinceLastError),
      kLevel
    );

    weakTopics.push({
      id: `wt_lo_${loId}`,
      userId: '',
      type: 'lo',
      targetId: loId,
      targetName: lo?.code ?? loId,
      errorCount: errs.length,
      lastErrorAt,
      firstErrorAt,
      priorityScore: priority,
      suggestedAction: generateSuggestedAction({
        id: `wt_lo_${loId}`,
        type: 'lo',
        targetName: lo?.code ?? loId,
        errorCount: errs.length,
        daysSinceLastError: Math.round(daysSinceLastError),
        kLevel,
      }),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
  }

  // Generate WeakTopic entries for each chapter
  for (const [chapterId, errs] of chapterErrors) {
    if (errs.length < MIN_ERRORS_FOR_WEAK) continue;

    const chapter = chapterMap.get(chapterId);
    const timestamps = errs.map((e) => new Date(e.timestamp).getTime());
    const lastErrorAt = new Date(Math.max(...timestamps)).toISOString();
    const firstErrorAt = new Date(Math.min(...timestamps)).toISOString();
    const daysSinceLastError =
      (Date.now() - new Date(lastErrorAt).getTime()) / (1000 * 60 * 60 * 24);

    // For chapters, use the max K-level of their LOs for priority weighting
    const chapterLos = los.filter((lo) => lo.chapterId === chapterId);
    const maxKLevel: 'K1' | 'K2' | 'K3' = chapterLos.some((lo) => lo.kLevel === 'K3')
      ? 'K3'
      : chapterLos.some((lo) => lo.kLevel === 'K2')
        ? 'K2'
        : 'K1';

    const priority = calcWeakTopicPriority(
      errs.length,
      Math.round(daysSinceLastError),
      maxKLevel
    );

    weakTopics.push({
      id: `wt_ch_${chapterId}`,
      userId: '',
      type: 'chapter',
      targetId: chapterId,
      targetName: chapter?.title ?? chapterId,
      errorCount: errs.length,
      lastErrorAt,
      firstErrorAt,
      priorityScore: priority,
      suggestedAction: generateSuggestedAction({
        id: `wt_ch_${chapterId}`,
        type: 'chapter',
        targetName: chapter?.title ?? chapterId,
        errorCount: errs.length,
        daysSinceLastError: Math.round(daysSinceLastError),
        kLevel: maxKLevel,
      }),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
  }

  return weakTopics;
}

/**
 * Sort weak topics by priority score (highest first).
 * Ties are broken by error count (more errors first), then by name.
 */
export function sortByPriority(topics: WeakTopic[]): WeakTopic[] {
  return [...topics].sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    if (b.errorCount !== a.errorCount) {
      return b.errorCount - a.errorCount;
    }
    return a.targetName.localeCompare(b.targetName);
  });
}

// ── Suggested Action Generator ─────────────────────

interface TopicInfo {
  id: string;
  type: string;
  targetName: string;
  errorCount: number;
  daysSinceLastError: number;
  kLevel: 'K1' | 'K2' | 'K3';
}

/**
 * Generate a human-readable suggested action for a weak topic.
 */
export function generateSuggestedAction(topic: TopicInfo): string {
  const parts: string[] = [];

  if (topic.errorCount >= 5) {
    parts.push('Revoir en profondeur les concepts fondamentaux.');
  } else if (topic.errorCount >= 3) {
    parts.push('Pratiquer avec des exercices ciblés.');
  } else {
    parts.push('Réviser les notions clés.');
  }

  if (topic.kLevel === 'K3') {
    parts.push(
      'Se concentrer sur l\'application pratique et l\'analyse de scénarios.'
    );
  } else if (topic.kLevel === 'K2') {
    parts.push('Travailler la compréhension et la discrimination des concepts.');
  }

  if (topic.daysSinceLastError <= 3) {
    parts.push('Revoir immédiatement pendant que le sujet est encore frais.');
  } else if (topic.daysSinceLastError > DECAY_DAYS_THRESHOLD) {
    parts.push(
      'Ajouter ce sujet à la file de révision espacée pour raviver la mémoire.'
    );
  }

  if (topic.type === 'chapter') {
    parts.push(
      `Utiliser les flashcards du chapitre "${topic.targetName}" pour renforcer la mémorisation.`
    );
  }

  return parts.join(' ');
}
