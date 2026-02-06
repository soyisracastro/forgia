'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SavedWod } from '@/types/wod';
import WodDisplay from '@/components/WodDisplay';

export default function HistoriaPage() {
  const [savedWods, setSavedWods] = useState<SavedWod[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedWods');
      if (stored) {
        setSavedWods(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse saved WODs from localStorage', e);
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = savedWods.filter((s) => s.id !== id);
    setSavedWods(updated);
    localStorage.setItem('savedWods', JSON.stringify(updated));
  };

  const formatDate = (iso: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(iso));
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100">Historia</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Tus WODs guardados</p>
      </div>

      {savedWods.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-neutral-500 dark:text-neutral-400 mb-2">No hay WODs guardados</h3>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-6">
            Genera un WOD y guárdalo para verlo aquí.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Ir a Generar WOD
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedWods.map((saved) => (
            <div key={saved.id} className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === saved.id ? null : saved.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{saved.wod.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{formatDate(saved.savedAt)}</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-neutral-400 transition-transform duration-200 ${expandedId === saved.id ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedId === saved.id && (
                <div className="px-6 pb-6 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                  <WodDisplay wod={saved.wod} />
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => handleDelete(saved.id)}
                      className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Eliminar de historia
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
