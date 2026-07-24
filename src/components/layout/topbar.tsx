// ===== ISTQB CTFL v4.0.1 — Top Bar =====

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronRight, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';

interface TopbarProps {
  onMenuToggle: () => void;
  /** Optional page title override (defaults to breadcrumb-derived) */
  pageTitle?: string;
  /** Optional exam timer in seconds (null/undefined = hidden) */
  examTimeRemaining?: number | null;
}

/** Breadcrumb segments derived from pathname */
function useBreadcrumbs() {
  const pathname = usePathname();

  const segmentMap: Record<string, string> = {
    dashboard: 'Tableau de bord',
    syllabus: 'Syllabus',
    glossary: 'Glossaire',
    quiz: 'Quiz',
    exam: 'Examen blanc',
    flashcards: 'Flashcards',
    'study-plan': "Plan d'étude",
    stats: 'Statistiques',
    resources: 'Ressources',
  };

  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    // Decode URL-encoded segments (e.g. slug titles)
    const decoded = decodeURIComponent(seg);
    const label = segmentMap[seg] ?? decoded;
    const href = '/' + segments.slice(0, i + 1).join('/');
    const isLast = i === segments.length - 1;
    return { label, href, isLast };
  });

  return crumbs;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Topbar({
  onMenuToggle,
  pageTitle,
  examTimeRemaining,
}: TopbarProps) {
  const crumbs = useBreadcrumbs();
  const displayTitle =
    pageTitle ?? crumbs.length > 0 ? crumbs[crumbs.length - 1]?.label : '';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        {crumbs.length > 0 && (
          <nav
            aria-label="Fil d'Ariane"
            className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 min-w-0"
          >
            {crumbs.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
                {!crumb.isLast ? (
                  <>
                    <Link
                      href={crumb.href}
                      className="truncate hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  </>
                ) : (
                  <span className="truncate font-medium text-slate-900 dark:text-slate-100">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Page title (mobile) */}
        <span className="text-base font-semibold truncate sm:hidden">
          {displayTitle ?? 'ISTQB CTFL'}
        </span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {/* Exam timer */}
        {examTimeRemaining !== null && examTimeRemaining !== undefined && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <Timer className="h-4 w-4" />
            <span className="tabular-nums">{formatTime(examTimeRemaining)}</span>
          </div>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}
