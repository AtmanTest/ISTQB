// ===== ISTQB CTFL v4.0.1 — Lesson Detail Page =====

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Chapter, Lesson, GlossaryTerm } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useISTQBStore } from '@/store/useISTQBStore';
import {
  ArrowLeft, ArrowRight, BookOpen, Clock, Lightbulb,
  AlertTriangle, FlaskConical, FileQuestion, GraduationCap,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';

export default function LessonDetailPage() {
  const params = useParams();
  const chapterSlug = params.chapterSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [glossaryMap, setGlossaryMap] = useState<Map<string, GlossaryTerm>>(new Map());
  const [loading, setLoading] = useState(true);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    term: string;
    definition: string;
  }>({ visible: false, x: 0, y: 0, term: '', definition: '' });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Mini quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const updateProgressChapter = useISTQBStore((s) => s.updateProgressChapter);

  // Build a term-name lookup (sorted longest-first for greedy matching)
  const [termNameMap, setTermNameMap] = useState<Map<string, GlossaryTerm>>(new Map());
  const [sortedTermNames, setSortedTermNames] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [chaptersData, glossaryData] = await Promise.all([
          import('@/data/seed/chapters.json'),
          import('@/data/seed/glossary.json'),
        ]);
        const chapters = chaptersData.default as Chapter[];
        const gloss = glossaryData.default as GlossaryTerm[];

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
            // Mark as in_progress
            updateProgressChapter(found.id, { status: 'in_progress' });
          }
        }

        // Build glossary map (id -> term)
        const map = new Map<string, GlossaryTerm>();
        // Build name lookup (term name -> term)
        const nameMap = new Map<string, GlossaryTerm>();
        for (const term of gloss) {
          map.set(term.id, term);
          // Index by the French term name (lowercased)
          const tName = (term.termFr || term.term).toLowerCase();
          nameMap.set(tName, term);
        }
        setGlossaryMap(map);
        setTermNameMap(nameMap);

        // Build sorted list of term names (longest first for greedy matching)
        const names = Array.from(nameMap.keys()).sort((a, b) => b.length - a.length);
        setSortedTermNames(names);
      } catch (e) {
        console.error('Failed to load lesson:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [chapterSlug, lessonSlug]);

  // Highlight glossary terms in a text string
  const highlightGlossaryTerms = useCallback((text: string): string => {
    if (!sortedTermNames.length) return text;

    // Escape special regex characters in term names
    let result = text;
    for (const tName of sortedTermNames) {
      const entry = termNameMap.get(tName);
      if (!entry) continue;

      // Build a regex that matches the term as a whole word (case-insensitive)
      const escaped = tName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match at word boundaries, being French-aware (accents and apostrophes)
      const regex = new RegExp(`(?<=^|[\\s,;:.!?\\-\\'"«»\\(\\[\\{]|&nbsp;)(${escaped})(?=$|[\\s,;:.!?\\-\\'"«»\\)\\]\\}]|&nbsp;)`, 'gi');
      result = result.replace(regex, (match) => {
        const def = entry.definitionFr || entry.definition;
        const escapedDef = def.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        return `<span class="glossary-term-link" data-term="${entry.termFr || entry.term}" data-definition="${escapedDef}" style="color: #4f46e5; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 2px; cursor: help; position: relative;">${match}</span>`;
      });
    }
    return result;
  }, [sortedTermNames, termNameMap]);

  // Tooltip handlers
  const handleTermMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('glossary-term-link')) {
      const term = target.getAttribute('data-term') || '';
      const definition = target.getAttribute('data-definition') || '';
      const rect = target.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
        term,
        definition,
      });
    }
  }, []);

  const handleTermMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  // Render markdown-like content as simple HTML with glossary tooltips
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
        // Also highlight terms in blockquotes
        const highlighted = highlightGlossaryTerms(trimmed.replace('> ', ''));
        const processed = highlighted
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`(.+?)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-rose-600 dark:bg-slate-800 dark:text-rose-400">$1</code>');
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
        const itemText = trimmed.replace(/^- /, '');
        const highlighted = highlightGlossaryTerms(itemText);
        const processed = highlighted
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`(.+?)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-rose-600 dark:bg-slate-800 dark:text-rose-400">$1</code>');
        listItems.push(processed);
        continue;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        if (!inList) { inList = true; orderedList = true; }
        const itemText = trimmed.replace(/^\d+\.\s/, '');
        const highlighted = highlightGlossaryTerms(itemText);
        const processed = highlighted
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`(.+?)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-rose-600 dark:bg-slate-800 dark:text-rose-400">$1</code>');
        listItems.push(processed);
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
      // First highlight glossary terms, then apply markdown
      const highlighted = highlightGlossaryTerms(trimmed);
      const processed = highlighted
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-rose-600 dark:bg-slate-800 dark:text-rose-400">$1</code>');
      elements.push(
        <p key={key++} className="mb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: processed }} />
      );
    }
    flushList();
    return elements;
  }

  function handleQuizSubmit(questionId: string, selectedId: string) {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: selectedId }));
    setQuizSubmitted((prev) => ({ ...prev, [questionId]: true }));
  }

  // Find prev/next lesson
  function findAdjacentLesson(direction: 'prev' | 'next'): { slug: string; chapterSlug: string } | null {
    if (!chapter) return null;
    const allLessons: Lesson[] = [];
    const lessonSlugMap = new Map<string, { slug: string; chapterSlug: string }>();
    for (const ch of [chapter]) {
      for (const section of ch.sections) {
        for (const l of section.lessons) {
          allLessons.push(l);
          lessonSlugMap.set(l.slug, { slug: l.slug, chapterSlug: ch.slug });
        }
      }
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

      {/* Content with glossary tooltips */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div
            className="prose-custom max-w-none"
            onMouseEnter={handleTermMouseEnter}
            onMouseMove={handleTermMouseEnter}
            onMouseLeave={handleTermMouseLeave}
          >
            {renderLessonContent(lesson.content)}
          </div>
        </CardContent>
      </Card>

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
          {/* Arrow */}
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-slate-800"
          />
        </div>
      )}

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

      {/* Glossary Terms — tooltip badges (no redirect) */}
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

      {/* Flashcards link */}
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/flashcards">
            <GraduationCap className="mr-1 h-4 w-4" />
            Voir les flashcards associées
          </Link>
        </Button>
      </div>

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
