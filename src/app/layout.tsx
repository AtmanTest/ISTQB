// ===== ISTQB CTFL v4.0.1 — Root Layout =====

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { AppShell } from '@/components/layout/app-shell';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ISTQB CTFL — Préparation à la certification',
    template: '%s | ISTQB CTFL',
  },
  description:
    "Plateforme d'entraînement interactive pour la certification ISTQB CTFL v4.0.1. Quiz, flashcards, examens blancs et suivi de progression.",
  keywords: [
    'ISTQB',
    'CTFL',
    'certification',
    'test',
    'logiciel',
    'préparation',
    'quiz',
    'examen',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent flash of unstyled dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('istqb-theme') || 'system';
                  var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (dark) document.documentElement.classList.add('dark');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground font-sans">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
