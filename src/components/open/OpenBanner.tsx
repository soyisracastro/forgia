'use client';

import { useSyncExternalStore, useCallback } from 'react';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';
import { isOpenSeasonActive, OPEN_BANNER_DISMISS_KEY } from '@/lib/open-workouts';

function getSnapshot(): boolean {
  if (!isOpenSeasonActive()) return false;
  return !localStorage.getItem(OPEN_BANNER_DISMISS_KEY);
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

export default function OpenBanner() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const dismiss = useCallback(() => {
    localStorage.setItem(OPEN_BANNER_DISMISS_KEY, '1');
    window.dispatchEvent(new StorageEvent('storage', { key: OPEN_BANNER_DISMISS_KEY }));
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
      <div className="container mx-auto max-w-4xl px-4 py-3 flex items-center justify-between gap-3">
        <Link
          href="/app/open"
          className="flex items-center gap-2 text-sm font-semibold hover:underline underline-offset-2 min-w-0"
        >
          <span className="truncate">CrossFit Open 2026 — 26.1 ya disponible</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>
        <button
          onClick={dismiss}
          className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Cerrar banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
