'use client';

import type { TrainingType } from '@/types/profile';

const TRAINING_OPTIONS: { value: TrainingType; title: string; description: string; icon: string }[] = [
  {
    value: 'CrossFit',
    title: 'CrossFit',
    description: 'Entrenamientos funcionales de alta intensidad con pesas, gimnasia y cardio.',
    icon: '🔥',
  },
  {
    value: 'Calistenia',
    title: 'Peso corporal (Calistenia)',
    description: 'Entrenamientos basados en el peso corporal y movimientos gimnásticos.',
    icon: '🤸',
  },
];

interface Step3Props {
  selectedType: TrainingType | null;
  onChange: (type: TrainingType) => void;
}

export default function Step3TrainingType({ selectedType, onChange }: Step3Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Elige tu tipo de entrenamiento principal
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TRAINING_OPTIONS.map(({ value, title, description, icon }) => {
          const selected = selectedType === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                selected
                  ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800'
              }`}
            >
              <span className="text-4xl">{icon}</span>
              <h3 className={`text-lg font-semibold mt-3 ${
                selected ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'
              }`}>
                {title}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
