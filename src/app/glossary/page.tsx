// ===== ISTQB CTFL v4.0.1 — Glossary Page =====

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { GlossaryTerm, Chapter } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, BookmarkPlus, BookmarkCheck, ChevronRight, X, AlertTriangle } from 'lucide-react';

export default function GlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [reviewedTerms, setReviewedTerms] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const [glossData, chData] = await Promise.all([
          import('@/data/seed/glossary.json'),
          import('@/data/seed/chapters.json'),
        ]);
        setTerms(glossData.default as GlossaryTerm[]);
        setChapters(chData.default as Chapter[]);
      } catch (e) {
        console.error('Failed to load glossary:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  // Get unique first letters
  const letters = useMemo(() => {
    const set = new Set<string>();
    for (const t of terms) {
      const first = (t.termFr ?? t.term).charAt(0).toUpperCase();
      if (/[A-ZÀ-Ü]/.test(first)) set.add(first);
    }
    return Array.from(set).sort();
  }, [terms]);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    let result = terms;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((t) =>
        (t.termFr ?? t.term).toLowerCase().includes(q) ||
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.synonyms.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (activeLetter) {
      result = result.filter((t) =>
        (t.termFr ?? t.term).charAt(0).toUpperCase() === activeLetter
      );
    }
    return result.sort((a, b) => (a.termFr ?? a.term).localeCompare(b.termFr ?? b.term));
  }, [terms, debouncedSearch, activeLetter]);

  const chapterMap = useMemo(() => {
    const map = new Map<string, Chapter>();
    for (const ch of chapters) map.set(ch.id, ch);
    return map;
  }, [chapters]);

  function toggleReview(termId: string) {
    setReviewedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(termId)) next.delete(termId);
      else next.add(termId);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Glossaire</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {terms.length} termes · Terminologie officielle ISTQB CTFL v4.0.1
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un terme, une définition ou un synonyme..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* A-Z filter */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveLetter(null)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            activeLetter === null
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
          }`}
        >
          Tous
        </button>
        {letters.map((letter) => (
          <button
            key={letter}
            onClick={() => setActiveLetter(activeLetter === letter ? null : letter)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeLetter === letter
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        {filteredTerms.length} terme{filteredTerms.length !== 1 ? 's' : ''} trouvé{filteredTerms.length !== 1 ? 's' : ''}
      </div>

      {/* Terms list */}
      {filteredTerms.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Aucun terme trouvé</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Essayez de modifier votre recherche ou de filtrer par lettre.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTerms.map((term) => (
            <Card key={term.id} className="transition-all hover:shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                        {term.termFr ?? term.term}
                      </h3>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        ({term.term})
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                      {term.definition}
                    </p>

                    {/* Synonyms */}
                    {term.synonyms.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-slate-400 dark:text-slate-500">Synonymes :</span>
                        {term.synonyms.map((syn) => (
                          <Badge key={syn} variant="secondary" className="text-xs">
                            {syn}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Related terms */}
                    {term.relatedTerms.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-slate-400 dark:text-slate-500">Liés :</span>
                        {term.relatedTerms.map((relId) => {
                          const rel = terms.find((t) => t.id === relId);
                          if (!rel) return null;
                          return (
                            <button
                              key={relId}
                              onClick={() => setSearch(rel.termFr ?? rel.term)}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                            >
                              {rel.termFr ?? rel.term}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Chapter links */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-slate-400" />
                      {term.chapterIds.map((chId) => {
                        const ch = chapterMap.get(chId);
                        if (!ch) return null;
                        return (
                          <Link
                            key={chId}
                            href={`/syllabus/${ch.slug}`}
                            className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            {ch.titleFr}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add to review button */}
                  <button
                    onClick={() => toggleReview(term.id)}
                    className={`shrink-0 rounded-lg p-2 transition-colors ${
                      reviewedTerms.has(term.id)
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                        : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400'
                    }`}
                    title={reviewedTerms.has(term.id) ? 'Retirer de la révision' : 'Ajouter à la révision'}
                  >
                    {reviewedTerms.has(term.id) ? (
                      <BookmarkCheck className="h-5 w-5" />
                    ) : (
                      <BookmarkPlus className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Count */}
      <div className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        {reviewedTerms.size} terme{reviewedTerms.size !== 1 ? 's' : ''} marqué{reviewedTerms.size !== 1 ? 's' : ''} pour révision
        {reviewedTerms.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-xs"
            onClick={() => setReviewedTerms(new Set())}
          >
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}
