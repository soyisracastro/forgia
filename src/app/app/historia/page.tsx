'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { SavedWod, WorkoutFeedback, GeminiAnalysis } from '@/types/wod';
import { getWodHistory, deleteWod, getFeedbackForWod } from '@/lib/wods';
import SegmentedButton from '@/components/ui/SegmentedButton';
import WodListView from '@/components/WodListView';
import CalendarView from '@/components/CalendarView';
import Spinner from '@/components/Spinner';

type ViewMode = 'Lista' | 'Calendario';

export default function HistoriaPage() {
  const [savedWods, setSavedWods] = useState<SavedWod[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, WorkoutFeedback | null>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('Lista');

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

  const handleAnalysisComplete = useCallback((wodId: string, analysis: GeminiAnalysis) => {
    setFeedbackMap((prev) => ({
      ...prev,
      [wodId]: prev[wodId] ? { ...prev[wodId]!, gemini_analysis: analysis } : null,
    }));
  }, []);

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
        <>
          <div data-print-hide className="flex justify-center mb-6">
            <div className="w-full max-w-xs">
              <SegmentedButton
                options={['Lista', 'Calendario']}
                selected={viewMode}
                onSelect={(v) => setViewMode(v as ViewMode)}
              />
            </div>
          </div>

          {viewMode === 'Lista' ? (
            <WodListView
              savedWods={savedWods}
              feedbackMap={feedbackMap}
              loadingFeedback={loadingFeedback}
              expandedId={expandedId}
              onExpand={handleExpand}
              onDelete={handleDelete}
              onAnalysisComplete={handleAnalysisComplete}
            />
          ) : (
            <CalendarView
              savedWods={savedWods}
              feedbackMap={feedbackMap}
              loadingFeedback={loadingFeedback}
              expandedId={expandedId}
              onExpand={handleExpand}
              onDelete={handleDelete}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}
        </>
      )}
    </>
  );
}
