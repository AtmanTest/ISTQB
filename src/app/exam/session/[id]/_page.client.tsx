// ===== ISTQB CTFL v4.0.1 — Active Exam Session Page =====

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Question, ExamResult, ExamSession, ExamAnswer } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useExamStore } from '@/store/useExamStore';
import { useISTQBStore } from '@/store/useISTQBStore';
import { useTimer } from '@/hooks/useTimer';
import { validateExamAnswers } from '@/utils/exam-generator';
import { generateId } from '@/lib/utils';
import { EXAM_RULES } from '@/lib/constants';
import {
  Clock, ChevronLeft, ChevronRight, Flag, FlagOff, CheckCircle2,
  XCircle, AlertTriangle, ArrowLeft, Send, Bookmark
} from 'lucide-react';

export default function ExamSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentSession = useExamStore((s) => s.currentSession);
  const currentAnswers = useExamStore((s) => s.currentAnswers);
  const currentIndex = useExamStore((s) => s.currentQuestionIndex);
  const flaggedQuestions = useExamStore((s) => s.flaggedQuestions);
  const examActive = useExamStore((s) => s.examActive);

  const submitAnswer = useExamStore((s) => s.submitAnswer);
  const toggleFlag = useExamStore((s) => s.toggleFlag);
  const nextQuestion = useExamStore((s) => s.nextQuestion);
  const prevQuestion = useExamStore((s) => s.prevQuestion);
  const finishExam = useExamStore((s) => s.finishExam);
  const abandonExam = useExamStore((s) => s.abandonExam);

  const updateExamSession = useISTQBStore((s) => s.updateExamSession);
  const addExamResult = useISTQBStore((s) => s.addExamResult);
  const examSessions = useISTQBStore((s) => s.examSessions);

  // Get exam questions from store or rebuild
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const qData = (await import('@/data/seed/questions.json')).default as unknown as Question[];
        setAllQuestions(qData);

        // Find the session
        const session = examSessions.find((s) => s.id === sessionId);
        if (session) {
          const questions = qData.filter((q) => session.questionIds.includes(q.id));
          setExamQuestions(questions);

          // If store doesn't have current session, rehydrate from the stored session
          if (!currentSession || currentSession.id !== sessionId) {
            useExamStore.getState().startExam(session);
          }
        }
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  const handleExpire = useCallback(() => {
    handleSubmitExam();
  }, []);

  const timer = useTimer(EXAM_RULES.baseTimeSeconds, handleExpire);

  useEffect(() => {
    if (!loading && examActive) {
      timer.start(EXAM_RULES.baseTimeSeconds);
    }
  }, [loading, examActive]);

  function handleSelect(choiceId: string) {
    const q = examQuestions[currentIndex];
    if (!q) return;
    const answer: ExamAnswer = {
      questionId: q.id,
      selectedChoiceId: choiceId,
      isCorrect: false, // will be computed on submit
      isFlagged: flaggedQuestions.includes(q.id),
      confidence: 3,
      timeSpentSeconds: 10,
    };
    submitAnswer(answer);
  }

  function handleToggleFlag() {
    const q = examQuestions[currentIndex];
    if (!q) return;
    toggleFlag(q.id);
  }

  function handleSubmitExam() {
    setSubmitting(true);
    timer.pause();

    const { answers, timeSpentSeconds, flaggedQuestions: flagged } = finishExam();

    // Grade the exam
    const result = validateExamAnswers(answers, allQuestions);
    result.sessionId = sessionId;
    result.userId = 'local';
    result.id = generateId();
    result.flaggedQuestions = flagged;

    addExamResult(result);
    updateExamSession(sessionId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    router.push(`/exam/results/${result.id}`);
  }

  function handleAbandon() {
    abandonExam();
    updateExamSession(sessionId, { status: 'abandoned' });
    router.push('/exam');
  }

  const currentQ = examQuestions[currentIndex];
  const answeredCount = currentAnswers.length;
  const totalQuestions = examQuestions.length;
  const selectedAnswer = currentAnswers.find((a) => a.questionId === currentQ?.id);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!examActive || examQuestions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Session expirée</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Cette session d&apos;examen n&apos;est plus active.
          </p>
          <Button asChild className="mt-4">
            <Link href="/exam">Retour à l&apos;examen</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Question {currentIndex + 1}/{totalQuestions}
          </span>
          <Badge variant={currentQ?.kLevel === 'K3' ? 'destructive' : currentQ?.kLevel === 'K2' ? 'warning' : 'secondary'}>
            {currentQ?.kLevel}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {/* Flag button */}
          <button
            onClick={handleToggleFlag}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              currentQ && flaggedQuestions.includes(currentQ.id)
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {currentQ && flaggedQuestions.includes(currentQ.id) ? (
              <Flag className="h-3.5 w-3.5" />
            ) : (
              <FlagOff className="h-3.5 w-3.5" />
            )}
            {currentQ && flaggedQuestions.includes(currentQ.id) ? 'Marqué' : 'Marquer'}
          </button>

          {/* Timer */}
          <div className={`flex items-center gap-1 text-sm font-bold ${
            timer.timeRemaining <= 300 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-500 dark:text-slate-400'
          }`}>
            <Clock className="h-4 w-4" />
            {timer.formatted}
          </div>
        </div>
      </div>

      {/* Progress */}
      <Progress value={(answeredCount / totalQuestions) * 100} className="mb-6" />

      {/* Question */}
      {currentQ && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-base font-medium leading-relaxed text-slate-900 dark:text-slate-50">
                {currentIndex + 1}. {currentQ.stem}
              </h2>
            </div>

            <div className="space-y-2.5">
              {currentQ.choices.map((c) => {
                const isSelected = selectedAnswer?.selectedChoiceId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm ring-1 ring-indigo-300 dark:bg-indigo-950/30 dark:text-indigo-300 dark:ring-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="mr-3 font-mono text-xs font-bold">{c.label}.</span>
                    {c.text}
                    {isSelected && (
                      <CheckCircle2 className="ml-2 inline h-4 w-4 text-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {currentIndex > 0 && (
            <Button variant="ghost" size="sm" onClick={prevQuestion}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédente
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {currentIndex < totalQuestions - 1 ? (
            <Button size="sm" onClick={nextQuestion}>
              Suivante
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmitExam}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? 'Soumission...' : 'Terminer l\'examen'}
              <Send className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Question dots */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
        {examQuestions.map((q, i) => {
          const answered = currentAnswers.find((a) => a.questionId === q.id);
          const flagged = flaggedQuestions.includes(q.id);
          return (
            <button
              key={q.id}
              onClick={() => useExamStore.getState().goToQuestion(i)}
              className={`h-3.5 w-3.5 rounded-full border transition-all ${
                i === currentIndex
                  ? 'border-indigo-600 bg-indigo-600 ring-2 ring-indigo-300 dark:ring-indigo-700'
                  : answered
                    ? 'border-emerald-500 bg-emerald-500'
                    : flagged
                      ? 'border-amber-400 bg-amber-400'
                      : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
              }`}
              title={`Q${i + 1}${flagged ? ' (marquée)' : ''}${answered ? ' (répondue)' : ''}`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Répondu
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Marquée
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-white border border-slate-300 dark:border-slate-600 dark:bg-slate-800" /> Non répondue
        </span>
      </div>

      {/* Submit button (also at bottom) */}
      {answeredCount === totalQuestions && (
        <div className="mt-6 text-center">
          <Button
            size="lg"
            onClick={handleSubmitExam}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? 'Soumission...' : `Soumettre l'examen (${answeredCount}/${totalQuestions})`}
            <Send className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Exit confirm dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-sm w-full">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                Quitter l&apos;examen ?
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {answeredCount < totalQuestions
                  ? `Vous n'avez répondu qu'à ${answeredCount}/${totalQuestions} questions. Vos progrès seront perdus.`
                  : 'Voulez-vous vraiment quitter ?'}
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Button variant="outline" onClick={() => setShowExitConfirm(false)}>
                  Continuer l&apos;examen
                </Button>
                <Button variant="destructive" onClick={handleAbandon}>
                  Abandonner
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
