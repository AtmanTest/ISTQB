// ===== ISTQB CTFL v4.0.1 — Theme Toggle Button =====

'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/shared/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const next = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
  const label =
    mode === 'light'
      ? 'Passer en mode sombre'
      : mode === 'dark'
        ? 'Passer en mode système'
        : 'Passer en mode clair';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMode(next)}
      title={label}
      aria-label={label}
      className="relative"
    >
      {/* Sun — visible in light mode */}
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          mode === 'light'
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-0 rotate-90 opacity-0 absolute'
        }`}
      />
      {/* Moon — visible in dark mode */}
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          mode === 'dark'
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-0 rotate-90 opacity-0 absolute'
        }`}
      />
      {/* Monitor — visible in system mode */}
      <Monitor
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          mode === 'system'
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-0 rotate-90 opacity-0 absolute'
        }`}
      />
      <span className="sr-only">{label}</span>
    </Button>
  );
}
