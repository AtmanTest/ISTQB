// ===== ISTQB CTFL v4.0.1 — Quiz By Learning Objective Page =====

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Chapter, LearningObjective, Question } from '@/types';
import QuizEngine from '@/components/quiz/quiz-engine';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function QuizByLoPage() {
  const params = useParams();
  const loCode = params.loCode as string;

  const [lo, setLo] = useState<LearningObjective | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [chData, qData] = await Promise.all([
          import('@/data/seed/chapters.json'),
          import('@/data/seed/questions.json'),
        ]);
        const chapters = chData.default as Chapter[];
        const allQuestions = qData.default as unknown as Question[];

        // Find the LO
        let foundLo: LearningObjective | null = null;
        let chapterTitle = '';
        for (const ch of chapters) {
          const lo = ch.learningObjectives.find((l) => l.code === loCode);
          if (lo) {
            foundLo = lo;
            chapterTitle = ch.titleFr;
            break;
          }
        }
        if (foundLo) {
          setLo(foundLo);
          const filtered = allQuestions.filter((q) => q.loId === foundLo!.id);
          setQuestions(filtered);
        }
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [loCode]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!lo) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Objectif introuvable</h2>
          <Button asChild className="mt-4">
            <Link href="/quiz">Retour au quiz</Link>
          </Button>
        </div>
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
          <ArrowLeft className="h-4 w-4" />
          Quiz par objectif
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {lo.code}
          </h1>
          <Badge>{lo.kLevel}</Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{lo.description}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {questions.length} question{questions.length !== 1 ? 's' : ''} disponible{questions.length !== 1 ? 's' : ''}
        </p>
      </div>
      <QuizEngine
        questions={questions}
        title={`Quiz: ${lo.code}`}
        quizType="lo"
        timeLimitSeconds={questions.length * 90}
      />
    </div>
  );
}
