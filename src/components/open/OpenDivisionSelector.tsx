'use client';

import { useState } from 'react';
import { CircleDot, Circle, ChevronDown } from 'lucide-react';
import type { OpenDivision, OpenGender } from '@/lib/open-workouts';

interface Props {
  division: OpenDivision;
  gender: OpenGender;
  onDivisionChange: (d: OpenDivision) => void;
  onGenderChange: (g: OpenGender) => void;
}

const DIVISIONS: { value: OpenDivision; label: string; description: string }[] = [
  { value: 'rx', label: 'Rx', description: 'Estándares completos. Para atletas con experiencia.' },
  { value: 'scaled', label: 'Scaled', description: 'Pesos modificados. Step-ups permitidos.' },
  { value: 'foundations', label: 'Foundations', description: 'La opción más accesible. Ideal para principiantes.' },
];

const GENDERS: { value: OpenGender; label: string }[] = [
  { value: 'hombre', label: 'Hombre' },
  { value: 'mujer', label: 'Mujer' },
  { value: 'prefiero_no_definir', label: 'Prefiero no definir' },
];

const DIVISION_LABELS: Record<OpenDivision, string> = { rx: 'Rx', scaled: 'Scaled', foundations: 'Foundations' };
const GENDER_LABELS: Record<OpenGender, string> = { hombre: 'Hombre', mujer: 'Mujer', prefiero_no_definir: 'Sin definir' };

export default function OpenDivisionSelector({ division, gender, onDivisionChange, onGenderChange }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="w-full flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors -m-1 p-1 rounded-lg"
      >
        <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <span className="text-sm font-semibold">División y Categoría</span>
          {isCollapsed && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {DIVISION_LABELS[division]} · {GENDER_LABELS[gender]}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
        />
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className="space-y-6 mt-4">
          {/* División */}
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">División</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DIVISIONS.map(({ value, label, description }) => {
                const selected = division === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onDivisionChange(value)}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 text-left ${
                      selected
                        ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    {selected ? (
                      <CircleDot className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className={`text-sm font-semibold ${selected ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                        {label}
                      </span>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Género */}
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Categoría</h3>
            <div className="grid grid-cols-3 gap-2">
              {GENDERS.map(({ value, label }) => {
                const selected = gender === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onGenderChange(value)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 text-sm font-medium ${
                      selected
                        ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
