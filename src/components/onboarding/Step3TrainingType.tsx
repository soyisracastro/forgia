'use client';

import type { TrainingType } from '@/types/profile';
import type { LucideIcon } from 'lucide-react';
import { Dumbbell, Activity, CircleCheck, Circle } from 'lucide-react';

const TRAINING_OPTIONS: { value: TrainingType; title: string; description: string; icon: LucideIcon }[] = [
  {
    value: 'CrossFit',
    title: 'CrossFit',
    description: 'Entrenamientos variados que combinan halterofilia, gimnásticos y cardio. Ideal si tienes acceso a un box o gimnasio equipado.',
    icon: Dumbbell,
  },
  {
    value: 'Calistenia',
    title: 'Calistenia',
    description: 'Entrenamientos basados en peso corporal. Perfecto si prefieres entrenar en casa, parques o con equipamiento mínimo.',
    icon: Activity,
  },
];

interface Step3Props {
  selectedType: TrainingType | null;
  onChange: (type: TrainingType) => void;
}

export default function Step3TrainingType({ selectedType, onChange }: Step3Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          ¿Qué tipo de entrenamiento prefieres?
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {TRAINING_OPTIONS.map(({ value, title, description, icon: Icon }) => {
          const selected = selectedType === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`flex items-start gap-4 text-left p-5 rounded-lg border transition-all duration-200 ${
                selected
                  ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <Icon className={`w-6 h-6 shrink-0 mt-0.5 ${selected ? 'text-red-500' : 'text-neutral-400 dark:text-neutral-500'}`} />
              <div className="flex-1 min-w-0">
                <h3 className={`text-base font-semibold ${
                  selected ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'
                }`}>
                  {title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {description}
                </p>
              </div>
              {selected ? (
                <CircleCheck className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
