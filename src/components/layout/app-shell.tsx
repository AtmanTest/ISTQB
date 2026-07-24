// ===== ISTQB CTFL v4.0.1 — App Shell (Layout Wrapper) =====

'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

interface AppShellProps {
  children: ReactNode;
  /** Optional page title shown in the top bar breadcrumb area */
  pageTitle?: string;
  /** Optional exam timer override (seconds) — shown in top bar */
  examTimeRemaining?: number | null;
}

export function AppShell({
  children,
  pageTitle,
  examTimeRemaining,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          pageTitle={pageTitle}
          examTimeRemaining={examTimeRemaining}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
