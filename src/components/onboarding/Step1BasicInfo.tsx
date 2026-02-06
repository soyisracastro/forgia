'use client';

import type { ExperienceLevel } from '@/types/profile';
import SegmentedButton from '@/components/ui/SegmentedButton';

interface Step1Data {
  name: string;
  age: number | '';
  experienceLevel: ExperienceLevel | null;
  injuryHistory: string;
}

interface Step1Props {
  data: Step1Data;
  onChange: (updates: Partial<Step1Data>) => void;
}

export default function Step1BasicInfo({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="onboarding-name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Nombre
        </label>
        <input
          id="onboarding-name"
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Tu nombre"
          className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="onboarding-age" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Edad
        </label>
        <input
          id="onboarding-age"
          type="number"
          min={13}
          max={120}
          value={data.age}
          onChange={(e) => onChange({ age: e.target.value === '' ? '' : Number(e.target.value) })}
          placeholder="25"
          className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Nivel de experiencia
        </label>
        <SegmentedButton
          options={['Principiante', 'Intermedio', 'Avanzado']}
          selected={data.experienceLevel ?? ''}
          onSelect={(v) => onChange({ experienceLevel: v as ExperienceLevel })}
        />
      </div>

      <div>
        <label htmlFor="onboarding-injury" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Historial de lesiones (opcional)
        </label>
        <textarea
          id="onboarding-injury"
          value={data.injuryHistory}
          onChange={(e) => onChange({ injuryHistory: e.target.value })}
          placeholder="Ej: Lesión en rodilla izquierda hace 6 meses, dolor crónico en hombro..."
          className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out sm:text-sm"
          rows={3}
        />
      </div>
    </div>
  );
}
