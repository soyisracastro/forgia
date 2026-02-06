'use client';

import type { SavedWod, WorkoutFeedback, GeminiAnalysis } from '@/types/wod';
import WodDisplay from '@/components/WodDisplay';
import CopyWodButton from '@/components/CopyWodButton';
import PrintWodButton from '@/components/PrintWodButton';
import WorkoutAnalysis from '@/components/WorkoutAnalysis';
import Spinner from '@/components/Spinner';

interface WodListViewProps {
  savedWods: SavedWod[];
  feedbackMap: Record<string, WorkoutFeedback | null>;
  loadingFeedback: Record<string, boolean>;
  expandedId: string | null;
  onExpand: (wodId: string) => void;
  onDelete: (id: string) => void;
  onAnalysisComplete: (wodId: string, analysis: GeminiAnalysis) => void;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export default function WodListView({
  savedWods,
  feedbackMap,
  loadingFeedback,
  expandedId,
  onExpand,
  onDelete,
  onAnalysisComplete,
}: WodListViewProps) {
  return (
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
              onClick={() => onExpand(saved.id)}
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
                        {feedback.total_time_minutes ? ` \u00b7 ${feedback.total_time_minutes}min` : ''}
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
                    onClick={() => onDelete(saved.id)}
                    className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    Eliminar de historia
                  </button>
                </div>

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

                    <WorkoutAnalysis
                      feedback={feedback}
                      onAnalysisComplete={(analysis) => onAnalysisComplete(saved.id, analysis)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
