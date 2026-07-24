// ===== ISTQB CTFL v4.0.1 — Dashboard Page =====

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Chapter, LearningObjective } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useISTQBStore } from '@/store/useISTQBStore';
import { calcMasteryChapter } from '@/utils/scoring';
import {
  BarChart3, BookOpen, Clock, Target, Award, Brain,
  ArrowRight, CheckCircle2, AlertTriangle, Zap, FileText,
  GraduationCap, ListChecks, TrendingUp, Flame, Calendar,
  XCircle, Lightbulb
} from 'lucide-react';

export default function DashboardPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useISTQBStore((s) => s.user);
  const progressChapters = useISTQBStore((s) => s.progressChapters);
  const quizResults = useISTQBStore((s) => s.quizResults);
  const examResults = useISTQBStore((s) => s.examResults);
  const weakTopics = useISTQBStore((s) => s.weakTopics);
  const flashcardReviews = useISTQBStore((s) => s.flashcardReviews);

  useEffect(() => {
    async function load() {
      try {
        const data = await import('@/data/seed/chapters.json');
        setChapters(data.default as Chapter[]);
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute stats
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

    const lastExam = examResults.length > 0
      ? examResults.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0]
      : null;

    const activeWeakTopics = weakTopics.filter((wt) => wt.status === 'active').length;

    return {
      totalChapters,
      completedChapters,
      totalQuizResults,
      avgQuizScore,
      lastExam,
      activeWeakTopics,
    };
  }, [chapters, progressChapters, quizResults, examResults, weakTopics]);

  // Recommendations
  const recommendations = useMemo(() => {
    const recs: { title: string; desc: string; href: string; icon: any; color: string }[] = [];

    // Check weak topics
    if (stats.activeWeakTopics > 0) {
      recs.push({
        title: `${stats.activeWeakTopics} sujet${stats.activeWeakTopics > 1 ? 's' : ''} faible${stats.activeWeakTopics > 1 ? 's' : ''} à réviser`,
        desc: 'Identifiés par vos réponses incorrectes. Priorité recommandée.',
        href: '/quiz/review-errors',
        icon: AlertTriangle,
        color: 'text-rose-600 dark:text-rose-400',
      });
    }

    // Check last exam
    if (stats.lastExam && !stats.lastExam.passed) {
      recs.push({
        title: 'Examen blanc non réussi',
        desc: `Score: ${stats.lastExam.percentage}%. Continuez à vous entraîner.`,
        href: '/exam',
        icon: Award,
        color: 'text-amber-600 dark:text-amber-400',
      });
    }

    // Suggest quiz if no activity
    if (stats.totalQuizResults === 0) {
      recs.push({
        title: 'Commencez par un quiz',
        desc: 'Testez vos connaissances avec un quiz rapide de 10 questions.',
        href: '/quiz?quick=10',
        icon: Zap,
        color: 'text-indigo-600 dark:text-indigo-400',
      });
    }

    // Flashcards review
    recs.push({
      title: 'Réviser les flashcards',
      desc: 'Répétition espacée pour renforcer votre mémoire à long terme.',
      href: '/flashcards',
      icon: Brain,
      color: 'text-violet-600 dark:text-violet-400',
    });

    return recs;
  }, [stats]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Tableau de bord
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Bonjour {user.name} · Suivez votre progression vers la certification CTFL
        </p>
      </div>

      {/* Stats cards */}
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
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalQuizResults}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quiz effectués</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.avgQuizScore}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Moyenne quiz</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.activeWeakTopics}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Points faibles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main: Chapter progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chapter mastery */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Progression par chapitre
            </h2>
            <div className="space-y-3">
              {chapters.sort((a, b) => a.order - b.order).map((ch) => {
                const progress = progressChapters.find((pc) => pc.chapterId === ch.id);
                const mastery = progress?.masteryScore ?? 0;
                const lessonsCount = ch.sections.reduce((sum, s) => sum + s.lessons.length, 0);
                const totalLOs = ch.learningObjectives.length;

                return (
                  <Link key={ch.id} href={`/syllabus/${ch.slug}`} className="group block">
                    <Card className="transition-all hover:shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs font-bold text-white">
                              {ch.order}
                            </span>
                            <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 dark:text-slate-50 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {ch.titleFr}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {progress?.lessonsCompleted ?? 0}/{lessonsCount} leçons
                            </span>
                            <Badge variant={mastery >= 80 ? 'success' : mastery >= 50 ? 'warning' : 'secondary'} className="text-xs">
                              {mastery}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={mastery} />
                        <div className="mt-1 flex gap-2 text-xs text-slate-400 dark:text-slate-500">
                          <span>{totalLOs} LO</span>
                          {progress?.quizAverage != null && progress.quizAverage > 0 && (
                            <span>· Quiz: {progress.quizAverage}%</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Recent exam result */}
          {stats.lastExam && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
                <Award className="h-5 w-5 text-emerald-500" />
                Dernier examen blanc
              </h2>
              <Link href={`/exam/results/${stats.lastExam.id}`} className="group block">
                <Card className={`transition-all hover:shadow-sm ${
                  stats.lastExam.passed
                    ? 'border-emerald-200 dark:border-emerald-900/50'
                    : 'border-rose-200 dark:border-rose-900/50'
                }`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        stats.lastExam.passed
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}>
                        {stats.lastExam.passed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          {stats.lastExam.passed ? 'Réussi' : 'Échoué'} · {stats.lastExam.percentage}%
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {stats.lastExam.score}/{stats.lastExam.answers.length} correct · {Math.floor(stats.lastExam.timeSpentSeconds / 60)} min
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </CardContent>
                </Card>
              </Link>
            </section>
          )}
        </div>

        {/* Sidebar: Recommendations & activity */}
        <div className="space-y-6">
          {/* Recommendations */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Recommandations
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec, i) => {
                const Icon = rec.icon;
                return (
                  <Link key={i} href={rec.href} className="group block">
                    <Card className="transition-all hover:shadow-sm">
                      <CardContent className="flex items-start gap-3 p-4">
                        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${rec.color}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 dark:text-slate-50 dark:group-hover:text-indigo-400 transition-colors">
                            {rec.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {rec.desc}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
              <Zap className="h-5 w-5 text-yellow-500" />
              Actions rapides
            </h2>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/quiz?quick=10">
                  <Zap className="mr-2 h-4 w-4" />
                  Quiz rapide 10 questions
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/flashcards">
                  <Brain className="mr-2 h-4 w-4" />
                  Flashcards à réviser
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/exam">
                  <Award className="mr-2 h-4 w-4" />
                  Examen blanc
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/glossary">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Consulter le glossaire
                </Link>
              </Button>
            </div>
          </section>

          {/* Activity summary */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Activité
            </h2>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Quiz complétés</span>
                  <span className="font-bold text-slate-900 dark:text-slate-50">{stats.totalQuizResults}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Examens blancs</span>
                  <span className="font-bold text-slate-900 dark:text-slate-50">{examResults.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Flashcards révisées</span>
                  <span className="font-bold text-slate-900 dark:text-slate-50">{flashcardReviews.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Objectif quotidien</span>
                  <span className="font-bold text-slate-900 dark:text-slate-50">{user.dailyGoalMinutes} min</span>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}


