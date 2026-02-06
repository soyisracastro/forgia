'use client';

import { useState } from 'react';
import type { Wod, WorkoutFeedback, WorkoutFeedbackInput, RxOrScaled } from '@/types/wod';
import { saveFeedback } from '@/lib/wods';
import SegmentedButton from '@/components/ui/SegmentedButton';

interface WorkoutFeedbackFormProps {
  wod: Wod;
  wodId?: string | null;
  userId: string;
  onSaved: (feedback: WorkoutFeedback) => void;
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

export default function WorkoutFeedbackForm({ wod, wodId, userId, onSaved }: WorkoutFeedbackFormProps) {
  const [difficulty, setDifficulty] = useState(5);
  const [totalTime, setTotalTime] = useState('');
  const [rxOrScaled, setRxOrScaled] = useState<RxOrScaled>('Rx');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || justSaved) return;

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
      setJustSaved(true);
      onSaved(saved);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      console.error('Error saving feedback:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in-up p-5 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-5"
    >
      <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
        Registrar Resultado
      </h3>

      {/* Difficulty slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
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
        <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          <span>Fácil</span>
          <span>Moderado</span>
          <span>Brutal</span>
        </div>
      </div>

      {/* Time + Rx/Scaled row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Tiempo total (min)
          </label>
          <input
            type="number"
            min={1}
            max={180}
            value={totalTime}
            onChange={(e) => setTotalTime(e.target.value)}
            placeholder="Opcional"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
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
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Me costaron mucho los pull-ups, tuve que escalar a ring rows..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          rows={2}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSaving || justSaved}
        className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900 disabled:opacity-60"
      >
        {justSaved ? 'Guardado!' : isSaving ? 'Guardando...' : 'Guardar Resultado'}
      </button>
    </form>
  );
}
