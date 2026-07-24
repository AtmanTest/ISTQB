// ===== ISTQB CTFL v4.0.1 — Exam Hub Page =====

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Chapter, Question, ExamSession } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useISTQBStore } from '@/store/useISTQBStore';
import { useExamStore } from '@/store/useExamStore';
import { generateExam } from '@/utils/exam-generator';
import { generateId } from '@/lib/utils';
import { EXAM_RULES } from '@/lib/constants';
import {
  FileText, Clock, Target, Award, History, ArrowRight,
  AlertTriangle, CheckCircle2, BarChart3, HelpCircle, GraduationCap,
  XCircle
} from 'lucide-react';

export default function ExamHubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [starting, setStarting] = useState(false);

  const examSessions = useISTQBStore((s) => s.examSessions);
  const examResults = useISTQBStore((s) => s.examResults);
  const addExamSession = useISTQBStore((s) => s.addExamSession);
  const startExam = useExamStore((s) => s.startExam);

  useEffect(() => {
    async function load() {
      try {
        const qData = await import('@/data/seed/questions.json');
        setAllQuestions(qData.default as unknown as Question[]);
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleStartExam() {
    setStarting(true);
    try {
      // Import data if not already loaded
      const qData = allQuestions.length > 0
        ? allQuestions
        : (await import('@/data/seed/questions.json')).default as unknown as Question[];

      const examQuestions = generateExam(qData, { count: EXAM_RULES.totalQuestions });
      if (examQuestions.length === 0) {
        alert('Pas assez de questions disponibles pour l\'examen.');
        setStarting(false);
        return;
      }

      const session: ExamSession = {
        id: generateId(),
        type: 'mock_exam',
        title: 'Examen blanc CTFL',
        questionIds: examQuestions.map((q) => q.id),
        totalQuestions: examQuestions.length,
        timeLimitSeconds: EXAM_RULES.baseTimeSeconds,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        completedAt: null,
      };

      addExamSession(session);
      startExam(session);
      router.push(`/exam/session/${session.id}`);
    } catch (e) {
      console.error('Failed to start exam:', e);
      setStarting(false);
    }
  }

  // Get latest exam result
  const completedExams = examResults
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Examen blanc</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Simulation complète de l&apos;examen ISTQB CTFL en conditions réelles
        </p>
      </div>

      {/* Exam info cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <HelpCircle className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Questions</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{EXAM_RULES.totalQuestions}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Durée</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-50">60 min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Target className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Réussite</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{EXAM_RULES.passScore}/{EXAM_RULES.totalQuestions}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <GraduationCap className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Niveaux K</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-50">K1, K2, K3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start exam */}
      <Card className="mb-8 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-900/50 dark:from-indigo-950/20 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between sm:items-start gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Commencer un examen blanc
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {EXAM_RULES.totalQuestions} questions aléatoires couvrant tout le syllabus
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Timer de {Math.floor(EXAM_RULES.baseTimeSeconds / 60)} minutes avec auto-soumission
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Possibilité de marquer les questions pour révision
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Analyse détaillée des résultats par chapitre et niveau K
                </li>
              </ul>
            </div>
            <Button
              size="lg"
              disabled={starting || allQuestions.length < EXAM_RULES.totalQuestions}
              onClick={handleStartExam}
              className="shrink-0"
            >
              {starting ? (
                <>Préparation...</>
              ) : (
                <>
                  Commencer l&apos;examen <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* In-progress session warning */}
      {examSessions.filter((s) => s.status === 'in_progress').length > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Examens en cours
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Vous avez {examSessions.filter((s) => s.status === 'in_progress').length} session(s) en cours.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/exam/session/${examSessions.find((s) => s.status === 'in_progress')?.id}`}>
                Reprendre
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <History className="h-5 w-5 text-indigo-500" />
          Historique des examens
        </h2>

        {completedExams.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Aucun examen blanc effectué pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {completedExams.map((result) => (
              <Link key={result.id} href={`/exam/results/${result.id}`} className="group block">
                <Card className="transition-all hover:shadow-sm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        result.passed
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}>
                        {result.passed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          {result.passed ? 'Réussi' : 'Échoué'} · {result.percentage}%
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {result.score}/{result.answers.length} · {Math.floor(result.timeSpentSeconds / 60)} min
                        </p>
                      </div>
                    </div>
                    <Badge variant={result.passed ? 'success' : 'destructive'}>
                      {result.percentage}%
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
