// ===== ISTQB CTFL v4.0.1 — Flashcards Page =====

'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Flashcard as FlashcardType, Chapter } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useISTQBStore } from '@/store/useISTQBStore';
import { calcNextReview } from '@/utils/spaced-repetition';
import { generateId } from '@/lib/utils';
import {
  RotateCcw, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight,
  BookOpen, Brain, AlertTriangle, Lightbulb, BarChart3, RefreshCw
} from 'lucide-react';

type ReviewResult = 'again' | 'hard' | 'good' | 'easy';

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string | 'all'>('all');
  const [reviewMode, setReviewMode] = useState<'all' | 'due'>('all');

  const addFlashcardReview = useISTQBStore((s) => s.addFlashcardReview);
  const flashcardReviews = useISTQBStore((s) => s.flashcardReviews);

  useEffect(() => {
    async function load() {
      try {
        const [fcData, chData] = await Promise.all([
          import('@/data/seed/flashcards.json'),
          import('@/data/seed/chapters.json'),
        ]);
        setFlashcards(fcData.default as FlashcardType[]);
        setChapters(chData.default as Chapter[]);
      } catch (e) {
        console.error('Failed to load flashcards:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter flashcards
  const filtered = useMemo(() => {
    let result = [...flashcards];
    if (selectedChapter !== 'all') {
      result = result.filter((fc) => fc.chapterId === selectedChapter);
    }
    if (reviewMode === 'due') {
      const now = new Date();
      result = result.filter((fc) => {
        if (!fc.nextReviewAt) return true;
        return new Date(fc.nextReviewAt) <= now;
      });
    }
    return result;
  }, [flashcards, selectedChapter, reviewMode]);

  const currentCard = filtered[currentIndex];

  function handleFlip() {
    setFlipped((prev) => !prev);
  }

  function handleReview(result: ReviewResult) {
    if (!currentCard) return;

    const { intervalDays, nextReviewAt, newStreak } = calcNextReview(
      result,
      currentCard.intervalDays,
      currentCard.correctStreak
    );

    // Store the review
    addFlashcardReview({
      id: generateId(),
      flashcardId: currentCard.id,
      userId: 'local',
      result,
      reviewedAt: new Date().toISOString(),
    });

    // Update local card state
    setFlashcards((prev) =>
      prev.map((fc) =>
        fc.id === currentCard.id
          ? {
              ...fc,
              intervalDays,
              nextReviewAt,
              correctStreak: newStreak,
              reviewCount: fc.reviewCount + 1,
            }
          : fc
      )
    );

    // Move to next card
    goNext();
  }

  function goNext() {
    if (currentIndex < filtered.length - 1) {
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setFlipped(false);
    }
  }

  const chapterNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const ch of chapters) map.set(ch.id, ch.titleFr);
    return map;
  }, [chapters]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const diffColors: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Flashcards</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {flashcards.length} cartes · Répétition espacée
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => setReviewMode('all')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              reviewMode === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Toutes ({flashcards.length})
          </button>
          <button
            onClick={() => setReviewMode('due')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              reviewMode === 'due'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            À réviser
          </button>
        </div>

        <select
          value={selectedChapter}
          onChange={(e) => { setSelectedChapter(e.target.value); setCurrentIndex(0); setFlipped(false); }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="all">Tous les chapitres</option>
          {chapters.sort((a, b) => a.order - b.order).map((ch) => (
            <option key={ch.id} value={ch.id}>
              Ch. {ch.order} - {ch.titleFr}
            </option>
          ))}
        </select>
      </div>

      {/* Count */}
      <div className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Carte {filtered.length > 0 ? currentIndex + 1 : 0}/{filtered.length}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <Brain className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Aucune carte à réviser
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {reviewMode === 'due'
                ? 'Toutes les cartes sont à jour. Revenez plus tard !'
                : 'Aucune flashcard disponible pour ce filtre.'}
            </p>
            {reviewMode === 'due' && (
              <Button variant="outline" className="mt-4" onClick={() => setReviewMode('all')}>
                Voir toutes les cartes
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Card */}
          <div className="mb-6 perspective-1000" style={{ perspective: '1000px' }}>
            <div
              className={`relative min-h-[300px] cursor-pointer transition-all duration-500 ${
                flipped ? 'rotate-y-180' : ''
              }`}
              style={{ transformStyle: 'preserve-3d' }}
              onClick={handleFlip}
            >
              {/* Front */}
              <Card
                className={`absolute inset-0 backface-hidden border-2 border-indigo-200 dark:border-indigo-800 ${
                  !flipped ? 'z-10' : 'z-0'
                }`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 min-h-[300px]">
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {chapterNames.get(currentCard.chapterId) ?? `Ch. ${currentCard.chapterId}`}
                    </Badge>
                    <Badge className={`text-xs ${diffColors[currentCard.difficulty]}`}>
                      {currentCard.difficulty === 'easy' ? 'Facile' : currentCard.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                    </Badge>
                  </div>
                  <p className="text-center text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {currentCard.front}
                  </p>
                  <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
                    Cliquez pour voir la réponse
                  </p>
                  {currentCard.hint && (
                    <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                      <Lightbulb className="h-3.5 w-3.5" />
                      {currentCard.hint}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Back */}
              <Card
                className={`absolute inset-0 backface-hidden rotate-y-180 border-2 border-emerald-200 dark:border-emerald-800 ${
                  flipped ? 'z-10' : 'z-0'
                }`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 min-h-[300px]">
                  <Badge className="mb-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Réponse
                  </Badge>
                  <p className="text-center text-base text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {currentCard.back}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Review buttons (only shown when flipped) */}
          {flipped && (
            <div className="mb-6">
              <p className="mb-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                Comment avez-vous trouvé cette carte ?
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleReview('again')}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
                >
                  <ThumbsDown className="mx-auto mb-1 h-4 w-4" />
                  Encore
                </button>
                <button
                  onClick={() => handleReview('hard')}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
                >
                  <RotateCcw className="mx-auto mb-1 h-4 w-4" />
                  Difficile
                </button>
                <button
                  onClick={() => handleReview('good')}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                >
                  <ThumbsUp className="mx-auto mb-1 h-4 w-4" />
                  Bien
                </button>
                <button
                  onClick={() => handleReview('easy')}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                >
                  <ThumbsUp className="mx-auto mb-1 h-4 w-4" />
                  Facile
                </button>
              </div>
            </div>
          )}

          {/* Navigation (only after flip) */}
          {flipped && (
            <>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Précédente
                </Button>
                <div className="flex items-center gap-1">
                  {(() => {
                    const total = filtered.length;
                    const cur = currentIndex;
                    const maxDots = 7;
                    if (total <= maxDots) {
                      return filtered.map((_, i) => (
                        <button key={i} onClick={() => { setCurrentIndex(i); setFlipped(false); }}
                          className={`h-2 w-2 rounded-full transition-colors ${i === cur ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      ));
                    }
                    const pages: (number | 'start' | 'end')[] = [];
                    const half = Math.floor((maxDots - 1) / 2);
                    let left = Math.max(0, cur - half);
                    let right = Math.min(total - 1, cur + half);
                    if (cur - half <= 0) { left = 0; right = maxDots - 1; }
                    if (cur + half >= total - 1) { left = total - maxDots; right = total - 1; }
                    if (left > 0) pages.push('start');
                    for (let i = left; i <= right; i++) pages.push(i);
                    if (right < total - 1) pages.push('end');
                    return pages.map((p, idx) => {
                      if (p === 'start') return <span key="s" className="text-xs text-slate-400 dark:text-slate-500 px-0.5">...</span>;
                      if (p === 'end') return <span key="e" className="text-xs text-slate-400 dark:text-slate-500 px-0.5">...</span>;
                      return (
                        <button key={idx} onClick={() => { setCurrentIndex(p as number); setFlipped(false); }}
                          className={`h-2 w-2 rounded-full transition-colors ${p === cur ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      );
                    });
                  })()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goNext}
                  disabled={currentIndex >= filtered.length - 1}
                >
                  Suivante
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50">{currentCard.reviewCount}</p>
                    <p className="text-slate-500 dark:text-slate-400">Révisions</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50">{currentCard.correctStreak}</p>
                    <p className="text-slate-500 dark:text-slate-400">Série</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50">{currentCard.intervalDays}j</p>
                    <p className="text-slate-500 dark:text-slate-400">Intervalle</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Global stats */}
      <div className="mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Progression globale
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {flashcardReviews.length} révision{flashcardReviews.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Progress value={Math.min((flashcardReviews.length / Math.max(flashcards.length, 1)) * 100, 100)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
