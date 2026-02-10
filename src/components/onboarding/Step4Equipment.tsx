'use client';

import type { TrainingType, EquipmentLevel } from '@/types/profile';
import { CROSSFIT_EQUIPMENT_OPTIONS, CALISTENIA_EQUIPMENT_OPTIONS } from '@/lib/training-constants';
import { CircleCheck, Circle } from 'lucide-react';

interface Step4Props {
  trainingType: TrainingType;
  selectedEquipment: EquipmentLevel | null;
  onChange: (equipment: EquipmentLevel) => void;
}

export default function Step4Equipment({ trainingType, selectedEquipment, onChange }: Step4Props) {
  const options = trainingType === 'CrossFit' ? CROSSFIT_EQUIPMENT_OPTIONS : CALISTENIA_EQUIPMENT_OPTIONS;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          ¿Con qué equipamiento cuentas?
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Esto nos ayuda a diseñar WODs que puedas realizar
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map(({ value, title, description, icon: Icon }) => {
          const selected = selectedEquipment === value;

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
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
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
