'use client';

import type { Objective } from '@/types/profile';
import type { LucideIcon } from 'lucide-react';
import { Dumbbell, HeartPulse, Scale, TrendingDown, PersonStanding, Trophy, CircleCheck, Square } from 'lucide-react';
import { Info } from 'lucide-react';

const OBJECTIVES: { value: Objective; icon: LucideIcon; description: string }[] = [
  { value: 'Ganar fuerza', icon: Dumbbell, description: 'Aumentar tu fuerza máxima en los levantamientos principales' },
  { value: 'Ganar masa muscular', icon: Dumbbell, description: 'Hipertrofia y aumento de masa muscular' },
  { value: 'Perder peso', icon: Scale, description: 'Reducir peso corporal y grasa' },
  { value: 'Reducir tallas', icon: TrendingDown, description: 'Reducir medidas y mejorar composición corporal' },
  { value: 'Mejorar resistencia', icon: HeartPulse, description: 'Aumentar tu capacidad cardiovascular y muscular' },
  { value: 'Mejorar movilidad', icon: PersonStanding, description: 'Flexibilidad, rango de movimiento y recuperación' },
  { value: 'Preparación para competencia', icon: Trophy, description: 'Entrenamiento enfocado en competir' },
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

  const getIncompatibleMessage = (): string | null => {
    for (const selected of selectedObjectives) {
      const incompatibles = INCOMPATIBLE[selected];
      if (incompatibles.length > 0) {
        const disabledNames = incompatibles.filter((obj) =>
          OBJECTIVES.some((o) => o.value === obj && !isSelected(obj))
        );
        if (disabledNames.length > 0) {
          return `${selected} no es compatible con ${disabledNames.join(', ')} para este programa.`;
        }
      }
    }
    return null;
  };

  const handleToggle = (obj: Objective) => {
    if (isDisabled(obj)) return;

    if (isSelected(obj)) {
      onChange(selectedObjectives.filter((o) => o !== obj));
    } else {
      onChange([...selectedObjectives, obj]);
    }
  };

  const incompatibleMessage = getIncompatibleMessage();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          ¿Cuáles son tus objetivos?
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Selecciona 1 o 2 objetivos
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {OBJECTIVES.map(({ value, icon: Icon, description }) => {
          const selected = isSelected(value);
          const disabled = isDisabled(value);

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleToggle(value)}
              disabled={disabled}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 text-left ${
                selected
                  ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                  : disabled
                    ? 'border-neutral-200 dark:border-neutral-700 opacity-40 cursor-not-allowed'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${selected ? 'text-red-500' : 'text-neutral-400 dark:text-neutral-500'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  selected ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'
                }`}>
                  {value}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {description}
                </p>
              </div>
              {selected ? (
                <CircleCheck className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-neutral-300 dark:text-neutral-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {incompatibleMessage && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {incompatibleMessage}
          </p>
        </div>
      )}
    </div>
  );
}
