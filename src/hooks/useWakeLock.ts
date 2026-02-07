'use client';

import { useRef, useCallback, useEffect } from 'react';

export function useWakeLock() {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      sentinelRef.current = await navigator.wakeLock.request('screen');
    } catch {
      // Wake Lock request failed (e.g., low battery)
    }
  }, []);

  const release = useCallback(() => {
    sentinelRef.current?.release();
    sentinelRef.current = null;
  }, []);

  // Re-acquire on tab visibility change (spec releases lock when backgrounded)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && sentinelRef.current?.released === false) {
        // Still held, no action needed
        return;
      }
      if (document.visibilityState === 'visible' && sentinelRef.current) {
        // Was released by the browser — re-acquire
        request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [request]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sentinelRef.current?.release();
      sentinelRef.current = null;
    };
  }, []);

  return { request, release };
}
