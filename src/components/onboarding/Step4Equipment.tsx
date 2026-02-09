'use client';

import type { TrainingType, EquipmentLevel, CrossFitEquipment, CalisteniaEquipment } from '@/types/profile';
import type { LucideIcon } from 'lucide-react';
import { Dumbbell, Warehouse, PersonStanding, Grip, CircleCheck, Circle } from 'lucide-react';

interface EquipmentOption {
  value: EquipmentLevel;
  title: string;
  description: string;
  icon: LucideIcon;
}

const CROSSFIT_OPTIONS: EquipmentOption[] = [
  {
    value: 'Box completo' as CrossFitEquipment,
    title: 'Box completo',
    description: 'Barras olímpicas, rig, rower, assault bike, bumper plates, kettlebells, wall balls, GHD, cuerda de trepar...',
    icon: Dumbbell,
  },
  {
    value: 'Box equipado básico' as CrossFitEquipment,
    title: 'Box equipado básico',
    description: 'Barra, mancuernas, discos, cajas, kettlebells. Sin máquinas de cardio ni anillas.',
    icon: Warehouse,
  },
  {
    value: 'Peso corporal + equipamiento mínimo' as CrossFitEquipment,
    title: 'Peso corporal + equip. mínimo',
    description: 'Poco o ningún equipamiento especializado. Ejercicios principalmente con peso corporal.',
    icon: PersonStanding,
  },
];

const CALISTENIA_OPTIONS: EquipmentOption[] = [
  {
    value: 'Superficies para ejercicios' as CalisteniaEquipment,
    title: 'Superficies para ejercicios',
    description: 'Suelo, barra de dominadas (pull-up bar). Lo esencial para calistenia.',
    icon: PersonStanding,
  },
  {
    value: 'Equipamiento complementario' as CalisteniaEquipment,
    title: 'Equipamiento complementario',
    description: 'Bandas elásticas, TRX, anillas, paralelas. Equipamiento extra para progresar.',
    icon: Grip,
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
