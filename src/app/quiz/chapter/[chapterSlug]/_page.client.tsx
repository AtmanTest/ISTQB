// ===== ISTQB CTFL v4.0.1 — Quiz By Chapter Page =====

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Chapter, Question } from '@/types';
import QuizEngine from '@/components/quiz/quiz-engine';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuizByChapterPage() {
  const params = useParams();
  const chapterSlug = params.chapterSlug as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
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
        const found = chapters.find((ch) => ch.slug === chapterSlug);
        if (found) {
          setChapter(found);
          const filtered = allQuestions.filter((q) => q.chapterId === found.id);
          setQuestions(filtered);
        }
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [chapterSlug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Chapitre introuvable</h2>
          <Button asChild className="mt-4">
            <Link href="/quiz">Retour au quiz</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Aucune question</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Aucune question disponible pour le chapitre &quot;{chapter.titleFr}&quot;.
          </p>
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
          Quiz par chapitre
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-50">
          {chapter.titleFr}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {questions.length} questions disponibles
        </p>
      </div>
      <QuizEngine
        questions={questions}
        title={`Quiz: ${chapter.titleFr}`}
        quizType="chapter"
        timeLimitSeconds={questions.length * 90}
      />
    </div>
  );
}
