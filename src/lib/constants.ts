// ===== ISTQB CTFL v4.0.1 — Constants =====

// ── Exam Rules ─────────────────────────────────────
export const EXAM_RULES = {
  totalQuestions: 40,
  passScore: 26,
  baseTimeSeconds: 3600,
  extendedTimeSeconds: 4500,
  passPercentage: 65,
} as const;

// ── Chapter Durations (minutes) ────────────────────
export const CHAPTER_DURATIONS: Record<string, number> = {
  ch1: 180,
  ch2: 130,
  ch3: 80,
  ch4: 390,
  ch5: 335,
  ch6: 20,
} as const;

// ── Chapter → Business Outcome Codes ───────────────
export const CHAPTER_BO_CODES: Record<string, string[]> = {
  ch1: ['FL-BO1', 'FL-BO2'],
  ch2: ['FL-BO3', 'FL-BO4'],
  ch3: ['FL-BO5'],
  ch4: ['FL-BO6', 'FL-BO7', 'FL-BO8', 'FL-BO9'],
  ch5: ['FL-BO10', 'FL-BO11', 'FL-BO12'],
  ch6: ['FL-BO13', 'FL-BO14'],
} as const;

// ── K-Level Weights ────────────────────────────────
export const K_LEVEL_WEIGHTS: Record<string, number> = {
  K1: 1,
  K2: 2,
  K3: 3,
} as const;

// ── Spaced Repetition Intervals ────────────────────
export const SPACED_REPETITION_INTERVALS: Record<string, number> = {
  again: 1,
  hard: 3,
  good: 7,
  easy: 14,
} as const;

// ── Confidence Labels ──────────────────────────────
export const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Pas sûr',
  2: 'Incertain',
  3: 'Moyen',
  4: 'Plutôt sûr',
  5: 'Certain',
} as const;

// ── Recommendation Rules ───────────────────────────
export interface RecommendationRule {
  id: string;
  condition: string;
  message: string;
}

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: 'chapter_mastery_low',
    condition: 'mastery < 40',
    message:
      'Votre score de maîtrise pour ce chapitre est inférieur à 40 %. Revenez sur les concepts clés et relisez la section correspondante.',
  },
  {
    id: 'k3_weakness',
    condition: 'k3_accuracy < 50',
    message:
      'Vous avez moins de 50 % de bonnes réponses aux questions de niveau K3. Concentrez-vous sur l\'analyse et l\'application des concepts plutôt que sur la simple mémorisation.',
  },
  {
    id: 'confidence_overconfident',
    condition: 'overconfident_rate > 30',
    message:
      'Vous êtes souvent trop confiant dans vos réponses incorrectes. Prenez le temps de lire attentivement chaque question et ses choix de réponse.',
  },
  {
    id: 'confidence_underconfident',
    condition: 'underconfident_rate > 30',
    message:
      'Vous sous-estimez souvent vos bonnes réponses. Revoyez les concepts pour renforcer votre confiance dans vos connaissances.',
  },
  {
    id: 'exam_below_threshold',
    condition: 'mock_exam_score < 65',
    message:
      'Votre score à l\'examen blanc est inférieur au seuil de réussite (65 %). Planifiez des révisions ciblées sur vos chapitres les plus faibles.',
  },
  {
    id: 'exam_close_to_pass',
    condition: 'mock_exam_score >= 65 && mock_exam_score < 75',
    message:
      'Vous êtes proche de la réussite ! Continuez à vous exercer sur vos chapitres faibles pour consolider vos acquis.',
  },
  {
    id: 'spaced_repetition_due',
    condition: 'due_flashcards > 10',
    message:
      'Vous avez plus de 10 flashcards à réviser. Prenez 10 minutes pour les passer en revue et renforcer votre mémoire à long terme.',
  },
  {
    id: 'inactivity_long',
    condition: 'days_since_last_activity > 7',
    message:
      'Cela fait plus d\'une semaine que vous ne vous êtes pas entraîné. Un peu de pratique régulière est plus efficace que des sessions intensives espacées.',
  },
  {
    id: 'chapter_accuracy_drop',
    condition: 'chapter_accuracy_drop > 20',
    message:
      'Votre précision a chuté de plus de 20 % sur ce chapitre par rapport à votre moyenne. Il est recommandé de revoir les objectifs d\'apprentissage concernés.',
  },
  {
    id: 'glossary_weak',
    condition: 'glossary_accuracy < 60',
    message:
      'Votre connaissance des termes du glossaire est insuffisante. Utilisez les flashcards dédiées pour mémoriser la terminologie ISTQB.',
  },
  {
    id: 'time_management',
    condition: 'avg_time_per_question > 120',
    message:
      'Vous prenez en moyenne plus de 2 minutes par question. Entraînez-vous avec le minuteur pour améliorer votre gestion du temps.',
  },
  {
    id: 'mixed_knowledge_gaps',
    condition: 'chapters_with_low_mastery >= 3',
    message:
      'Plusieurs chapitres ont un faible score de maîtrise. Envisagez un plan d\'étude structuré pour aborder ces lacunes de manière organisée.',
  },
  {
    id: 'good_progress_streak',
    condition: 'consecutive_quiz_pass >= 3',
    message:
      'Vous avez réussi 3 quiz consécutifs ! Continuez sur cette lancée et commencez à vous préparer pour l\'examen blanc.',
  },
];
