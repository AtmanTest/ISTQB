// ===== ISTQB CTFL v4.0.1 — Theme Provider & Hook =====

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  /** Resolved theme — 'light' or 'dark' (after system preference fallback) */
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

const FALLBACK: ThemeContextValue = {
  mode: 'system',
  resolved: 'light',
  setMode: () => {},
  toggle: () => {},
};

export function ThemeProvider({
  children,
  defaultMode = 'system',
  storageKey = 'istqb-theme',
}: {
  children: ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
}) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Load stored preference on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as ThemeMode | null;
    const initial = stored ?? defaultMode;
    setModeState(initial);
    setResolved(resolveTheme(initial));
    setMounted(true);
  }, [storageKey, defaultMode]);

  // Persist and apply
  const applyTheme = useCallback(
    (newMode: ThemeMode) => {
      const r = resolveTheme(newMode);
      setModeState(newMode);
      setResolved(r);
      localStorage.setItem(storageKey, newMode);

      const root = document.documentElement;
      if (r === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    },
    [storageKey],
  );

  // Listen for system preference changes when in 'system' mode
  useEffect(() => {
    if (!mounted) return;
    if (mode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const r = getSystemTheme();
      setResolved(r);
      const root = document.documentElement;
      if (r === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode, mounted]);

  const toggle = useCallback(() => {
    if (mode === 'light') applyTheme('dark');
    else if (mode === 'dark') applyTheme('system');
    else applyTheme('light');
  }, [mode, applyTheme]);

  const setMode = useCallback(
    (newMode: ThemeMode) => applyTheme(newMode),
    [applyTheme],
  );

  const ctx: ThemeContextValue = { mode, resolved, setMode, toggle };

  // Always wrap in provider so children can safely call useTheme()
  // During SSR / pre-mount, hide content to prevent flash of wrong theme
  if (!mounted) {
    return (
      <ThemeContext.Provider value={ctx}>
        <div style={{ visibility: 'hidden' }} suppressHydrationWarning>
          {children}
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={ctx}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback during SSR - shouldn't happen with the fix above
    return FALLBACK;
  }
  return ctx;
}
