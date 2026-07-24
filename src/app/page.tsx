// ===== ISTQB CTFL v4.0.1 — Landing Page (Accueil) =====

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BookOpen,
  HelpCircle,
  FileText,
  BarChart3,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  GraduationCap,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const chapterColors: Record<string, string> = {
  ch1: 'from-indigo-500 to-indigo-600',
  ch2: 'from-violet-500 to-violet-600',
  ch3: 'from-blue-500 to-blue-600',
  ch4: 'from-emerald-500 to-emerald-600',
  ch5: 'from-amber-500 to-amber-600',
  ch6: 'from-rose-500 to-rose-600',
};

// ── Exam Format ───────────────────────────────
const examStats = [
  { label: 'Questions', value: '40', icon: HelpCircle },
  { label: 'Durée', value: '60 min', icon: Clock },
  { label: 'Score de réussite', value: '65 % (26/40)', icon: Target },
  { label: 'Niveaux K', value: 'K1, K2, K3', icon: GraduationCap },
];

const resources = [
  {
    title: 'Syllabus officiel',
    description: 'Téléchargez le syllabus ISTQB CTFL v4.0.1 complet.',
    href: '/resources',
    badge: 'PDF',
  },
  {
    title: 'Glossaire interactif',
    description: 'Plus de 200 termes avec définitions et flashcards.',
    href: '/glossary',
    badge: 'Flashcards',
  },
  {
    title: 'Examen blanc',
    description: 'Simulation complète de 40 questions en conditions réelles.',
    href: '/exam',
    badge: 'Simulation',
  },
  {
    title: "Plan d'étude personnalisé",
    description: "Générez un plan adapté à votre date d'examen.",
    href: '/study-plan',
    badge: 'Personnalisé',
  },
];

// ── Component ─────────────────────────────────
export default function LandingPage() {
  const [chapters, setChapters] = useState<{ id: string; order: number; titleFr: string; durationMinutes: number; slug: string; keywords: string[]; learningObjectives: any[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await import('@/data/seed/chapters.json');
        setChapters(data.default as any[]);
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ─── Hero ─────────────────────────── */}
      <section className="relative mb-16 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 px-6 py-16 text-white shadow-xl sm:px-12 sm:py-24 lg:px-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white hover:bg-white/30">
            ISTQB® CTFL v4.0.1
          </Badge>
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Préparez-vous à la{' '}
            <span className="text-indigo-200">certification ISTQB</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-indigo-100 sm:text-xl">
            Plateforme d&apos;entraînement interactive avec quiz, flashcards,
            examens blancs et suivi de progression personnalisé. Maîtrisez les
            14 objectifs pédagogiques du syllabus CTFL v4.0.1.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
              <Link href="/syllabus">
                Commencer l&apos;étude <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/quiz">Tester mes connaissances</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Chapter Cards ─────────────────── */}
      <section className="mb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              6 chapitres à maîtriser
            </h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Parcourez l&apos;intégralité du syllabus CTFL v4.0.1
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/syllabus">
              Voir tout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.sort((a, b) => a.order - b.order).map((ch) => (
            <Link key={ch.id} href={`/syllabus/${ch.slug}`} className="group block">
              <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                <CardHeader>
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${chapterColors[ch.id] ?? 'from-slate-500 to-slate-600'} text-white text-sm font-bold shadow-sm`}
                  >
                    {ch.order}
                  </div>
                  <CardTitle className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {ch.titleFr}
                  </CardTitle>
                  <CardDescription>
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {ch.durationMinutes} min
                    </span>
                    <span className="mx-2 text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs">{ch.learningObjectives.length} objectifs</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {ch.keywords.slice(0, 4).map((kw) => (
                      <Badge key={kw} variant="secondary" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Exam Format ───────────────────── */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Format de l&apos;examen
          </h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Ce qu&apos;il faut savoir pour le jour J
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {examStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-5 border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <CardContent className="flex items-start gap-3 p-5">
            <Award className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                Qu&apos;est-ce que la certification CTFL ?
              </p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                La certification ISTQB Certified Tester Foundation Level (CTFL) est la
                référence mondiale pour les professionnels du test logiciel. Elle valide
                votre maîtrise des fondamentaux : concepts, processus, techniques de
                conception et gestion des tests.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── Resources ─────────────────────── */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Ressources
          </h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Tout ce dont vous avez besoin pour réussir
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {resources.map((rsc) => (
            <Link key={rsc.title} href={rsc.href} className="group block">
              <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-50 dark:group-hover:text-indigo-400 transition-colors">
                      {rsc.title}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                      {rsc.description}
                    </p>
                  </div>
                  <Badge variant="default" className="shrink-0 ml-3">
                    {rsc.badge}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Footer CTA ────────────────────── */}
      <section className="mt-16 mb-8 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 dark:border-slate-700 dark:bg-slate-900">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-emerald-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Prêt à commencer ?
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Rejoignez les milliers de candidats qui se préparent avec nous.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/syllabus">Commencer maintenant</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Voir mon tableau de bord</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
