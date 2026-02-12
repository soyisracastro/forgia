'use client';

import type { ExperienceLevel, WeightUnit } from '@/types/profile';
import { EXPERIENCE_LEVELS } from '@/lib/training-constants';
import { User, Info, Circle, CircleDot } from 'lucide-react';
import SegmentedButton from '@/components/ui/SegmentedButton';

interface Step1Data {
  name: string;
  age: number | '';
  experienceLevel: ExperienceLevel | null;
  injuryHistory: string;
  weightUnit: WeightUnit;
}

interface Step1Props {
  data: Step1Data;
  onChange: (updates: Partial<Step1Data>) => void;
}

export default function Step1BasicInfo({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Cuéntanos sobre ti
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Esta información nos ayuda a personalizar tus entrenamientos.
        </p>
      </div>

      <div>
        <label htmlFor="onboarding-name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Nombre <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            id="onboarding-name"
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Tu nombre"
            className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="onboarding-age" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Edad <span className="text-red-500">*</span>
        </label>
        <input
          id="onboarding-age"
          type="number"
          min={13}
          max={120}
          value={data.age}
          onChange={(e) => onChange({ age: e.target.value === '' ? '' : Number(e.target.value) })}
          placeholder="25"
          className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Unidad de peso
        </label>
        <div className="w-full sm:w-48">
          <SegmentedButton
            options={['lbs', 'kg']}
            selected={data.weightUnit}
            onSelect={(v) => onChange({ weightUnit: v as WeightUnit })}
          />
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
          Los pesos en tus WODs se mostrarán en esta unidad.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Nivel de experiencia <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {EXPERIENCE_LEVELS.map(({ value, description }) => {
            const isSelected = data.experienceLevel === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ experienceLevel: value })}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                {isSelected ? (
                  <CircleDot className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 shrink-0" />
                )}
                <div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                    {value}
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

      <div>
        <label htmlFor="onboarding-injury" className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Historial de lesiones
          <Info className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="onboarding-injury"
          value={data.injuryHistory}
          onChange={(e) => onChange({ injuryHistory: e.target.value })}
          placeholder="Ej: Lesión en rodilla izquierda hace 6 meses, dolor crónico en hombro..."
          className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
