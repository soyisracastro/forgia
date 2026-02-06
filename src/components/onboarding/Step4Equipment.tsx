'use client';

import type { TrainingType, EquipmentLevel, CrossFitEquipment, CalisteniaEquipment } from '@/types/profile';

interface EquipmentOption {
  value: EquipmentLevel;
  title: string;
  description: string;
  icon: string;
}

const CROSSFIT_OPTIONS: EquipmentOption[] = [
  {
    value: 'Box completo' as CrossFitEquipment,
    title: 'Box completo',
    description: 'Remadora, esquí, bicicleta de aire, anillas, barra, discos, mancuernas, kettlebells, cajas, cuerda, etc.',
    icon: '🏟️',
  },
  {
    value: 'Box equipado básico' as CrossFitEquipment,
    title: 'Box equipado básico',
    description: 'Barra, mancuernas, discos, cajas, kettlebells. Sin máquinas de cardio ni anillas.',
    icon: '🏠',
  },
  {
    value: 'Peso corporal + equipamiento mínimo' as CrossFitEquipment,
    title: 'Peso corporal + equipamiento mínimo',
    description: 'Poco o ningún equipamiento especializado. Ejercicios principalmente con peso corporal.',
    icon: '🤲',
  },
];

const CALISTENIA_OPTIONS: EquipmentOption[] = [
  {
    value: 'Superficies para ejercicios' as CalisteniaEquipment,
    title: 'Superficies para ejercicios',
    description: 'Suelo, barra de dominadas (pull-up bar). Lo esencial para calistenia.',
    icon: '🪵',
  },
  {
    value: 'Equipamiento complementario' as CalisteniaEquipment,
    title: 'Equipamiento complementario',
    description: 'Bandas elásticas, TRX, anillas, paralelas. Equipamiento extra para progresar.',
    icon: '🔗',
  },
];

interface Step4Props {
  trainingType: TrainingType;
  selectedEquipment: EquipmentLevel | null;
  onChange: (equipment: EquipmentLevel) => void;
}

export default function Step4Equipment({ trainingType, selectedEquipment, onChange }: Step4Props) {
  const options = trainingType === 'CrossFit' ? CROSSFIT_OPTIONS : CALISTENIA_OPTIONS;

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Selecciona el nivel de equipamiento que tienes disponible
      </p>
      <div className="grid grid-cols-1 gap-3">
        {options.map(({ value, title, description, icon }) => {
          const selected = selectedEquipment === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                selected
                  ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl leading-none mt-0.5">{icon}</span>
                <div>
                  <h3 className={`text-base font-semibold ${
                    selected ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'
                  }`}>
                    {title}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
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
