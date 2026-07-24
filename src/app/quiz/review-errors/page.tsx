// ===== ISTQB CTFL v4.0.1 — Review Errors (Weak Topics) Page =====

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Chapter, LearningObjective, Question, WeakTopic } from '@/types';
import QuizEngine from '@/components/quiz/quiz-engine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useISTQBStore } from '@/store/useISTQBStore';
import { ArrowLeft, AlertTriangle, BarChart3, Target, ArrowRight, BookOpen } from 'lucide-react';

export default function ReviewErrorsPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'quiz'>('list');
  const weakTopics = useISTQBStore((s) => s.weakTopics);

  useEffect(() => {
    async function load() {
      try {
        const [chData, qData] = await Promise.all([
          import('@/data/seed/chapters.json'),
          import('@/data/seed/questions.json'),
        ]);
        setChapters(chData.default as Chapter[]);
        setQuestions(qData.default as unknown as Question[]);
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeTopics = weakTopics
    .filter((wt) => wt.status === 'active')
    .sort((a, b) => b.priorityScore - a.priorityScore);

  // For quiz mode: pick questions from LO-level weak topics
  const errorQuestions = questions.filter((q) =>
    activeTopics.some((t) => t.type === 'lo' && t.targetId === q.loId)
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (viewMode === 'quiz' && errorQuestions.length > 0) {
    return (
      <div>
        <div className="mx-auto max-w-2xl px-4 pt-6">
          <button
            onClick={() => setViewMode('list')}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </button>
          <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-50">
            Révision des erreurs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {errorQuestions.length} questions ciblées sur vos points faibles
          </p>
        </div>
        <QuizEngine
          questions={errorQuestions}
          title="Révision des erreurs"
          quizType="review_errors"
          timeLimitSeconds={errorQuestions.length * 90}
          showConfidence
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/quiz"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Quiz
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Révision des erreurs</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Identifiez et corrigez vos points faibles
        </p>
      </div>

      {activeTopics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <BarChart3 className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Aucun point faible identifié
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Faites des quiz pour que nous puissions analyser vos résultats et identifier les sujets à réviser.
            </p>
            <Button asChild className="mt-4">
              <Link href="/quiz?quick=10">Commencer un quiz</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Weak topics list */}
          <div className="space-y-3 mb-8">
            {activeTopics.map((topic) => (
              <Card key={topic.id} className={`border-l-4 ${
                topic.priorityScore >= 70
                  ? 'border-l-rose-500'
                  : topic.priorityScore >= 40
                    ? 'border-l-amber-500'
                    : 'border-l-amber-300'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={
                          topic.priorityScore >= 70 ? 'destructive' :
                          topic.priorityScore >= 40 ? 'warning' : 'secondary'
                        } className="text-xs">
                          Priorité {topic.priorityScore}
                        </Badge>
                        {topic.type === 'lo' && <Badge variant="outline" className="text-xs">LO</Badge>}
                        {topic.type === 'chapter' && <Badge variant="outline" className="text-xs">Chapitre</Badge>}
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-slate-50">
                        {topic.targetName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {topic.errorCount} erreur{topic.errorCount > 1 ? 's' : ''}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        {topic.suggestedAction}
                      </p>
                    </div>
                    {/* Action: quiz on this LO */}
                    {topic.type === 'lo' && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/quiz/lo/${topic.targetName}`}>
                          <Target className="mr-1 h-3.5 w-3.5" />
                          Quiz
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button onClick={() => setViewMode('quiz')} size="lg">
              <BookOpen className="mr-1 h-4 w-4" />
              Réviser avec un quiz ({errorQuestions.length} questions)
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
