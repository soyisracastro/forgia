'use client';

import { useState, useMemo } from 'react';
import type { WeightUnit } from '@/types/profile';
import { calculate1RM, calculatePercentages } from '@/lib/rm-calculator';
import { Calculator } from 'lucide-react';

interface RMCalculatorProps {
  weightUnit: WeightUnit;
  onSaveAsPR?: (value: number) => void;
}

export default function RMCalculator({ weightUnit, onSaveAsPR }: RMCalculatorProps) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const estimated1RM = useMemo(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (!w || !r || r < 1) return null;
    return calculate1RM(w, r);
  }, [weight, reps]);

  const percentages = useMemo(() => {
    if (!estimated1RM) return [];
    return calculatePercentages(estimated1RM);
  }, [estimated1RM]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 space-y-4">
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-neutral-400" />
        Calculadora de RM
      </h3>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Ingresa un peso y repeticiones para estimar tu 1RM (promedio Epley/Brzycki).
      </p>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            Peso ({weightUnit})
          </label>
          <input
            type="number"
            min={1}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="135"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            Reps
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="5"
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {estimated1RM && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg px-4 py-3">
            <div>
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">1RM Estimado</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {estimated1RM} {weightUnit}
              </p>
            </div>
            {onSaveAsPR && (
              <button
                type="button"
                onClick={() => onSaveAsPR(estimated1RM)}
                className="text-xs font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-300 border border-red-300 dark:border-red-500/40 rounded-lg px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                Guardar como PR
              </button>
            )}
          </div>

          {/* Percentage table */}
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="text-left px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">%</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">Peso ({weightUnit})</th>
                </tr>
              </thead>
              <tbody>
                {percentages.map(({ percent, weight: w }) => (
                  <tr
                    key={percent}
                    className="border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="px-3 py-1.5 text-neutral-700 dark:text-neutral-300">
                      {percent}%
                    </td>
                    <td className="px-3 py-1.5 text-right font-medium text-neutral-900 dark:text-neutral-100">
                      {w} {weightUnit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
