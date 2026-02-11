'use client';

import { TRAINING_FREQUENCY_OPTIONS } from '@/lib/training-constants';
import { CircleCheck, Circle } from 'lucide-react';

interface Step4FrequencyProps {
  selectedFrequency: number | null;
  onChange: (frequency: number) => void;
}

export default function Step4Frequency({ selectedFrequency, onChange }: Step4FrequencyProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          ¿Cuántos días a la semana puedes entrenar?
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Esto nos ayuda a calibrar el volumen e intensidad de tus entrenamientos
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {TRAINING_FREQUENCY_OPTIONS.map(({ value, label, description }) => {
          const selected = selectedFrequency === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`flex items-center gap-4 text-left p-5 rounded-lg border transition-all duration-200 ${
                selected
                  ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <span className={`text-2xl font-bold tabular-nums ${selected ? 'text-red-500' : 'text-neutral-400 dark:text-neutral-500'}`}>
                {value}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className={`text-base font-semibold ${
                  selected ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'
                }`}>
                  {label}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {description}
                </p>
              </div>
              {selected ? (
                <CircleCheck className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
