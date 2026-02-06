'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { SavedWod, WorkoutFeedback } from '@/types/wod';
import { getWodHistory, deleteWod, getFeedbackForWod } from '@/lib/wods';
import WodDisplay from '@/components/WodDisplay';
import CopyWodButton from '@/components/CopyWodButton';
import PrintWodButton from '@/components/PrintWodButton';
import WorkoutAnalysis from '@/components/WorkoutAnalysis';
import Spinner from '@/components/Spinner';

export default function HistoriaPage() {
  const [savedWods, setSavedWods] = useState<SavedWod[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, WorkoutFeedback | null>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getWodHistory();
        setSavedWods(data);
      } catch (e) {
        console.error('Error loading WOD history:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleExpand = useCallback(async (wodId: string) => {
    const isExpanding = expandedId !== wodId;
    setExpandedId(isExpanding ? wodId : null);

    // Lazy-load feedback when expanding
    if (isExpanding && !(wodId in feedbackMap)) {
      setLoadingFeedback((prev) => ({ ...prev, [wodId]: true }));
      try {
        const feedback = await getFeedbackForWod(wodId);
        setFeedbackMap((prev) => ({ ...prev, [wodId]: feedback }));
      } catch {
        setFeedbackMap((prev) => ({ ...prev, [wodId]: null }));
      } finally {
        setLoadingFeedback((prev) => ({ ...prev, [wodId]: false }));
      }
    }
  }, [expandedId, feedbackMap]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteWod(id);
      setSavedWods((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error('Error deleting WOD:', e);
    }
  }, []);

  const formatDate = (iso: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(iso));
  };

  return (
    <>
      <div data-print-hide className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100">Historia</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Tus WODs guardados</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : savedWods.length === 0 ? (
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
          {savedWods.map((saved) => {
            const feedback = feedbackMap[saved.id];
            const hasFeedback = feedback !== undefined && feedback !== null;

            return (
              <div
                key={saved.id}
                className={`border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden ${expandedId !== saved.id ? 'print:hidden' : ''}`}
              >
                <button
                  data-print-hide
                  onClick={() => handleExpand(saved.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {hasFeedback && (
                      <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-emerald-500" title="Tiene resultado registrado" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{saved.wod.title}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formatDate(saved.created_at)}
                        {hasFeedback && (
                          <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                            {feedback.difficulty_rating}/10 &middot; {feedback.rx_or_scaled}
                            {feedback.total_time_minutes ? ` &middot; ${feedback.total_time_minutes}min` : ''}
                          </span>
                        )}
                      </p>
                    </div>
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
                    <p className="hidden print:block print-date text-center text-sm text-neutral-500 mb-4">
                      {formatDate(saved.created_at)}
                    </p>
                    <WodDisplay wod={saved.wod} />
                    <div data-print-hide className="flex flex-wrap justify-center items-center gap-3 mt-6">
                      <CopyWodButton wod={saved.wod} />
                      <PrintWodButton />
                      <button
                        onClick={() => handleDelete(saved.id)}
                        className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                      >
                        Eliminar de historia
                      </button>
                    </div>

                    {/* Feedback summary */}
                    {loadingFeedback[saved.id] && (
                      <div data-print-hide className="mt-4 flex justify-center">
                        <Spinner />
                      </div>
                    )}

                    {hasFeedback && (
                      <div data-print-hide className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
                        <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Resultado Registrado</h4>
                        <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                          <span>Dificultad: <strong className="text-neutral-800 dark:text-neutral-200">{feedback.difficulty_rating}/10</strong></span>
                          <span>Modalidad: <strong className="text-neutral-800 dark:text-neutral-200">{feedback.rx_or_scaled}</strong></span>
                          {feedback.total_time_minutes && (
                            <span>Tiempo: <strong className="text-neutral-800 dark:text-neutral-200">{feedback.total_time_minutes} min</strong></span>
                          )}
                        </div>
                        {feedback.notes && (
                          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 italic">&ldquo;{feedback.notes}&rdquo;</p>
                        )}

                        {/* Analysis */}
                        <WorkoutAnalysis
                          feedback={feedback}
                          onAnalysisComplete={(analysis) => {
                            setFeedbackMap((prev) => ({
                              ...prev,
                              [saved.id]: prev[saved.id] ? { ...prev[saved.id]!, gemini_analysis: analysis } : null,
                            }));
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
