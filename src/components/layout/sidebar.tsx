// ===== ISTQB CTFL v4.0.1 — Navigation Sidebar =====

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, PanelLeftOpen } from 'lucide-react';
import {
  Home,
  LayoutDashboard,
  BookOpen,
  BookText,
  HelpCircle,
  FileText,
  Layers,
  Calendar,
  BarChart3,
  Link2,
} from 'lucide-react';

/** Available in lucide-react */
const navItems = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/syllabus', label: 'Syllabus', icon: BookOpen },
  { href: '/glossary', label: 'Glossaire', icon: BookText },
  { href: '/quiz', label: 'Quiz', icon: HelpCircle },
  { href: '/exam', label: 'Examen blanc', icon: FileText },
  { href: '/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/study-plan', label: "Plan d'étude", icon: Calendar },
  { href: '/stats', label: 'Statistiques', icon: BarChart3 },
  { href: '/resources', label: 'Ressources', icon: Link2 },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-700">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-indigo-700 dark:text-indigo-400"
          onClick={onClose}
        >
          <BookOpen className="h-5 w-5" />
          <span>ISTQB CTFL</span>
        </Link>
        {/* Close button — visible on mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                data-state={isActive ? 'active' : 'inactive'}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  'data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700',
                  'dark:data-[state=active]:bg-indigo-950/50 dark:data-[state=active]:text-indigo-300',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ISTQB® CTFL v4.0.1
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 ease-in-out dark:border-slate-700 dark:bg-slate-900',
          'lg:static lg:z-auto lg:translate-x-0 lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar toggle button — floating just outside */}
      {!open && (
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          className="fixed left-2 top-3 z-30 hidden h-8 w-8 lg:inline-flex"
          aria-label="Ouvrir le menu"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
