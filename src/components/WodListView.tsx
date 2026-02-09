'use client';

import { useState } from 'react';
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

// --- SVG Icons ---

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 shrink-0">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 rotate-180 transition-transform duration-300 shrink-0">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const StickyNoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 shrink-0 mt-0.5">
    <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
    <path d="M15 3v4a2 2 0 0 0 2 2h4" />
  </svg>
);

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    <path d="M20 3v4"/><path d="M22 5h-4"/>
  </svg>
);

// --- Helpers ---

function formatDateBadge(iso: string): { month: string; day: string } {
  const d = new Date(iso);
  const month = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(d).replace('.', '').toUpperCase();
  const day = String(d.getDate()).padStart(2, '0');
  return { month, day };
}

function getMetconSummary(wod: SavedWod['wod']): string {
  const type = wod.metcon.type || '';
  const duration = wod.metcon.duration || '';
  if (type && duration) {
    const numMatch = duration.match(/(\d+)/);
    return numMatch ? `${type} ${numMatch[1]}` : type;
  }
  return type || 'WOD';
}

function getMovementsSummary(wod: SavedWod['wod']): string {
  const movements = wod.metcon.movements || wod.metcon.parts || wod.metcon.details || [];
  if (movements.length === 0) return '';
  return movements.slice(0, 3).map(m => {
    const match = m.match(/^\d+[\s\w]*?\s+(.+)$/);
    return match ? match[1] : m;
  }).join(', ');
}

// --- Main Component ---

export default function WodListView({
  savedWods,
  feedbackMap,
  loadingFeedback,
  expandedId,
  onExpand,
  onDelete,
  onAnalysisComplete,
}: WodListViewProps) {
  const [showWodDetail, setShowWodDetail] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {savedWods.map((saved) => {
        const feedback = feedbackMap[saved.id];
        const hasFeedback = feedback !== undefined && feedback !== null;
        const isExpanded = expandedId === saved.id;
        const { month, day } = formatDateBadge(saved.created_at);
        const metconSummary = getMetconSummary(saved.wod);

        return (
          <div
            key={saved.id}
            className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-all duration-300 ${
              isExpanded ? 'shadow-lg' : 'hover:border-neutral-300 dark:hover:border-neutral-600'
            } ${!isExpanded ? 'print:hidden' : ''}`}
          >
            {/* Header row */}
            <button
              data-print-hide
              onClick={() => onExpand(saved.id)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex gap-4 items-center">
                {/* Date badge */}
                <div className={`flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg shrink-0 border border-neutral-200 dark:border-neutral-700 ${
                  isExpanded ? 'w-14 h-14' : 'w-12 h-12'
                }`}>
                  <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">{month}</span>
                  <span className={`font-bold text-neutral-900 dark:text-white ${isExpanded ? 'text-xl' : 'text-lg'}`}>{day}</span>
                </div>
                {/* Content */}
                <div className="flex flex-col gap-1">
                  <h3 className={`font-bold text-neutral-900 dark:text-white leading-tight ${isExpanded ? 'text-lg' : 'text-base'}`}>
                    {saved.wod.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isExpanded ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-red-500" />
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">WOD</span>
                        </div>
                        <span className="text-xs text-neutral-300 dark:text-neutral-600">&bull;</span>
                        {hasFeedback && (
                          <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Feedback</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{metconSummary}</span>
                        <span className="size-1.5 rounded-full bg-red-500" />
                        {hasFeedback && <span className="size-1.5 rounded-full bg-emerald-500" />}
                      </>
                    )}
                  </div>
                </div>
              </div>
              {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="grid gap-4 py-4">
                  {/* Workout details */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{metconSummary}</span>
                      {hasFeedback && (
                        <span className="text-xs font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                          {feedback.rx_or_scaled.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {(() => {
                      const movements = getMovementsSummary(saved.wod);
                      return movements ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{movements}</p>
                      ) : null;
                    })()}
                  </div>

                  {/* Stats grid */}
                  {hasFeedback && (
                    <div className="grid grid-cols-3 gap-0 bg-neutral-100 dark:bg-neutral-800/60 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700">
                      <div className="flex flex-col items-center justify-center border-r border-neutral-200 dark:border-neutral-700">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Dificultad</span>
                        <span className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">{feedback.difficulty_rating}/10</span>
                      </div>
                      <div className="flex flex-col items-center justify-center border-r border-neutral-200 dark:border-neutral-700">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Tiempo</span>
                        <span className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                          {feedback.total_time_minutes ? `${feedback.total_time_minutes} min` : '—'}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Modalidad</span>
                        <span className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">{feedback.rx_or_scaled}</span>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {hasFeedback && feedback.notes && (
                    <div className="flex gap-2">
                      <StickyNoteIcon />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">&ldquo;{feedback.notes}&rdquo;</p>
                    </div>
                  )}

                  {/* Action: Ver Análisis IA */}
                  {hasFeedback && (
                    <button
                      onClick={() => setShowAnalysis(showAnalysis === saved.id ? null : saved.id)}
                      className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors group"
                    >
                      <SparklesIcon className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold">
                        {showAnalysis === saved.id ? 'Ocultar Análisis' : 'Ver Análisis IA'}
                      </span>
                    </button>
                  )}

                  {/* WorkoutAnalysis (toggled) */}
                  {showAnalysis === saved.id && hasFeedback && (
                    <WorkoutAnalysis
                      feedback={feedback}
                      onAnalysisComplete={(analysis) => onAnalysisComplete(saved.id, analysis)}
                    />
                  )}

                  {/* Ver WOD completo */}
                  <button
                    onClick={() => setShowWodDetail(showWodDetail === saved.id ? null : saved.id)}
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium transition-colors text-center"
                  >
                    {showWodDetail === saved.id ? 'Ocultar WOD' : 'Ver WOD completo'}
                  </button>

                  {showWodDetail === saved.id && (
                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                      <p className="hidden print:block print-date text-center text-sm text-neutral-500 mb-4">
                        {new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(saved.created_at))}
                      </p>
                      <WodDisplay wod={saved.wod} />
                    </div>
                  )}

                  {/* Utility actions */}
                  <div data-print-hide className="flex flex-wrap justify-center items-center gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <CopyWodButton wod={saved.wod} />
                    <PrintWodButton />
                    <button
                      onClick={() => onDelete(saved.id)}
                      className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Loading feedback spinner */}
                {loadingFeedback[saved.id] && (
                  <div data-print-hide className="flex justify-center py-2">
                    <Spinner />
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
