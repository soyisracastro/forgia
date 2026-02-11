import type { ExperienceLevel } from '@/types/profile';
import type { BenchmarkWod } from '@/types/assessment';

export const BENCHMARK_WODS: BenchmarkWod[] = [
  {
    id: 'novato-to-principiante',
    fromLevel: 'Novato',
    toLevel: 'Principiante',
    title: 'Evaluación Nivel 1: Fundamentos',
    description: 'Demuestra dominio de los movimientos básicos completando un circuito de fundamentos.',
    wod: {
      title: 'Evaluación Fundamentos',
      warmUp: {
        title: 'Calentamiento',
        duration: '5-8 minutos',
        parts: [
          '2 minutos de trote suave en el sitio',
          '10 círculos de brazos hacia adelante + 10 hacia atrás',
          '10 sentadillas al aire con pausa abajo (3 seg)',
          '5 inchworms',
          '10 rotaciones de cadera por lado',
        ],
      },
      strengthSkill: {
        title: 'Habilidad: Patrones Fundamentales',
        details: [
          '3x5 Air Squats con pausa de 2 seg abajo — foco en profundidad y rodillas hacia afuera',
          '3x5 Push-ups estrictas (rodillas si es necesario) — foco en cuerpo rígido',
          '3x5 Lunges por pierna — foco en estabilidad y rodilla alineada',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: '3 rondas de:',
        movements: [
          '10 Air Squats',
          '10 Push-ups (rodillas permitido)',
          '10 Lunges alternados',
          '20 segundos Plancha (plank)',
        ],
        notes: 'Time cap: 8 minutos. Criterio: completar las 3 rondas con buena forma.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          '30 seg estiramiento de cuádriceps por pierna',
          '30 seg estiramiento de isquiotibiales por pierna',
          '30 seg estiramiento de pecho en marco de puerta',
          '1 min respiración profunda con brazos elevados',
        ],
      },
    },
    passingCriteria: 'Completar las 3 rondas dentro de 8 minutos',
  },
  {
    id: 'principiante-to-intermedio',
    fromLevel: 'Principiante',
    toLevel: 'Intermedio',
    title: 'Evaluación Nivel 2: Cindy',
    description: 'AMRAP 20 min: 5 Pull-ups, 10 Push-ups, 15 Air Squats. Objetivo: 12+ rondas.',
    wod: {
      title: 'Benchmark: Cindy',
      warmUp: {
        title: 'Calentamiento',
        duration: '10 minutos',
        parts: [
          '3 minutos de cardio ligero (correr, saltar cuerda)',
          '2x5 Pull-ups o ring rows',
          '2x10 Push-ups (escaladas si necesario)',
          '2x10 Air Squats',
          'Movilidad de hombros: 10 pass-throughs con banda',
        ],
      },
      strengthSkill: {
        title: 'Habilidad: Preparación para Cindy',
        details: [
          '1 ronda de práctica completa a ritmo suave',
          'Ajustar escalado si es necesario: band pull-ups o ring rows',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'AMRAP 20 min',
        description: 'AMRAP en 20 minutos de:',
        movements: [
          '5 Pull-ups (banda o ring rows como escalado)',
          '10 Push-ups',
          '15 Air Squats',
        ],
        notes: 'Criterio para pasar: 12+ rondas completas. Pull-ups con banda permitido. Registra rondas + reps.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5-8 minutos',
        parts: [
          '1 min estiramiento de dorsales colgando de barra',
          '30 seg estiramiento de pecho por lado',
          '1 min pigeon stretch por lado',
          '30 seg estiramiento de muñecas',
        ],
      },
    },
    passingCriteria: '12+ rondas completas en 20 minutos',
  },
  {
    id: 'intermedio-to-avanzado',
    fromLevel: 'Intermedio',
    toLevel: 'Avanzado',
    title: 'Evaluación Nivel 3: Fran',
    description: 'Fran: 21-15-9 Thrusters (43/30 kg) + Pull-ups. Objetivo: completar Rx en menos de 6 minutos.',
    wod: {
      title: 'Benchmark: Fran',
      warmUp: {
        title: 'Calentamiento',
        duration: '12-15 minutos',
        parts: [
          '5 minutos de cardio moderado (remo o bici)',
          '2x5 Thrusters con barra vacía',
          '2x5 Pull-ups estrictos',
          '1x3 Thrusters al peso de trabajo',
          'Movilidad: 1 min front rack stretch + 1 min lat stretch',
        ],
      },
      strengthSkill: {
        title: 'Habilidad: Preparación para Fran',
        details: [
          '1 set de 5 Thrusters al peso Rx (43/30 kg)',
          '1 set de 5 Kipping Pull-ups',
          'Descanso 3-5 min antes de empezar',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: '21-15-9 reps de:',
        movements: [
          'Thrusters (43/30 kg)',
          'Pull-ups',
        ],
        notes: 'Criterio para pasar: completar Rx (peso prescrito + pull-ups sin banda) en menos de 6 minutos. Time cap: 10 minutos.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '8-10 minutos',
        parts: [
          '3 min caminata suave para bajar pulsaciones',
          '1 min estiramiento de cuádriceps por pierna',
          '1 min estiramiento de hombros por lado',
          '30 seg hang pasivo de barra',
          '1 min respiración diafragmática',
        ],
      },
    },
    passingCriteria: 'Completar Fran Rx en menos de 6 minutos',
  },
];

export function getBenchmarkForLevel(currentLevel: ExperienceLevel): BenchmarkWod | null {
  return BENCHMARK_WODS.find((b) => b.fromLevel === currentLevel) ?? null;
}
