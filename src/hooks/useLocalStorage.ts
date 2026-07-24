// ===== ISTQB CTFL v4.0.1 — useLocalStorage Custom Hook =====

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * A typed localStorage hook that syncs across browser tabs.
 *
 * Reads the stored value on mount (falling back to `initialValue` if the key
 * doesn't exist or JSON parsing fails). Listens for the `storage` event so
 * that changes made in other tabs are reflected automatically.
 *
 * @param key - localStorage key
 * @param initialValue - Fallback value when nothing is stored
 *
 * @returns A tuple [storedValue, setValue] — identical to useState in usage.
 *
 * @example
 * ```tsx
 * const [name, setName] = useLocalStorage('user-name', 'Candidat');
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  // Lazy initializer — reads from localStorage once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      // JSON parse failed or localStorage unavailable
      return initialValue;
    }
  });

  // Update localStorage and state whenever setValue is called
  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(
          `[useLocalStorage] Failed to set key "${key}":`,
          error,
        );
      }
    },
    [key],
  );

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return;

      if (event.newValue === null) {
        // Key was removed — revert to initial value
        setStoredValue(initialValue);
      } else {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
}
