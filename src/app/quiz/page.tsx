// ===== ISTQB CTFL v4.0.1 — Quiz Hub Page =====

'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Chapter, Question } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useISTQBStore } from '@/store/useISTQBStore';
import QuizEngine from '@/components/quiz/quiz-engine';
import {
  Zap, BookOpen, Target, AlertTriangle, ArrowRight, Clock,
  BarChart3, ListChecks, ChevronRight
} from 'lucide-react';

export default function QuizHubPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Chargement...</div>}>
      <QuizHubContent />
    </Suspense>
  );
}

function QuizHubContent() {
  const searchParams = useSearchParams();
  const quickCount = searchParams.get('quick');

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const quizResults = useISTQBStore((s) => s.quizResults);
  const weakTopics = useISTQBStore((s) => s.weakTopics);

  useEffect(() => {
    async function load() {
      try {
        const [chData, qData] = await Promise.all([
          import('@/data/seed/chapters.json'),
          import('@/data/seed/questions.json'),
        ]);
        setChapters(chData.default as Chapter[]);
        setAllQuestions(qData.default as unknown as Question[]);
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Quick quiz mode
  if (quickCount) {
    const count = parseInt(quickCount, 10);
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    if (selected.length === 0) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">Aucune question disponible.</p>
          <Button asChild className="mt-4"><Link href="/quiz">Retour</Link></Button>
        </div>
      );
    }

    return (
      <div>
        <div className="mx-auto max-w-2xl px-4 pt-6">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
            Retour
          </Link>
          <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-50">
            Quiz rapide · {count} questions
          </h1>
        </div>
        <QuizEngine
          questions={selected}
          title={`Quiz rapide ${count} questions`}
          quizType="quick"
          timeLimitSeconds={count * 60}
        />
      </div>
    );
  }

  const errorCount = weakTopics.filter((wt) => wt.status === 'active').length;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const quickModes = [
    { count: 5, label: '5 questions', desc: 'Rapide · ~3 min' },
    { count: 10, label: '10 questions', desc: 'Standard · ~6 min' },
    { count: 20, label: '20 questions', desc: 'Approfondi · ~12 min' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Quiz</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Testez vos connaissances avec des quiz personnalisés
        </p>
      </div>

      {/* Quick quiz modes */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <Zap className="h-5 w-5 text-amber-500" />
          Quiz rapide
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickModes.map((mode) => (
            <Link key={mode.count} href={`/quiz?quick=${mode.count}`} className="group block">
              <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{mode.label}</CardTitle>
                  <CardDescription>{mode.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    Commencer <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* By Chapter */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          Par chapitre
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {chapters.sort((a, b) => a.order - b.order).map((ch) => (
            <Link key={ch.id} href={`/quiz/chapter/${ch.slug}`} className="group block">
              <Card className="transition-all hover:shadow-sm hover:-translate-y-0.5">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                      {ch.order}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 dark:text-slate-50 dark:group-hover:text-indigo-400 transition-colors">
                        {ch.titleFr}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {ch.learningObjectives.length} objectifs
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* By Learning Objective */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <Target className="h-5 w-5 text-emerald-500" />
          Par objectif d&apos;apprentissage
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.sort((a, b) => a.order - b.order).map((ch) => (
            ch.learningObjectives.map((lo) => (
              <Link key={lo.id} href={`/quiz/lo/${lo.code}`} className="group block">
                <Card className="transition-all hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {lo.code}
                        </code>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {lo.description}
                        </p>
                        <Badge variant="secondary" className="mt-1.5 text-xs">
                          {lo.kLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ))}
        </div>
      </section>

      {/* Review Errors */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          Réviser les erreurs
        </h2>
        {errorCount > 0 ? (
          <Card className="border-rose-200 dark:border-rose-900/50">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">
                    {errorCount} sujet{errorCount > 1 ? 's' : ''} faible{errorCount > 1 ? 's' : ''} à réviser
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Priorité identifiée par vos résultats
                  </p>
                </div>
              </div>
              <Button asChild variant="destructive" size="sm">
                <Link href="/quiz/review-errors">
                  Réviser <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">Pas encore d&apos;erreurs</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Les sujets faibles apparaîtront ici après vos quiz
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/quiz?quick=10">Premier quiz</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
