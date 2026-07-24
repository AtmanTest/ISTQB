// ===== ISTQB CTFL v4.0.1 — Exam Results Page =====

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Chapter, Question, ExamResult } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useISTQBStore } from '@/store/useISTQBStore';
import { EXAM_RULES } from '@/lib/constants';
import {
  CheckCircle2, XCircle, Award, AlertTriangle, ArrowLeft,
  BarChart3, Target, Clock, BookOpen, GraduationCap, RefreshCw
} from 'lucide-react';

export default function ExamResultsPage() {
  const params = useParams();
  const resultId = params.id as string;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const examResults = useISTQBStore((s) => s.examResults);

  const result = examResults.find((r) => r.id === resultId);

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

  const chapterMap = useMemo(() => {
    const map = new Map<string, Chapter>();
    for (const ch of chapters) map.set(ch.id, ch);
    return map;
  }, [chapters]);

  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of allQuestions) map.set(q.id, q);
    return map;
  }, [allQuestions]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Résultat introuvable</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Cet examen n&apos;a pas été trouvé.</p>
          <Button asChild className="mt-4">
            <Link href="/exam">Retour à l&apos;examen</Link>
          </Button>
        </div>
      </div>
    );
  }

  const passed = result.passed;
  const pct = result.percentage;
  const hours = Math.floor(result.timeSpentSeconds / 3600);
  const minutes = Math.floor((result.timeSpentSeconds % 3600) / 60);

  // Get flagged questions details
  const flaggedDetails = result.flaggedQuestions.map((qId) => questionMap.get(qId)).filter(Boolean) as unknown as Question[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        href="/exam"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;examen
      </Link>

      {/* Hero result */}
      <Card className={`mb-8 overflow-hidden border-2 ${
        passed ? 'border-emerald-400 dark:border-emerald-600' : 'border-rose-400 dark:border-rose-600'
      }`}>
        <div className={`px-6 py-8 text-center ${
          passed
            ? 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900'
            : 'bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-slate-900'
        }`}>
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
            passed
              ? 'bg-emerald-100 dark:bg-emerald-900/30'
              : 'bg-rose-100 dark:bg-rose-900/30'
          }`}>
            {passed ? (
              <Award className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <h1 className={`text-3xl font-extrabold ${
            passed ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'
          }`}>
            {passed ? 'Félicitations !' : 'Échoué'}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {passed
              ? 'Vous avez réussi l\'examen blanc CTFL !'
              : 'Vous n\'avez pas atteint le seuil de réussite. Continuez à réviser.'}
          </p>

          <div className="mt-6 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-slate-900 dark:text-slate-50">{pct}%</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Score final</p>
            </div>
            <div className="h-16 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {result.score}/{result.answers.length}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Seuil : {EXAM_RULES.passScore}/{EXAM_RULES.totalQuestions}
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {hours > 0 ? `${hours}h ` : ''}{minutes} min
            </span>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/exam">
                <RefreshCw className="mr-1 h-4 w-4" />
                Nouvel examen
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                <BarChart3 className="mr-1 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Breakdown by Chapter */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          Par chapitre
        </h2>
        <div className="space-y-3">
          {Object.entries(result.breakdownByChapter).map(([chId, data]) => {
            const ch = chapterMap.get(chId);
            const chPct = Math.round((data.correct / data.total) * 100);
            return (
              <Card key={chId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        {ch?.titleFr ?? chId}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {data.correct}/{data.total} correct · Chapitre {ch?.order}
                      </p>
                    </div>
                    <Badge variant={chPct >= 65 ? 'success' : chPct >= 40 ? 'warning' : 'destructive'}>
                      {chPct}%
                    </Badge>
                  </div>
                  <Progress value={chPct} indicatorClassName={
                    chPct >= 65
                      ? 'bg-emerald-500'
                      : chPct >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  } />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Breakdown by LO */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <Target className="h-5 w-5 text-emerald-500" />
          Par objectif d&apos;apprentissage
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(result.breakdownByLo).map(([loId, data]) => {
            const loPct = Math.round((data.correct / data.total) * 100);
            // Find the LO in chapters
            let loCode = loId;
            for (const ch of chapters) {
              const lo = ch.learningObjectives.find((l) => l.id === loId);
              if (lo) { loCode = lo.code; break; }
            }
            return (
              <Card key={loId}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {loCode}
                    </code>
                    <Badge variant={loPct >= 65 ? 'success' : loPct >= 40 ? 'warning' : 'destructive'} className="text-xs">
                      {data.correct}/{data.total}
                    </Badge>
                  </div>
                  <Progress value={loPct} className="mt-2" indicatorClassName={
                    loPct >= 65 ? 'bg-emerald-500' : loPct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                  } />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Breakdown by K-Level */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <GraduationCap className="h-5 w-5 text-amber-500" />
          Par niveau K
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(result.breakdownByKLevel).map(([kLevel, data]) => {
            const kPct = Math.round((data.correct / data.total) * 100);
            const kColors: Record<string, string> = {
              K1: 'bg-sky-500',
              K2: 'bg-amber-500',
              K3: 'bg-rose-500',
            };
            return (
              <Card key={kLevel}>
                <CardContent className="p-4 text-center">
                  <Badge className="mb-2">{kLevel}</Badge>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{kPct}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {data.correct}/{data.total}
                  </p>
                  <Progress value={kPct} className="mt-2" indicatorClassName={kColors[kLevel]} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Flagged questions */}
      {flaggedDetails.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
            <BarChart3 className="h-5 w-5 text-amber-500" />
            Questions marquées ({flaggedDetails.length})
          </h2>
          <div className="space-y-2">
            {flaggedDetails.map((q) => {
              const answer = result.answers.find((a) => a.questionId === q.id);
              return (
                <Card key={q.id} className={`border-l-4 ${answer?.isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {answer?.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500" />
                        )}
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{q.stem}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Answer review */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          Revue détaillée
        </h2>
        <div className="space-y-3">
          {result.answers.map((answer) => {
            const q = questionMap.get(answer.questionId);
            if (!q) return null;
            return (
              <Card key={answer.questionId} className={`border-l-4 ${
                answer.isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-500" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{q.stem}</p>
                      <div className="mt-1.5 space-y-1">
                        {q.choices.map((c) => {
                          const isSelected = answer.selectedChoiceId === c.id;
                          return (
                            <div key={c.id} className={`flex items-center gap-2 rounded px-2 py-1 text-xs ${
                              c.isCorrect
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                                : isSelected
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
                                  : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              <span>{c.label}.</span> {c.text}
                              {isSelected && !c.isCorrect && <XCircle className="h-3 w-3 shrink-0" />}
                              {c.isCorrect && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                      {/* Explanation */}
                      {q.explanation && !answer.isCorrect && (
                        <div className="mt-2 rounded bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          <strong>Explication :</strong> {q.explanation.correctAnswerRationale}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <Button asChild>
          <Link href="/exam">
            <RefreshCw className="mr-1 h-4 w-4" />
            Passer un nouvel examen
          </Link>
        </Button>
      </div>
    </div>
  );
}
