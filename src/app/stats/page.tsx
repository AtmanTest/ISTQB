// ===== ISTQB CTFL v4.0.1 — Statistics Page =====

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Chapter, LearningObjective } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useISTQBStore } from '@/store/useISTQBStore';
import {
  BarChart3, TrendingUp, Clock, Target, Brain,
  Award, BookOpen, PieChart, Activity, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, Layers
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export default function StatsPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useISTQBStore((s) => s.user);
  const progressChapters = useISTQBStore((s) => s.progressChapters);
  const progressLos = useISTQBStore((s) => s.progressLos);
  const quizResults = useISTQBStore((s) => s.quizResults);
  const examResults = useISTQBStore((s) => s.examResults);
  const weakTopics = useISTQBStore((s) => s.weakTopics);

  useEffect(() => {
    async function load() {
      try {
        const data = await import('@/data/seed/chapters.json');
        setChapters(data.default as Chapter[]);
      } catch (e) {
        console.error('Failed to load chapters:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Computed Stats ──────────────────────────────────

  const stats = useMemo(() => {
    const totalChapters = chapters.length;
    const completedChapters = chapters.filter((ch) => {
      const p = progressChapters.find((pc) => pc.chapterId === ch.id);
      return p?.status === 'completed';
    }).length;

    const totalQuizResults = quizResults.length;
    const avgQuizScore = totalQuizResults > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + r.percentage, 0) / totalQuizResults)
      : 0;

    const totalExamResults = examResults.length;
    const passedExams = examResults.filter((r) => r.passed).length;
    const lastExam = totalExamResults > 0
      ? examResults.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0]
      : null;

    const activeWeakTopics = weakTopics.filter((wt) => wt.status === 'active').length;
    const totalStudyTime = progressChapters.reduce((sum, pc) => sum + (pc.timeSpentMinutes || 0), 0);
    const masteredLOs = progressLos.filter((pl) => (pl.masteryScore || 0) >= 80).length;
    const totalLOs = chapters.reduce((sum, ch) => sum + ch.learningObjectives.length, 0);

    return {
      totalChapters,
      completedChapters,
      totalQuizResults,
      avgQuizScore,
      totalExamResults,
      passedExams,
      lastExam,
      activeWeakTopics,
      totalStudyTime,
      masteredLOs,
      totalLOs,
    };
  }, [chapters, progressChapters, quizResults, examResults, weakTopics, progressLos]);

  // ── Chart Data ──────────────────────────────────────

  // Progress over time (quiz results)
  const progressOverTime = useMemo(() => {
    return quizResults
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
      .slice(-20)
      .map((r, i) => ({
        name: `#${i + 1}`,
        score: r.percentage,
        date: new Date(r.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      }));
  }, [quizResults]);

  // Chapter scores for bar chart
  const chapterScoreData = useMemo(() => {
    return chapters
      .sort((a, b) => a.order - b.order)
      .map((ch) => {
        const p = progressChapters.find((pc) => pc.chapterId === ch.id);
        return {
          name: `Ch${ch.order}`,
          fullName: ch.titleFr,
          mastery: p?.masteryScore ?? 0,
          quiz: p?.quizAverage ?? 0,
          exam: p?.examAverage ?? 0,
        };
      });
  }, [chapters, progressChapters]);

  // K-level radar data
  const kLevelData = useMemo(() => {
    const kLevels = ['K1', 'K2', 'K3'];
    const map: Record<string, { correct: number; total: number }> = {
      K1: { correct: 0, total: 0 },
      K2: { correct: 0, total: 0 },
      K3: { correct: 0, total: 0 },
    };

    for (const exam of examResults) {
      for (const [kLevel, breakdown] of Object.entries(exam.breakdownByKLevel)) {
        if (map[kLevel]) {
          map[kLevel].correct += breakdown.correct;
          map[kLevel].total += breakdown.total;
        }
      }
    }

    return kLevels.map((kl) => ({
      kLevel: kl,
      accuracy: map[kl].total > 0 ? Math.round((map[kl].correct / map[kl].total) * 100) : 0,
    }));
  }, [examResults]);

  // Weak topics sorted by priority
  const sortedWeakTopics = useMemo(() => {
    return [...weakTopics]
      .filter((wt) => wt.status === 'active')
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 10);
  }, [weakTopics]);

  // ── Loading State ───────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  // ── Empty State ─────────────────────────────────────

  const hasData = quizResults.length > 0 || examResults.length > 0 || progressChapters.length > 0;

  if (!hasData) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Statistiques
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Suivez votre progression détaillée vers la certification CTFL
          </p>
        </div>
        <Card className="py-16 text-center">
          <CardContent>
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
              Aucune donnée disponible
            </h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Commencez à étudier les chapitres, passez des quiz et des examens blancs pour voir vos statistiques apparaître ici.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/syllabus"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Commencer un chapitre
              </Link>
              <Link
                href="/quiz?quick=10"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Brain className="h-4 w-4" />
                Quiz rapide
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Statistiques
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Suivez votre progression détaillée vers la certification CTFL
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {stats.completedChapters}/{stats.totalChapters}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chapitres complétés</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {stats.masteredLOs}/{stats.totalLOs}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">LO maîtrisés</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {stats.passedExams}/{stats.totalExamResults}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Examens réussis</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {stats.totalStudyTime}h
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Temps d&apos;étude total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Progress Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Progression des quiz
            </CardTitle>
            <CardDescription>Évolution des scores aux quiz dans le temps</CardDescription>
          </CardHeader>
          <CardContent>
            {progressOverTime.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-slate-500" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="text-slate-500" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg, #fff)',
                        border: '1px solid var(--tooltip-border, #e2e8f0)',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(_, data) => data[0]?.payload?.date || ''}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#6366f1' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                Pas encore de quiz
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chapter Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Scores par chapitre
            </CardTitle>
            <CardDescription>Maîtrise, quiz et examens par chapitre</CardDescription>
          </CardHeader>
          <CardContent>
            {chapterScoreData.some((d) => d.mastery > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chapterScoreData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-slate-500" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="text-slate-500" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg, #fff)',
                        border: '1px solid var(--tooltip-border, #e2e8f0)',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(_, data) => data[0]?.payload?.fullName || ''}
                    />
                    <Legend />
                    <Bar dataKey="mastery" name="Maîtrise" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="quiz" name="Quiz" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                Pas encore de données par chapitre
              </div>
            )}
          </CardContent>
        </Card>

        {/* Radar — K-Level Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-indigo-500" />
              Précision par niveau K
            </CardTitle>
            <CardDescription>Votre précision aux questions K1, K2 et K3</CardDescription>
          </CardHeader>
          <CardContent>
            {kLevelData.some((d) => d.accuracy > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={kLevelData}>
                    <PolarGrid className="stroke-slate-200 dark:stroke-slate-700" />
                    <PolarAngleAxis
                      dataKey="kLevel"
                      tick={{ fontSize: 13 }}
                      className="text-slate-600 dark:text-slate-300"
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                      className="text-slate-400"
                    />
                    <Radar
                      name="Précision"
                      dataKey="accuracy"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.2}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Précision']}
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg, #fff)',
                        border: '1px solid var(--tooltip-border, #e2e8f0)',
                        borderRadius: '8px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                Passez un examen pour voir la répartition K-Level
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weak Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Points faibles prioritaires
            </CardTitle>
            <CardDescription>
              {stats.activeWeakTopics > 0
                ? `${stats.activeWeakTopics} sujet${stats.activeWeakTopics > 1 ? 's' : ''} à réviser`
                : 'Aucun point faible détecté'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedWeakTopics.length > 0 ? (
              <div className="space-y-3">
                {sortedWeakTopics.map((wt) => (
                  <div key={wt.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                      wt.priorityScore >= 70
                        ? 'bg-rose-500'
                        : wt.priorityScore >= 40
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                    }`}>
                      <XCircle className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        {wt.targetName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="capitalize">{wt.type}</span>
                        <span>·</span>
                        <span>{wt.errorCount} erreur{wt.errorCount > 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span>Priorité: {wt.priorityScore}%</span>
                      </div>
                      <Progress
                        value={wt.priorityScore}
                        className="mt-1 h-1.5"
                        indicatorClassName={
                          wt.priorityScore >= 70
                            ? 'bg-rose-500'
                            : wt.priorityScore >= 40
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                        }
                      />
                    </div>
                  </div>
                ))}
                <Link
                  href="/quiz/review-errors"
                  className="mt-2 flex items-center justify-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  Réviser les erreurs
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-slate-400">
                {stats.activeWeakTopics === 0
                  ? 'Continuez votre bon travail !'
                  : 'Pas de données suffisantes'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chapter Detail Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-indigo-500" />
            Détail par chapitre
          </CardTitle>
          <CardDescription>Progression détaillée et temps passé</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chapters.sort((a, b) => a.order - b.order).map((ch) => {
              const progress = progressChapters.find((pc) => pc.chapterId === ch.id);
              const mastery = progress?.masteryScore ?? 0;
              const totalLessons = ch.sections.reduce((sum, s) => sum + s.lessons.length, 0);
              const lessonsDone = progress?.lessonsCompleted ?? 0;
              const timeSpent = progress?.timeSpentMinutes ?? 0;

              return (
                <div key={ch.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs font-bold text-white">
                      {ch.order}
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                      {ch.titleFr}
                    </span>
                    <Badge variant={mastery >= 80 ? 'success' : mastery >= 50 ? 'warning' : 'secondary'} className="text-xs shrink-0">
                      {mastery}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{lessonsDone}/{totalLessons} leçons</span>
                    <span>·</span>
                    <span>{timeSpent} min</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Last Exam Detail */}
      {stats.lastExam && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 text-emerald-500" />
              Dernier examen blanc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {stats.lastExam.percentage}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Score final</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                <p className={`text-2xl font-bold ${
                  stats.lastExam.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {stats.lastExam.passed ? 'Réussi' : 'Échoué'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stats.lastExam.score}/{stats.lastExam.answers.length} correctes
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {Math.floor(stats.lastExam.timeSpentSeconds / 60)} min
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Temps passé</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link
                href={`/exam/results/${stats.lastExam.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                Voir les détails complets
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
