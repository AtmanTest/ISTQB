// ===== ISTQB CTFL v4.0.1 — useMediaQuery Custom Hook =====

'use client';

import { useState, useEffect } from 'react';

/**
 * Reactive media query hook.
 *
 * Evaluates a CSS media query string and returns a boolean indicating
 * whether it currently matches. Automatically re-renders when the match
 * status changes (e.g., window resize, device orientation change).
 *
 * @param query - A CSS media query string (e.g., '(min-width: 768px)').
 *
 * @returns `true` if the document currently matches the query.
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 640px)');
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);

    // Update state if the initial check was wrong (SSR hydration mismatch)
    setMatches(mediaQueryList.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers support addEventListener; older ones use the deprecated
    // addListener. We handle both for compatibility.
    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', handleChange);
    } else {
      // Fallback for Safari < 14
      mediaQueryList.addListener(handleChange);
    }

    return () => {
      if (typeof mediaQueryList.removeEventListener === 'function') {
        mediaQueryList.removeEventListener('change', handleChange);
      } else {
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}
