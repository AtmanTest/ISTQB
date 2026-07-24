// ===== ISTQB CTFL v4.0.1 — Lesson Detail Page =====

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Chapter, Lesson, GlossaryTerm, Flashcard } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useISTQBStore } from '@/store/useISTQBStore';
import {
  ArrowLeft, ArrowRight, BookOpen, Clock, Lightbulb,
  AlertTriangle, FlaskConical, FileQuestion, GraduationCap,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, X
} from 'lucide-react';

export default function LessonDetailPage() {
  const params = useParams();
  const chapterSlug = params.chapterSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [glossaryMap, setGlossaryMap] = useState<Map<string, GlossaryTerm>>(new Map());
  const [loading, setLoading] = useState(true);

  // Tooltip state (Termes du glossaire only)
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    term: string;
    definition: string;
  }>({ visible: false, x: 0, y: 0, term: '', definition: '' });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Flashcards modal state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [fcModalOpen, setFcModalOpen] = useState(false);
  const [fcFlipped, setFcFlipped] = useState<Record<string, boolean>>({});
  const [fcIndex, setFcIndex] = useState(0);

  // Mini quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const updateProgressChapter = useISTQBStore((s) => s.updateProgressChapter);

  useEffect(() => {
    async function load() {
      try {
        const [chaptersData, glossaryData, flashcardsData] = await Promise.all([
          import('@/data/seed/chapters.json'),
          import('@/data/seed/glossary.json'),
          import('@/data/seed/flashcards.json'),
        ]);
        const chapters = chaptersData.default as Chapter[];
        const gloss = glossaryData.default as GlossaryTerm[];
        const fcs = flashcardsData.default as Flashcard[];

        const found = chapters.find((ch) => ch.slug === chapterSlug);
        if (found) {
          setChapter(found);
          let foundLesson: Lesson | null = null;
          for (const section of found.sections) {
            const l = section.lessons.find((ls) => ls.slug === lessonSlug);
            if (l) {
              foundLesson = l;
              break;
            }
          }
          if (foundLesson) {
            setLesson(foundLesson);
            updateProgressChapter(found.id, { status: 'in_progress' });
          }
        }

        // Build glossary map
        const map = new Map<string, GlossaryTerm>();
        for (const term of gloss) map.set(term.id, term);
        setGlossaryMap(map);

        // Filter flashcards for this chapter
        if (found) {
          setFlashcards(fcs.filter((fc) => fc.chapterId === found.id));
        }
      } catch (e) {
        console.error('Failed to load lesson:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [chapterSlug, lessonSlug]);

  // Render markdown-like content as simple HTML (no body glossary tooltips)
  function renderLessonContent(content: string) {
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    let inList = false;
    let listItems: string[] = [];
    let orderedList = false;
    let key = 0;

    function flushList() {
      if (listItems.length > 0) {
        if (orderedList) {
          elements.push(
            <ol key={key++} className="mb-4 ml-6 list-decimal space-y-1 text-sm text-slate-700 dark:text-slate-300">
              {listItems.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={key++} className="mb-4 ml-6 list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
              {listItems.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
        }
        listItems = [];
        inList = false;
      }
    }

    function applyMarkdown(text: string): string {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-rose-600 dark:bg-slate-800 dark:text-rose-400">$1</code>');
    }

    for (const line of lines) {
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={key++} className="mb-2 mt-5 text-base font-bold text-slate-900 dark:text-slate-50">
            {trimmed.replace('### ', '')}
          </h3>
        );
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={key++} className="mb-3 mt-6 text-lg font-bold text-slate-900 dark:text-slate-50">
            {trimmed.replace('## ', '')}
          </h2>
        );
        continue;
      }
      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={key++} className="mb-4 mt-6 text-xl font-bold text-slate-900 dark:text-slate-50">
            {trimmed.replace('# ', '')}
          </h1>
        );
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        flushList();
        const processed = applyMarkdown(trimmed.replace('> ', ''));
        elements.push(
          <blockquote key={key++} className="mb-3 border-l-4 border-indigo-400 bg-indigo-50 px-4 py-2 text-sm italic text-slate-700 dark:border-indigo-600 dark:bg-indigo-950/30 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: processed }} />
        );
        continue;
      }

      // Empty line
      if (trimmed === '') {
        flushList();
        continue;
      }

      // List items
      if (trimmed.startsWith('- ')) {
        if (!inList) { inList = true; orderedList = false; }
        listItems.push(applyMarkdown(trimmed.replace(/^- /, '')));
        continue;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        if (!inList) { inList = true; orderedList = true; }
        listItems.push(applyMarkdown(trimmed.replace(/^\d+\.\s/, '')));
        continue;
      }

      // Separator
      if (trimmed === '---') {
        flushList();
        elements.push(<hr key={key++} className="my-4 border-slate-200 dark:border-slate-700" />);
        continue;
      }

      // Paragraph
      flushList();
      elements.push(
        <p key={key++} className="mb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: applyMarkdown(trimmed) }} />
      );
    }
    flushList();
    return elements;
  }

  function handleQuizSubmit(questionId: string, selectedId: string) {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: selectedId }));
    setQuizSubmitted((prev) => ({ ...prev, [questionId]: true }));
  }

  function findAdjacentLesson(direction: 'prev' | 'next'): { slug: string; chapterSlug: string } | null {
    if (!chapter || !lesson) return null;
    const allLessons: Lesson[] = [];
    for (const section of chapter.sections) {
      for (const l of section.lessons) allLessons.push(l);
    }
    const idx = allLessons.findIndex((l) => l.slug === lessonSlug);
    if (idx === -1) return null;
    const targetIdx = direction === 'prev' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= allLessons.length) return null;
    const target = allLessons[targetIdx];
    return { slug: target.slug, chapterSlug: chapter.slug };
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!chapter || !lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Leçon introuvable</h2>
          <Button asChild className="mt-4">
            <Link href={`/syllabus/${chapterSlug}`}>Retour au chapitre</Link>
          </Button>
        </div>
      </div>
    );
  }

  const prevLesson = findAdjacentLesson('prev');
  const nextLesson = findAdjacentLesson('next');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <Link
        href={`/syllabus/${chapterSlug}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        {chapter.titleFr}
      </Link>

      {/* Title & meta */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{lesson.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {lesson.estimatedMinutes} min
          </span>
          <Badge variant="secondary" className="text-xs">{lesson.status}</Badge>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{lesson.objective}</p>
      </div>

      {/* Résumé mnémotechnique */}
      {lesson.summary && (
        <Card className="mb-6 border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                  Résumé mnémotechnique
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lesson.summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content (no glossary tooltips) */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="prose-custom max-w-none">
            {renderLessonContent(lesson.content)}
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      {lesson.examples.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-emerald-700 dark:text-emerald-400">
            <Lightbulb className="h-5 w-5" />
            Exemples
          </h2>
          <div className="space-y-4">
            {lesson.examples.map((ex) => (
              <Card key={ex.id} className="border-emerald-200 dark:border-emerald-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    {ex.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">{ex.scenario}</p>
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <strong>Explication :</strong> {ex.explanation}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Anti-Examples */}
      {lesson.antiExamples.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-rose-700 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            Anti-exemples
          </h2>
          <div className="space-y-4">
            {lesson.antiExamples.map((aex) => (
              <Card key={aex.id} className="border-rose-200 dark:border-rose-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                    {aex.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">{aex.scenario}</p>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                      <strong>Pourquoi c&apos;est faux :</strong> {aex.whyWrong}
                    </div>
                    <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      <strong>Approche correcte :</strong> {aex.correctApproach}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Exam Traps */}
      {lesson.examTraps.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-700 dark:text-amber-400">
            <FlaskConical className="h-5 w-5" />
            Pièges d&apos;examen
          </h2>
          <Card className="border-amber-200 dark:border-amber-900/50">
            <CardContent className="p-4">
              <ul className="space-y-2">
                {lesson.examTraps.map((trap, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                      !
                    </span>
                    {trap}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Glossary Terms — tooltip badges */}
      {lesson.glossaryTerms.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-indigo-700 dark:text-indigo-400">
            <BookOpen className="h-5 w-5" />
            Termes du glossaire
          </h2>
          <div className="flex flex-wrap gap-2">
            {lesson.glossaryTerms.map((termId) => {
              const term = glossaryMap.get(termId);
              if (!term) return null;
              return (
                <span
                  key={termId}
                  className="group relative inline-block"
                  onMouseEnter={(e) => {
                    const def = term.definitionFr || term.definition;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      visible: true,
                      x: rect.left + rect.width / 2,
                      y: rect.top - 8,
                      term: term.termFr ?? term.term,
                      definition: def,
                    });
                  }}
                  onMouseLeave={() => setTooltip((prev) => ({ ...prev, visible: false }))}
                >
                  <Badge variant="outline" className="cursor-pointer transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30">
                    {term.termFr ?? term.term}
                  </Badge>
                </span>
              );
            })}
          </div>
        </section>
      )}

      {/* Tooltip popup */}
      {tooltip.visible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 max-w-xs rounded-lg border border-indigo-200 bg-white px-4 py-3 shadow-lg dark:border-indigo-800 dark:bg-slate-800"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
          }}
        >
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            {tooltip.term}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {tooltip.definition}
          </div>
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-slate-800" />
        </div>
      )}

      {/* Mini Quiz */}
      {lesson.miniQuiz && lesson.miniQuiz.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-violet-700 dark:text-violet-400">
            <FileQuestion className="h-5 w-5" />
            Mini quiz
          </h2>
          <div className="space-y-4">
            {lesson.miniQuiz.map((q) => (
              <Card key={q.id}>
                <CardContent className="p-5">
                  <p className="mb-3 font-medium text-slate-900 dark:text-slate-50">{q.stem}</p>
                  <div className="space-y-2">
                    {q.choices.map((choice) => {
                      const isSelected = quizAnswers[q.id] === choice.id;
                      const isSubmitted = quizSubmitted[q.id];
                      let btnVariant: 'default' | 'destructive' | 'outline' = 'outline';
                      if (isSubmitted) {
                        if (choice.isCorrect) btnVariant = 'default';
                        else if (isSelected) btnVariant = 'destructive';
                      } else if (isSelected) {
                        btnVariant = 'default';
                      }

                      return (
                        <button
                          key={choice.id}
                          disabled={isSubmitted}
                          onClick={() => handleQuizSubmit(q.id, choice.id)}
                          className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                            isSubmitted && choice.isCorrect
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                              : isSubmitted && isSelected
                                ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
                                : isSelected
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="mr-2 font-mono text-xs">{choice.label}.</span>
                          {choice.text}
                          {isSubmitted && choice.isCorrect && (
                            <CheckCircle2 className="ml-2 inline h-4 w-4 text-emerald-500" />
                          )}
                          {isSubmitted && isSelected && !choice.isCorrect && (
                            <XCircle className="ml-2 inline h-4 w-4 text-rose-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted[q.id] && q.explanation && (
                    <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      <strong>Explication :</strong> {q.explanation.correctAnswerRationale}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Flashcards inline modal */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => {
            setFcIndex(0);
            setFcFlipped({});
            setFcModalOpen(true);
          }}
        >
          <GraduationCap className="mr-1 h-4 w-4" />
          Voir les flashcards associées
        </Button>
      </div>

      {/* Flashcards Modal */}
      {fcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <button
              onClick={() => setFcModalOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-50">
              Flashcards — {chapter?.titleFr}
            </h3>
            <p className="mb-4 text-xs text-slate-500">
              {fcIndex + 1} / {flashcards.length}
            </p>

            {flashcards.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Aucune flashcard pour ce chapitre.
              </p>
            ) : (
              <>
                <div
                  className="mb-4 min-h-[200px] cursor-pointer rounded-lg border-2 border-slate-200 p-6 transition-all hover:border-indigo-300 dark:border-slate-600 dark:hover:border-indigo-600"
                  onClick={() =>
                    setFcFlipped((prev) => ({
                      ...prev,
                      [flashcards[fcIndex].id]: !prev[flashcards[fcIndex].id],
                    }))
                  }
                >
                  {fcFlipped[flashcards[fcIndex].id] ? (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Réponse
                      </p>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                        {flashcards[fcIndex].back}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Question
                      </p>
                      <p className="text-sm leading-relaxed text-slate-900 dark:text-slate-50">
                        {flashcards[fcIndex].front}
                      </p>
                    </div>
                  )}
                </div>

                {flashcards[fcIndex].hint && (
                  <p className="mb-4 text-xs italic text-slate-400">
                    💡 {flashcards[fcIndex].hint}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={fcIndex === 0}
                    onClick={() => {
                      setFcIndex((i) => i - 1);
                      setFcFlipped((prev) => ({ ...prev, [flashcards[fcIndex - 1]?.id]: false }));
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  <span className="text-xs text-slate-500">
                    Cliquez sur la carte pour retourner
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={fcIndex === flashcards.length - 1}
                    onClick={() => {
                      setFcIndex((i) => i + 1);
                      setFcFlipped((prev) => ({ ...prev, [flashcards[fcIndex + 1]?.id]: false }));
                    }}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Prev/Next navigation */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700">
        <div>
          {prevLesson && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/syllabus/${prevLesson.chapterSlug}/${prevLesson.slug}`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Leçon précédente
              </Link>
            </Button>
          )}
        </div>
        <div>
          {nextLesson && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/syllabus/${nextLesson.chapterSlug}/${nextLesson.slug}`}>
                Leçon suivante
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
