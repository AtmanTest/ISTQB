// ===== ISTQB CTFL v4.0.1 — Chapter Detail Page =====

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Chapter, Section, Lesson } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useISTQBStore } from '@/store/useISTQBStore';
import {
  BookOpen, Clock, ArrowLeft, ArrowRight, ListChecks,
  Target, CheckCircle2, PlayCircle, Lock, FileText,
  GraduationCap, AlertTriangle
} from 'lucide-react';

const chapterColors: Record<string, string> = {
  ch1: 'from-indigo-500 to-indigo-600',
  ch2: 'from-violet-500 to-violet-600',
  ch3: 'from-blue-500 to-blue-600',
  ch4: 'from-emerald-500 to-emerald-600',
  ch5: 'from-amber-500 to-amber-600',
  ch6: 'from-rose-500 to-rose-600',
};

const kLevelColors: Record<string, string> = {
  K1: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  K2: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  K3: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export default function ChapterDetailPage() {
  const params = useParams();
  const chapterSlug = params.chapterSlug as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const progressChapters = useISTQBStore((s) => s.progressChapters);
  const updateProgressChapter = useISTQBStore((s) => s.updateProgressChapter);

  useEffect(() => {
    async function load() {
      try {
        const data = (await import('@/data/seed/chapters.json')).default as unknown as Chapter[];
        const found = data.find((ch) => ch.slug === chapterSlug);
        if (found) {
          setChapter(found);
          // Ensure progress record exists
          const exists = progressChapters.find((pc) => pc.chapterId === found.id);
          if (!exists) {
            const totalLessons = found.sections.reduce((sum, s) => sum + s.lessons.length, 0);
            updateProgressChapter(found.id, { status: 'in_progress', totalLessons });
          }
        }
      } catch (e) {
        console.error('Failed to load chapter:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [chapterSlug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Chapitre introuvable</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Le chapitre demandé n&apos;existe pas.</p>
          <Button asChild className="mt-4">
            <Link href="/syllabus">Retour au syllabus</Link>
          </Button>
        </div>
      </div>
    );
  }

  const progress = progressChapters.find((pc) => pc.chapterId === chapter.id);
  const mastery = progress?.masteryScore ?? 0;
  const totalLessons = chapter.sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        href="/syllabus"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au syllabus
      </Link>

      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${chapterColors[chapter.id] ?? 'from-slate-500 to-slate-600'} text-white text-xl font-bold shadow-md`}
          >
            {chapter.order}
          </div>
          <div className="min-w-0">
            <Badge variant="secondary" className="mb-2 bg-white/15 text-white hover:bg-white/25">
              Chapitre {chapter.order}
            </Badge>
            <h1 className="text-2xl font-bold sm:text-3xl">{chapter.titleFr}</h1>
            <p className="mt-2 text-sm text-slate-300 line-clamp-2">{chapter.description}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {chapter.durationMinutes} min
              </span>
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {totalLessons} leçons
              </span>
              <span className="inline-flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                {chapter.learningObjectives.length} objectifs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progression du chapitre</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{mastery}%</span>
          </div>
          <Progress value={mastery} />
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {progress?.lessonsCompleted ?? 0}/{totalLessons} leçons complétées
            {progress?.quizAverage != null && progress.quizAverage > 0 && ` · Quiz: ${progress.quizAverage}%`}
            {progress?.examAverage != null && progress.examAverage > 0 && ` · Exam: ${progress.examAverage}%`}
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <GraduationCap className="h-5 w-5 text-indigo-500" />
          Objectifs d&apos;apprentissage
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {chapter.learningObjectives.map((lo) => (
            <Card key={lo.id} className="transition-all hover:shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {lo.code}
                      </code>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${kLevelColors[lo.kLevel]}`}>
                        {lo.kLevel}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">{lo.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Sections & Lessons */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          Sections et leçons
        </h2>

        <div className="space-y-4">
          {chapter.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    {section.order}
                  </span>
                  {section.title}
                </CardTitle>
                <CardDescription>
                  {section.lessons.length} leçon{section.lessons.length > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {section.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/syllabus/${chapter.slug}/${lesson.slug}`}
                      className="flex items-center gap-3 py-2.5 group hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-6 px-6 transition-colors"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-500 group-hover:border-indigo-300 group-hover:text-indigo-600 dark:border-slate-700 dark:group-hover:border-indigo-600 dark:group-hover:text-indigo-400">
                        <PlayCircle className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 dark:text-slate-300 dark:group-hover:text-indigo-400 transition-colors">
                          {lesson.title}
                        </span>
                        <span className="ml-2 text-xs text-slate-400">
                          · {lesson.estimatedMinutes} min
                        </span>
                      </div>
                      <Badge variant={lesson.status === 'completed' ? 'success' : 'secondary'} className="text-xs shrink-0">
                        {lesson.status === 'completed' ? 'Fait' : lesson.status === 'in_progress' ? 'En cours' : 'Disponible'}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/quiz/chapter/${chapter.slug}`}>
            Quiz sur ce chapitre <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/flashcards`}>
            Flashcards associées
          </Link>
        </Button>
      </div>
    </div>
  );
}
