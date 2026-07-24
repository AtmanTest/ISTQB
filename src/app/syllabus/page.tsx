// ===== ISTQB CTFL v4.0.1 — Syllabus Page (Chapter List) =====

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Chapter } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useISTQBStore } from '@/store/useISTQBStore';
import { BookOpen, Clock, ArrowRight, Lock, CheckCircle2, PlayCircle, ListChecks } from 'lucide-react';

const chapterColors: Record<string, string> = {
  ch1: 'from-indigo-500 to-indigo-600',
  ch2: 'from-violet-500 to-violet-600',
  ch3: 'from-blue-500 to-blue-600',
  ch4: 'from-emerald-500 to-emerald-600',
  ch5: 'from-amber-500 to-amber-600',
  ch6: 'from-rose-500 to-rose-600',
};

function getStatusInfo(status: string) {
  switch (status) {
    case 'completed':
      return { label: 'Terminé', icon: CheckCircle2, variant: 'success' as const };
    case 'in_progress':
      return { label: 'En cours', icon: PlayCircle, variant: 'warning' as const };
    case 'available':
      return { label: 'Disponible', icon: BookOpen, variant: 'secondary' as const };
    default:
      return { label: 'Verrouillé', icon: Lock, variant: 'outline' as const };
  }
}

export default function SyllabusPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const progressChapters = useISTQBStore((s) => s.progressChapters);

  useEffect(() => {
    async function load() {
      try {
        const data = await import('@/data/seed/chapters.json');
        setChapters(data.default as Chapter[]);
      } catch (e) {
        console.error('Failed to load chapters:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const sorted = [...chapters].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Syllabus CTFL v4.0.1
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          6 chapitres · {sorted.reduce((sum, ch) => sum + ch.learningObjectives.length, 0)} objectifs d&apos;apprentissage
        </p>
      </div>

      {/* Chapter Grid */}
      <div className="grid gap-5">
        {sorted.map((chapter) => {
          const progress = progressChapters.find((pc) => pc.chapterId === chapter.id);
          const mastery = progress?.masteryScore ?? 0;
          const lessonsCount = chapter.sections.reduce((sum, s) => sum + s.lessons.length, 0);
          const statusInfo = getStatusInfo(progress?.status ?? 'not_started');
          const StatusIcon = statusInfo.icon;
          const loCount = chapter.learningObjectives.length;

          return (
            <Link key={chapter.id} href={`/syllabus/${chapter.slug}`} className="group block">
              <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Chapter info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${chapterColors[chapter.id] ?? 'from-slate-500 to-slate-600'} text-white text-sm font-bold shadow-sm`}
                        >
                          {chapter.order}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-50 dark:group-hover:text-indigo-400 transition-colors">
                              {chapter.titleFr}
                            </h2>
                            <Badge variant={statusInfo.variant as any}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                            {chapter.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="flex shrink-0 flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400 sm:flex-col sm:items-end sm:gap-1">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {chapter.durationMinutes} min
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ListChecks className="h-3.5 w-3.5" />
                        {loCount} LO
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {lessonsCount} leçons
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      <span>Progression</span>
                      <span>{mastery}%</span>
                    </div>
                    <Progress value={mastery} />
                  </div>

                  {/* Keywords */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {chapter.keywords.slice(0, 4).map((kw) => (
                      <Badge key={kw} variant="secondary" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                    {chapter.keywords.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{chapter.keywords.length - 4}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <Button asChild size="lg">
          <Link href="/quiz">
            Tester mes connaissances <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
