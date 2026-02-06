'use client';

import type { Objective } from '@/types/profile';

const OBJECTIVES: { value: Objective; icon: string; description: string }[] = [
  { value: 'Ganar fuerza', icon: '💪', description: 'Aumentar tu fuerza máxima en los levantamientos principales' },
  { value: 'Ganar masa muscular', icon: '🏋️', description: 'Hipertrofia y aumento de masa muscular' },
  { value: 'Perder peso', icon: '⚖️', description: 'Reducir peso corporal y grasa' },
  { value: 'Reducir tallas', icon: '📏', description: 'Reducir medidas y mejorar composición corporal' },
  { value: 'Mejorar resistencia', icon: '🫁', description: 'Aumentar tu capacidad cardiovascular y muscular' },
  { value: 'Mejorar movilidad', icon: '🧘', description: 'Flexibilidad, rango de movimiento y recuperación' },
  { value: 'Preparación para competencia', icon: '🏆', description: 'Entrenamiento enfocado en competir' },
];

const INCOMPATIBLE: Record<Objective, Objective[]> = {
  'Ganar fuerza': [],
  'Ganar masa muscular': ['Perder peso', 'Reducir tallas'],
  'Perder peso': ['Ganar masa muscular', 'Preparación para competencia'],
  'Reducir tallas': ['Ganar masa muscular'],
  'Mejorar resistencia': [],
  'Mejorar movilidad': [],
  'Preparación para competencia': ['Perder peso'],
};

interface Step2Props {
  selectedObjectives: Objective[];
  onChange: (objectives: Objective[]) => void;
}

export default function Step2Objectives({ selectedObjectives, onChange }: Step2Props) {
  const isSelected = (obj: Objective) => selectedObjectives.includes(obj);

  const isDisabled = (obj: Objective) => {
    if (isSelected(obj)) return false;
    if (selectedObjectives.length >= 2) return true;

    return selectedObjectives.some(
      (selected) => INCOMPATIBLE[selected]?.includes(obj)
    );
  };

  const handleToggle = (obj: Objective) => {
    if (isDisabled(obj)) return;

    if (isSelected(obj)) {
      onChange(selectedObjectives.filter((o) => o !== obj));
    } else {
      onChange([...selectedObjectives, obj]);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Selecciona 1 o 2 objetivos principales
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OBJECTIVES.map(({ value, icon, description }) => {
          const selected = isSelected(value);
          const disabled = isDisabled(value);

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleToggle(value)}
              disabled={disabled}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selected
                  ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                  : disabled
                    ? 'border-neutral-200 dark:border-neutral-700 opacity-40 cursor-not-allowed'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-0.5">{icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${
                    selected ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'
                  }`}>
                    {value}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
