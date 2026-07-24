// ===== ISTQB CTFL v4.0.1 — Utility Functions =====

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Merge Tailwind CSS class names, resolving conflicts via tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string or Date into a human-readable French locale string.
 * @param date - ISO string, timestamp number, or Date object
 * @param fmt - date-fns format pattern (default: 'dd MMM yyyy')
 */
export function formatDate(
  date: string | number | Date,
  fmt: string = 'dd MMM yyyy'
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return format(d, fmt, { locale: fr });
}

/**
 * Format a date as a relative time string in French ("il y a 3 jours").
 */
export function formatRelativeTime(date: string | number | Date): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

/**
 * Generate a cryptographically random ID string.
 * Uses crypto.randomUUID() when available, falls back to Math.random.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Secure fallback using crypto.getRandomValues
  const arr = new Uint32Array(4);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => n.toString(36)).join('');
}

/**
 * Shuffle an array in-place using the Fisher-Yates algorithm.
 * Returns the same array reference (mutates original).
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Shuffle an array immutably — returns a new shuffled copy.
 */
export function shuffleArrayCopy<T>(array: T[]): T[] {
  const copy = [...array];
  return shuffleArray(copy);
}

/**
 * Clamp a number between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Compute a percentage (0–100) from a part and a total.
 * Returns 0 if total is 0 to avoid division by zero.
 */
export function percentage(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Pick a random element from an array.
 * Returns undefined for empty arrays.
 */
export function randomPick<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Group an array of items by a key function.
 * Returns a Map of key → items[].
 */
export function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = map.get(key);
    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}
