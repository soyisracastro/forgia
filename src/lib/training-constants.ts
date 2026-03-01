import type { LucideIcon } from 'lucide-react';
import type {
  ExperienceLevel,
  Objective,
  EquipmentLevel,
  CrossFitEquipment,
} from '@/types/profile';
import {
  Building2,
  Dumbbell,
  HeartPulse,
  Scale,
  TrendingDown,
  PersonStanding,
  Trophy,
  Warehouse,
  Grip,
  Timer,
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
  { value: 'Preparación HYROX', icon: Timer, description: 'Prepárate para competir en HYROX con entrenamiento enfocado en running y estaciones funcionales' },
];

export const INCOMPATIBLE_OBJECTIVES: Record<Objective, Objective[]> = {
  'Ganar fuerza': [],
  'Ganar masa muscular': ['Perder peso', 'Reducir tallas', 'Preparación HYROX'],
  'Perder peso': ['Ganar masa muscular', 'Preparación para competencia'],
  'Reducir tallas': ['Ganar masa muscular'],
  'Mejorar resistencia': [],
  'Mejorar movilidad': [],
  'Preparación para competencia': ['Perder peso'],
  'Preparación HYROX': ['Ganar masa muscular'],
};

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
    value: 'Gimnasio tradicional' as CrossFitEquipment,
    title: 'Gimnasio tradicional',
    description: 'Mancuernas, barras, bancos, barra de dominadas y máquinas de cardio. Sin equipamiento especializado de CrossFit.',
    icon: Building2,
  },
  {
    value: 'Peso corporal + equipamiento mínimo' as CrossFitEquipment,
    title: 'Peso corporal + equip. mínimo',
    description: 'Poco o ningún equipamiento especializado. Ejercicios principalmente con peso corporal.',
    icon: PersonStanding,
  },
];

// --- Training Frequency ---

export const TRAINING_FREQUENCY_OPTIONS: { value: number; label: string; description: string }[] = [
  { value: 2, label: 'días/semana', description: 'Ideal para empezar o si tienes poco tiempo' },
  { value: 3, label: 'días/semana', description: 'Balance perfecto para principiantes' },
  { value: 4, label: 'días/semana', description: 'Progresión sólida con descanso adecuado' },
  { value: 5, label: 'días/semana', description: 'Alto compromiso, ideal para intermedios y avanzados' },
  { value: 6, label: 'días/semana', description: 'Máximo volumen, un día de descanso obligatorio' },
];
