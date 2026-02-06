'use client';

import { useState, useMemo } from 'react';
import type { SavedWod, WorkoutFeedback, GeminiAnalysis } from '@/types/wod';
import { groupWodsByDate, getCalendarDays, dateToKey, formatMonthYear, formatFullDate, DAY_NAMES_SHORT } from '@/lib/dateUtils';
import WodDisplay from '@/components/WodDisplay';
import CopyWodButton from '@/components/CopyWodButton';
import PrintWodButton from '@/components/PrintWodButton';
import WorkoutAnalysis from '@/components/WorkoutAnalysis';
import Spinner from '@/components/Spinner';

interface CalendarViewProps {
  savedWods: SavedWod[];
  feedbackMap: Record<string, WorkoutFeedback | null>;
  loadingFeedback: Record<string, boolean>;
  expandedId: string | null;
  onExpand: (wodId: string) => void;
  onDelete: (id: string) => void;
  onAnalysisComplete: (wodId: string, analysis: GeminiAnalysis) => void;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('es-ES', {
    timeStyle: 'short',
  }).format(new Date(iso));
}

export default function CalendarView({
  savedWods,
  feedbackMap,
  loadingFeedback,
  expandedId,
  onExpand,
  onDelete,
  onAnalysisComplete,
}: CalendarViewProps) {
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const wodsByDate = useMemo(() => groupWodsByDate(savedWods), [savedWods]);
  const calendarDays = useMemo(() => getCalendarDays(currentYear, currentMonth), [currentYear, currentMonth]);
  const todayKey = useMemo(() => dateToKey(new Date()), []);

  const selectedDayWods = useMemo(
    () => (selectedDateKey ? wodsByDate.get(selectedDateKey) ?? [] : []),
    [selectedDateKey, wodsByDate]
  );

  const wodsInMonth = useMemo(() => {
    let count = 0;
    for (const dayInfo of calendarDays) {
      if (dayInfo.isCurrentMonth) {
        const key = dateToKey(dayInfo.date);
        count += (wodsByDate.get(key) ?? []).length;
      }
    }
    return count;
  }, [calendarDays, wodsByDate]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDateKey(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDateKey(null);
  };

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-150"
          aria-label="Mes anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {formatMonthYear(currentYear, currentMonth)}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-150"
          aria-label="Mes siguiente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES_SHORT.map((name) => (
          <div key={name} className="text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, idx) => {
          const key = dateToKey(dayInfo.date);
          const dayWods = wodsByDate.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedDateKey;
          const hasWods = dayWods.length > 0;
          const hasFeedback = dayWods.some((w) => feedbackMap[w.id] != null);

          return (
            <button
              key={idx}
              onClick={() => hasWods && setSelectedDateKey(isSelected ? null : key)}
              disabled={!hasWods}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-lg
                text-sm transition-colors duration-150
                ${!dayInfo.isCurrentMonth ? 'text-neutral-300 dark:text-neutral-600' : ''}
                ${dayInfo.isCurrentMonth && !hasWods ? 'text-neutral-500 dark:text-neutral-400 cursor-default' : ''}
                ${hasWods ? 'cursor-pointer font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/50' : ''}
                ${isSelected ? 'bg-red-500/10 dark:bg-red-500/20 ring-2 ring-red-500' : ''}
                ${isToday && !isSelected ? 'bg-neutral-100 dark:bg-neutral-800/50' : ''}
              `}
            >
              <span>{dayInfo.date.getDate()}</span>
              {hasWods && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayWods.slice(0, 3).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  ))}
                  {dayWods.length > 3 && (
                    <span className="text-[9px] text-red-500 font-bold leading-none">+</span>
                  )}
                </div>
              )}
              {hasFeedback && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Monthly summary */}
      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        {wodsInMonth} {wodsInMonth === 1 ? 'entrenamiento' : 'entrenamientos'} este mes
      </p>

      {/* Day detail panel */}
      {selectedDateKey && selectedDayWods.length > 0 && (
        <div className="animate-fade-in-up space-y-3">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {formatFullDate(selectedDateKey)}
          </h3>

          {selectedDayWods.map((saved) => {
            const feedback = feedbackMap[saved.id];
            const hasFb = feedback !== undefined && feedback !== null;

            return (
              <div
                key={saved.id}
                className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => onExpand(saved.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {hasFb && (
                      <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-emerald-500" title="Tiene resultado registrado" />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{saved.wod.title}</h4>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formatTime(saved.created_at)}
                        {hasFb && (
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
                    <WodDisplay wod={saved.wod} />
                    <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
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
                      <div className="mt-4 flex justify-center">
                        <Spinner />
                      </div>
                    )}

                    {hasFb && (
                      <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
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
      )}
    </div>
  );
}
