// ===== ISTQB CTFL v4.0.1 — Resources Page =====

'use client';

import { useState, useEffect } from 'react';
import type { ResourceLink } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ExternalLink, BookOpen, FileText, BookMarked,
  GraduationCap, Globe, Terminal, Scale,
  Award, Library, ChevronRight, ArrowUpRight,
  Download, ClipboardList
} from 'lucide-react';

// ── Type Icons ───────────────────────────────────────

const TYPE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  syllabus: { icon: BookOpen, label: 'Syllabus', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30' },
  sample_exam: { icon: FileText, label: 'Examen blanc', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' },
  glossary: { icon: BookMarked, label: 'Glossaire', color: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30' },
  guide: { icon: GraduationCap, label: 'Guide', color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30' },
  tool: { icon: Terminal, label: 'Outil', color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30' },
};

// ── Static community resources (not in seed data) ────

const COMMUNITY_RESOURCES: ResourceLink[] = [
  {
    id: 'res-community-gts-learning',
    title: 'GTS Learning — CTFL Preparation',
    url: 'https://www.gtslearning.com/',
    description: 'Fournisseur de formation agréé ISTQB proposant des cours officiels de préparation à la certification CTFL en ligne et en présentiel.',
    type: 'guide',
    category: 'community',
    chapterIds: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'],
    createdAt: '2026-01-01',
  },
  {
    id: 'res-community-astqb',
    title: 'ASTQB — American Software Testing Qualifications Board',
    url: 'https://www.astqb.org/',
    description: 'Comité national ISTQB pour les États-Unis. Propose des ressources, des examens blancs supplémentaires et des formations certifiées.',
    type: 'guide',
    category: 'community',
    chapterIds: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'],
    createdAt: '2026-01-01',
  },
  {
    id: 'res-community-software-testing-help',
    title: 'Software Testing Help — CTFL Study Material',
    url: 'https://www.softwaretestinghelp.com/istqb-certification-guide/',
    description: 'Guide d\'étude complet et gratuit avec des explications détaillées, des questions d\'entraînement et des conseils pour l\'examen CTFL.',
    type: 'guide',
    category: 'community',
    chapterIds: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'],
    createdAt: '2026-01-01',
  },
  {
    id: 'res-community-guru99',
    title: 'Guru99 — ISTQB CTFL Tutorial',
    url: 'https://www.guru99.com/istqb-ctfl-certification.html',
    description: 'Tutoriel gratuit couvrant tous les chapitres du syllabus CTFL avec des exemples pratiques et des quiz intégrés.',
    type: 'guide',
    category: 'community',
    chapterIds: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'],
    createdAt: '2026-01-01',
  },
  {
    id: 'res-community-exam-study',
    title: 'Exam Study — ISTQB CTFL Practice Tests',
    url: 'https://www.examstudy.com/istqb/ctfl',
    description: 'Tests d\'entraînement supplémentaires pour la certification CTFL avec des questions similaires à l\'examen réel.',
    type: 'sample_exam',
    category: 'community',
    chapterIds: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'],
    createdAt: '2026-01-01',
  },
  {
    id: 'res-community-reddit-istqb',
    title: 'r/istqb sur Reddit',
    url: 'https://www.reddit.com/r/istqb/',
    description: 'Communauté Reddit dédiée aux certifications ISTQB. Échangez conseils, retours d\'expérience et ressources avec d\'autres candidats.',
    type: 'guide',
    category: 'community',
    chapterIds: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'],
    createdAt: '2026-01-01',
  },
];

// ── Study Tips ───────────────────────────────────────

const STUDY_TIPS = [
  {
    icon: ClipboardList,
    title: 'Comprendre la structure de l\'examen',
    description: '40 questions à choix multiple, 60 minutes (75 min pour non-anglophones), seuil de réussite à 65% (26/40).',
  },
  {
    icon: Award,
    title: 'Connaître les pondérations',
    description: 'Chapitre 1 (18%), Chapitre 2 (13%), Chapitre 3 (8%), Chapitre 4 (39%), Chapitre 5 (18%), Chapitre 6 (4%).',
  },
  {
    icon: Scale,
    title: 'Maîtriser les niveaux K',
    description: 'K1 (mémorisation, ~20%), K2 (compréhension, ~55%), K3 (application, ~25%). Concentrez-vous sur K2 et K3.',
  },
  {
    icon: Download,
    title: 'Pratiquer avec les examens blancs',
    description: 'Les examens blancs officiels A, B, C et D sont vos meilleurs outils de préparation. Refaites-les à blanc.',
  },
];

// ── Component ────────────────────────────────────────

export default function ResourcesPage() {
  const [officialResources, setOfficialResources] = useState<ResourceLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await import('@/data/seed/resources.json');
        setOfficialResources(data.default as ResourceLink[]);
      } catch (e) {
        console.error('Failed to load resources:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Ressources
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Ressources officielles et communautaires pour préparer la certification ISTQB CTFL v4.0.1
        </p>
      </div>

      {/* Study Tips Banner */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STUDY_TIPS.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <Card key={i}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{tip.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{tip.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Official Resources */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <Library className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Ressources officielles ISTQB
          </h2>
        </div>

        {officialResources.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucune ressource officielle chargée.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {officialResources.map((res) => {
              const config = TYPE_CONFIG[res.type] ?? TYPE_CONFIG.guide;
              const Icon = config.icon;

              return (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800">
                    <CardContent className="flex h-full flex-col p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                          {res.type === 'sample_exam' ? 'Examen blanc' :
                           res.type === 'syllabus' ? 'Syllabus' :
                           res.type === 'glossary' ? 'Glossaire' :
                           res.type === 'guide' ? 'Guide' : res.type}
                        </Badge>
                      </div>

                      <h3 className="mb-1 text-sm font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-50 dark:group-hover:text-indigo-400 transition-colors">
                        {res.title}
                      </h3>

                      <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {res.description}
                      </p>

                      <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        <span>Accéder à la ressource</span>
                        <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* Community Resources */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Globe className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Ressources communautaires
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMMUNITY_RESOURCES.map((res) => {
            const config = TYPE_CONFIG[res.type] ?? TYPE_CONFIG.guide;
            const Icon = config.icon;

            return (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800">
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                        {res.category}
                      </Badge>
                    </div>

                    <h3 className="mb-1 text-sm font-semibold text-slate-900 group-hover:text-emerald-600 dark:text-slate-50 dark:group-hover:text-emerald-400 transition-colors">
                      {res.title}
                    </h3>

                    <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {res.description}
                    </p>

                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <span>Accéder à la ressource</span>
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ExternalLink className="h-4 w-4 text-indigo-500" />
              Liens rapides
            </CardTitle>
            <CardDescription>
              Accès directs aux documents clés pour votre préparation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="https://www.istqb.org/downloads/send/51-ctfl-401/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <BookOpen className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Syllabus CTFL v4.0.1</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Document officiel de référence</p>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
              </a>

              <a
                href="https://www.istqb.org/downloads/send/52-sample-exam-ctfl-401/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <FileText className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Examens blancs officiels</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">4 séries de 40 questions</p>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
              </a>

              <a
                href="https://www.istqb.org/glossary/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <BookMarked className="h-5 w-5 text-violet-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Glossaire ISTQB</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Terminologie officielle du test</p>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
              </a>

              <a
                href="https://www.istqb.org/certifications/certified-tester-foundation-level/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Award className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Page officielle CTFL</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Informations sur la certification</p>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
