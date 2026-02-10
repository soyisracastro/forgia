'use client';

import { useState, useEffect } from 'react';
import type { Wod, WorkoutFeedback, WorkoutFeedbackInput, RxOrScaled } from '@/types/wod';
import { saveFeedback } from '@/lib/wods';
import SegmentedButton from '@/components/ui/SegmentedButton';

interface WorkoutFeedbackFormProps {
  wod: Wod;
  wodId?: string | null;
  userId: string;
  onSaved: (feedback: WorkoutFeedback) => void;
  onClose: () => void;
  initialTotalTime?: number | null;
}

const difficultyLabels: Record<number, string> = {
  1: 'Muy fácil',
  2: 'Fácil',
  3: 'Fácil',
  4: 'Moderado',
  5: 'Moderado',
  6: 'Moderado',
  7: 'Difícil',
  8: 'Difícil',
  9: 'Brutal',
  10: 'Brutal',
};

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

export default function WorkoutFeedbackForm({ wod, wodId, userId, onSaved, onClose, initialTotalTime }: WorkoutFeedbackFormProps) {
  const [difficulty, setDifficulty] = useState(5);
  const [totalTime, setTotalTime] = useState(initialTotalTime ? String(Math.round(initialTotalTime)) : '');
  const [rxOrScaled, setRxOrScaled] = useState<RxOrScaled>('Rx');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const input: WorkoutFeedbackInput = {
        wod_id: wodId ?? null,
        wod_snapshot: wod,
        difficulty_rating: difficulty,
        total_time_minutes: totalTime ? parseInt(totalTime, 10) : null,
        rx_or_scaled: rxOrScaled,
        notes: notes.trim() || null,
      };

      const saved = await saveFeedback(userId, input);
      onSaved(saved);
    } catch (err) {
      console.error('Error saving feedback:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-6 shrink-0">
        <h2 className="text-lg font-bold text-white">Registrar Resultado</h2>
        <button
          type="button"
          onClick={onClose}
          className="size-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <XIcon />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-lg mx-auto w-full">
          {/* WOD title reference */}
          <p className="text-sm text-neutral-500 mb-6">{wod.title}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Difficulty slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-300">
                  Dificultad percibida
                </label>
                <span className="text-sm font-semibold text-red-500">
                  {difficulty}/10 — {difficultyLabels[difficulty]}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value, 10))}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Fácil</span>
                <span>Moderado</span>
                <span>Brutal</span>
              </div>
            </div>

            {/* Time + Rx/Scaled row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Tiempo total (min)
                </label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={totalTime}
                  onChange={(e) => setTotalTime(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Modalidad
                </label>
                <SegmentedButton
                  options={['Rx', 'Scaled']}
                  selected={rxOrScaled}
                  onSelect={(v) => setRxOrScaled(v as RxOrScaled)}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Me costaron mucho los pull-ups, tuve que escalar a ring rows..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 text-sm font-bold uppercase tracking-wider text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-neutral-950 disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Guardar Resultado'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
