// ===== ISTQB CTFL v4.0.1 — useTimer Custom Hook =====

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTimerReturn {
  /** Remaining time in seconds */
  timeRemaining: number;
  /** Remaining time formatted as "MM:SS" */
  formatted: string;
  /** Whether the timer is currently counting down */
  isRunning: boolean;
  /** Start (or restart) the timer from the given initial seconds */
  start: (seconds?: number) => void;
  /** Pause the timer without resetting */
  pause: () => void;
  /** Resume a paused timer */
  resume: () => void;
  /** Stop and reset the timer to the given seconds (defaults to initial) */
  reset: (seconds?: number) => void;
}

/**
 * Countdown timer hook.
 *
 * @param initialSeconds - Starting countdown value in seconds.
 * @param onExpire - Callback fired when the timer reaches 0.
 *
 * @returns An object with reactive timeRemaining, formatted string, and controls.
 *
 * @example
 * ```tsx
 * const { timeRemaining, formatted, isRunning, start, pause, resume, reset } =
 *   useTimer(300, () => console.log('Time is up!'));
 * ```
 */
export function useTimer(
  initialSeconds: number,
  onExpire?: () => void,
): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep the callback ref up to date without re-creating the interval
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Clear the interval helper
  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start the countdown
  const start = useCallback(
    (seconds?: number) => {
      clearTimer();
      const startFrom = seconds ?? initialSeconds;
      setTimeRemaining(startFrom);
      setIsRunning(true);
    },
    [clearTimer, initialSeconds],
  );

  // Pause without resetting elapsed time
  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  // Resume from current remaining time
  const resume = useCallback(() => {
    if (timeRemaining <= 0) return;
    setIsRunning(true);
  }, [timeRemaining]);

  // Reset to specified seconds (or initial) and stop
  const reset = useCallback(
    (seconds?: number) => {
      clearTimer();
      setTimeRemaining(seconds ?? initialSeconds);
      setIsRunning(false);
    },
    [clearTimer, initialSeconds],
  );

  // Main interval effect
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) {
      if (timeRemaining <= 0 && !isRunning) {
        // Guard against edge case where timer hits 0 while paused
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  // Format seconds as "MM:SS"
  const formatted = formatTime(timeRemaining);

  return {
    timeRemaining,
    formatted,
    isRunning,
    start,
    pause,
    resume,
    reset,
  };
}

/**
 * Format a number of seconds into "MM:SS" string.
 * Handles negative values by clamping to "00:00".
 */
function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
