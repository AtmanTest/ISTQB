// ===== ISTQB CTFL v4.0.1 — Shared Quiz Engine Component =====

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, QuizResult, SubmittedAnswer } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTimer } from '@/hooks/useTimer';
import { useQuizStore } from '@/store/useQuizStore';
import { useISTQBStore } from '@/store/useISTQBStore';
import { generateId, percentage, shuffleArrayCopy } from '@/lib/utils';
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle,
  AlertTriangle, HelpCircle, BarChart3, Rewind, FastForward
} from 'lucide-react';

interface QuizEngineProps {
  questions: Question[];
  title: string;
  quizType: 'quick' | 'chapter' | 'lo' | 'review_errors';
  timeLimitSeconds?: number | null;
  showConfidence?: boolean;
}

export default function QuizEngine({
  questions: rawQuestions,
  title,
  quizType,
  timeLimitSeconds,
  showConfidence = false,
}: QuizEngineProps) {
  const router = useRouter();
  const questions = shuffleArrayCopy(rawQuestions);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [showCorrection, setShowCorrection] = useState(false);

  const addQuizResult = useISTQBStore((s) => s.addQuizResult);
  const totalQuestions = questions.length;

  const handleExpire = useCallback(() => {
    handleFinish();
  }, []);

  const timer = useTimer(timeLimitSeconds ?? 0, handleExpire);

  // Start timer on mount
  useEffect(() => {
    if (timeLimitSeconds && timeLimitSeconds > 0) {
      timer.start(timeLimitSeconds);
    }
  }, []);

  const currentQ = questions[currentIndex];

  function handleSelect(choiceId: string) {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: choiceId }));
  }

  function handleFinish() {
    setSubmitted(true);
    timer.pause();

    let correct = 0;
    const resultMap: Record<string, boolean> = {};
    for (const q of questions) {
      const selected = selectedAnswers[q.id];
      const correctChoice = q.choices.find((c) => c.isCorrect);
      const isCorrect = selected === correctChoice?.id;
      resultMap[q.id] = isCorrect;
      if (isCorrect) correct++;
    }
    setResults(resultMap);
    setScore(correct);
    setShowCorrection(true);

    // Save result
    const timeSpent = timeLimitSeconds ? timeLimitSeconds - timer.timeRemaining : 0;
    const answers: SubmittedAnswer[] = questions.map((q) => ({
      questionId: q.id,
      selectedChoiceIds: selectedAnswers[q.id] ? [selectedAnswers[q.id]] : [],
      isCorrect: resultMap[q.id],
      confidence: 3,
      timeSpentSeconds: Math.round(timeSpent / totalQuestions),
    }));

    const result: QuizResult = {
      id: generateId(),
      quizId: generateId(),
      userId: 'local',
      score: correct,
      totalQuestions,
      percentage: percentage(correct, totalQuestions),
      timeSpentSeconds: Math.max(timeSpent, 0),
      answers,
      weakTopicsGenerated: false,
      completedAt: new Date().toISOString(),
    };
    addQuizResult(result);
  }

  function handleRetry() {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setResults({});
    setScore(0);
    setShowCorrection(false);
    if (timeLimitSeconds && timeLimitSeconds > 0) {
      timer.reset(timeLimitSeconds);
      timer.start(timeLimitSeconds);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Aucune question disponible</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Il n&apos;y a pas encore de questions pour cette sélection.
        </p>
        <Button asChild className="mt-6">
          <a href="/quiz">Retour au quiz</a>
        </Button>
      </div>
    );
  }

  // Results screen
  if (showCorrection) {
    const pct = percentage(score, totalQuestions);
    const passThreshold = 65;
    const passed = pct >= passThreshold;

    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              passed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'
            }`}>
              {passed ? (
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {passed ? 'Quiz réussi !' : 'Quiz échoué'}
            </h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{title}</p>
            <div className="mt-4">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-slate-50">{pct}%</span>
              <span className="ml-2 text-slate-500 dark:text-slate-400">
                ({score}/{totalQuestions})
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Temps : {Math.floor(timer.timeRemaining > 0 ? (timeLimitSeconds ?? 0 - timer.timeRemaining) / 60 : 0)}m
            </div>
          </CardContent>
        </Card>

        {/* Review each question */}
        <div className="space-y-4">
          {questions.map((q, i) => (
            <Card key={q.id} className={`border-l-4 ${
              results[q.id] ? 'border-l-emerald-500' : 'border-l-rose-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{q.stem}</p>
                    <div className="mt-2 space-y-1">
                      {q.choices.map((c) => {
                        const isSelected = selectedAnswers[q.id] === c.id;
                        return (
                          <div key={c.id} className={`flex items-center gap-2 rounded px-2.5 py-1.5 text-xs ${
                            c.isCorrect
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                              : isSelected
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
                                : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {c.isCorrect && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                            {isSelected && !c.isCorrect && <XCircle className="h-3.5 w-3.5 shrink-0" />}
                            <span>{c.label}. {c.text}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Explanation */}
                    {q.explanation && (
                      <div className="mt-2 rounded bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <strong>Explication :</strong> {q.explanation.correctAnswerRationale}
                        {q.explanation.commonTrap && (
                          <p className="mt-1 text-amber-600 dark:text-amber-400">
                            <strong>Piège :</strong> {q.explanation.commonTrap}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={handleRetry} variant="outline">
            <Rewind className="mr-1 h-4 w-4" />
            Refaire le quiz
          </Button>
          <Button asChild>
            <a href="/quiz">Retour au hub</a>
          </Button>
        </div>
      </div>
    );
  }

  // Active quiz
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPct = percentage(currentIndex + 1, totalQuestions);
  const kLevelColors: Record<string, string> = {
    K1: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    K2: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    K3: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Question {currentIndex + 1}/{totalQuestions}
          </span>
          <Badge variant="secondary" className="text-xs">
            {currentQ?.kLevel}
          </Badge>
        </div>
        {timeLimitSeconds && timeLimitSeconds > 0 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            timer.timeRemaining <= 60 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
          }`}>
            <Clock className="h-4 w-4" />
            {timer.formatted}
          </div>
        )}
      </div>

      <Progress value={answeredCount > 0 ? percentage(answeredCount, totalQuestions) : progressPct} className="mb-4" />

      {/* Question card */}
      {currentQ && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base leading-relaxed">{currentQ.stem}</CardTitle>
              <Badge variant="secondary" className="shrink-0 ml-2 text-xs">
                {currentQ.type === 'single' ? 'Choix unique' : 'Choix multiple'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentQ.choices.map((c) => {
                const isSelected = selectedAnswers[currentQ.id] === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm dark:bg-indigo-950/30 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="mr-2 font-mono text-xs font-bold">{c.label}.</span>
                    {c.text}
                  </button>
                );
              })}
            </div>

            {/* Confidence selector */}
            {showConfidence && selectedAnswers[currentQ.id] && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Confiance :</span>
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    className={`rounded px-2 py-0.5 transition-colors ${
                      selectedAnswers[currentQ.id] === String(level)
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédente
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {currentIndex < totalQuestions - 1 ? (
            <Button
              size="sm"
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={!selectedAnswers[currentQ?.id]}
            >
              Suivante
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleFinish}
              disabled={Object.keys(selectedAnswers).length < totalQuestions}
            >
              Terminer <FastForward className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Question indicator dots */}
      <div className="mt-6 flex flex-wrap justify-center gap-1.5">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`h-3 w-3 rounded-full transition-colors ${
              i === currentIndex
                ? 'bg-indigo-600 ring-2 ring-indigo-300 dark:ring-indigo-700'
                : selectedAnswers[q.id]
                  ? 'bg-emerald-500'
                  : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>

      {/* Answer count */}
      <div className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
        {answeredCount}/{totalQuestions} questions répondues
      </div>
    </div>
  );
}
