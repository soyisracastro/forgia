import type { LucideIcon } from 'lucide-react';
import type {
  ExperienceLevel,
  Objective,
  TrainingType,
  EquipmentLevel,
  CrossFitEquipment,
  CalisteniaEquipment,
} from '@/types/profile';
import {
  Dumbbell,
  HeartPulse,
  Scale,
  TrendingDown,
  PersonStanding,
  Trophy,
  Activity,
  Warehouse,
  Grip,
} from 'lucide-react';

// --- Experience Levels ---

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; description: string }[] = [
  { value: 'Novato', description: 'Nunca he hecho CrossFit ni entrenamiento funcional' },
  { value: 'Principiante', description: 'Menos de 1 año de experiencia' },
  { value: 'Intermedio', description: '1 a 3 años de experiencia' },
  { value: 'Avanzado', description: 'Más de 3 años de experiencia' },
];

// --- Objectives ---

export const OBJECTIVES: { value: Objective; icon: LucideIcon; description: string }[] = [
  { value: 'Ganar fuerza', icon: Dumbbell, description: 'Aumentar tu fuerza máxima en los levantamientos principales' },
  { value: 'Ganar masa muscular', icon: Dumbbell, description: 'Hipertrofia y aumento de masa muscular' },
  { value: 'Perder peso', icon: Scale, description: 'Reducir peso corporal y grasa' },
  { value: 'Reducir tallas', icon: TrendingDown, description: 'Reducir medidas y mejorar composición corporal' },
  { value: 'Mejorar resistencia', icon: HeartPulse, description: 'Aumentar tu capacidad cardiovascular y muscular' },
  { value: 'Mejorar movilidad', icon: PersonStanding, description: 'Flexibilidad, rango de movimiento y recuperación' },
  { value: 'Preparación para competencia', icon: Trophy, description: 'Entrenamiento enfocado en competir' },
];

export const INCOMPATIBLE_OBJECTIVES: Record<Objective, Objective[]> = {
  'Ganar fuerza': [],
  'Ganar masa muscular': ['Perder peso', 'Reducir tallas'],
  'Perder peso': ['Ganar masa muscular', 'Preparación para competencia'],
  'Reducir tallas': ['Ganar masa muscular'],
  'Mejorar resistencia': [],
  'Mejorar movilidad': [],
  'Preparación para competencia': ['Perder peso'],
};

// --- Training Types ---

export const TRAINING_OPTIONS: { value: TrainingType; title: string; description: string; icon: LucideIcon }[] = [
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

// --- Equipment Options ---

export interface EquipmentOption {
  value: EquipmentLevel;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const CROSSFIT_EQUIPMENT_OPTIONS: EquipmentOption[] = [
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

export const CALISTENIA_EQUIPMENT_OPTIONS: EquipmentOption[] = [
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
