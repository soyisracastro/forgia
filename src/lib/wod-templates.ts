import type { WodTemplate, TemplateCategory } from '@/types/wod-template';
import type { ExperienceLevel } from '@/types/profile';

export const WOD_TEMPLATES: WodTemplate[] = [
  // ========== THE GIRLS ==========
  {
    id: 'fran',
    name: 'Fran',
    category: 'girl',
    difficulty: 'Intermedio',
    equipmentRequired: ['Barra', 'Pull-up bar'],
    estimatedMinutes: 10,
    description: 'El WOD más icónico de CrossFit. 21-15-9 de Thrusters y Pull-ups. Corto, explosivo, brutalmente intenso.',
    scoringType: 'time',
    rxStandard: { men: '95 lbs / 43 kg', women: '65 lbs / 29 kg' },
    wod: {
      title: 'Fran',
      warmUp: {
        title: 'Calentamiento',
        duration: '10 minutos',
        parts: [
          '400m trote suave',
          '2 rondas: 10 air squats, 10 push-ups, 10 ring rows',
          'Front squat progresivo con barra vacía: 5-5-5',
          '5 Thrusters ligeros + 5 pull-ups para activar',
        ],
      },
      strengthSkill: {
        title: 'Preparación: Thruster + Pull-up',
        details: [
          'Practica 3 Thrusters al peso objetivo — foco en recepción y drive',
          'Practica 3-5 kipping pull-ups o escalado elegido',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: '21-15-9 reps de:',
        movements: [
          'Thrusters (43/29 kg | 95/65 lbs)',
          'Pull-ups',
        ],
        notes: 'Escalado: Thrusters con peso reducido, pull-ups con banda o ring rows. Target: sub 10 minutos.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          'Foam roll cuádriceps y lats 1 min cada lado',
          'Estiramiento de hombros con banda 30s cada lado',
          'Child\'s pose 1 min',
        ],
      },
    },
  },
  {
    id: 'grace',
    name: 'Grace',
    category: 'girl',
    difficulty: 'Intermedio',
    equipmentRequired: ['Barra'],
    estimatedMinutes: 8,
    description: '30 Clean & Jerks for time. Test puro de potencia y eficiencia olímpica bajo fatiga.',
    scoringType: 'time',
    rxStandard: { men: '135 lbs / 61 kg', women: '95 lbs / 43 kg' },
    wod: {
      title: 'Grace',
      warmUp: {
        title: 'Calentamiento',
        duration: '10 minutos',
        parts: [
          '500m remo o 2 min de saltar cuerda',
          '2 rondas: 5 muscle cleans, 5 front squats, 5 push press (barra vacía)',
          'Progresión Clean & Jerk: 3 a 50%, 3 a 70%, 2 a 85%',
        ],
      },
      strengthSkill: {
        title: 'Preparación: Clean & Jerk',
        details: [
          'Practica 2-3 singles al peso objetivo',
          'Decide estrategia: singles, touch-and-go, o mixto',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: '30 reps de:',
        movements: [
          'Clean & Jerk (61/43 kg | 135/95 lbs)',
        ],
        notes: 'Escalado: Power Clean + Push Jerk con peso reducido. Target: sub 5 min (avanzado), sub 8 min (intermedio).',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          'Caminata 200m',
          'Pigeon stretch 1 min cada lado',
          'Estiramiento de muñecas y hombros',
        ],
      },
    },
  },
  {
    id: 'diane',
    name: 'Diane',
    category: 'girl',
    difficulty: 'Avanzado',
    equipmentRequired: ['Barra'],
    estimatedMinutes: 10,
    description: '21-15-9 de Deadlifts y Handstand Push-ups. Fuerza posterior + pressing invertido.',
    scoringType: 'time',
    rxStandard: { men: '225 lbs / 102 kg', women: '155 lbs / 70 kg' },
    wod: {
      title: 'Diane',
      warmUp: {
        title: 'Calentamiento',
        duration: '10 minutos',
        parts: [
          '400m trote suave',
          '2 rondas: 10 good mornings con barra, 5 inch worms, 10 pike push-ups',
          'Deadlift progresivo: 5 a 40%, 5 a 60%, 3 a 80%',
        ],
      },
      strengthSkill: {
        title: 'Preparación: Deadlift + HSPU',
        details: [
          '3 Deadlifts al peso objetivo',
          '3-5 HSPU o variante de escalado (piked HSPU, DB push press)',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: '21-15-9 reps de:',
        movements: [
          'Deadlift (102/70 kg | 225/155 lbs)',
          'Handstand Push-ups',
        ],
        notes: 'Escalado: Deadlift más ligero, pike HSPU desde cajón o DB push press.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          'Foam roll espalda baja y hamstrings',
          'Estiramiento de isquiotibiales 30s cada lado',
          'Down dog hold 1 min',
        ],
      },
    },
  },
  {
    id: 'helen',
    name: 'Helen',
    category: 'girl',
    difficulty: 'Intermedio',
    equipmentRequired: ['Kettlebell', 'Pull-up bar'],
    estimatedMinutes: 15,
    description: '3 rondas de Run + KB Swings + Pull-ups. Test clásico de motor y resistencia.',
    scoringType: 'time',
    rxStandard: { men: '53 lbs / 24 kg KB', women: '35 lbs / 16 kg KB' },
    wod: {
      title: 'Helen',
      warmUp: {
        title: 'Calentamiento',
        duration: '10 minutos',
        parts: [
          '400m trote suave',
          '2 rondas: 10 Russian KB swings ligeros, 5 pull-ups o ring rows, 10 air squats',
          '200m a ritmo de WOD',
        ],
      },
      strengthSkill: {
        title: 'Preparación: KB Swing americano',
        details: [
          '10 KB Swings al peso objetivo — foco en extensión de cadera completa',
          '5 pull-ups o escalado elegido',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: '3 rondas de:',
        movements: [
          '400m Run',
          '21 KB Swings (24/16 kg | 53/35 lbs)',
          '12 Pull-ups',
        ],
        notes: 'Escalado: KB más ligero, ring rows o pull-ups con banda. Target: sub 12 min.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          'Caminata 200m',
          'Estiramiento de hip flexors 30s cada lado',
          'Lat stretch con banda 30s cada lado',
        ],
      },
    },
  },
  {
    id: 'annie',
    name: 'Annie',
    category: 'girl',
    difficulty: 'Principiante',
    equipmentRequired: ['Cuerda para saltar'],
    estimatedMinutes: 12,
    description: '50-40-30-20-10 de Double-unders y Sit-ups. Prueba de resistencia y coordinación sin barra.',
    scoringType: 'time',
    rxStandard: { men: 'Rx (sin peso)', women: 'Rx (sin peso)' },
    wod: {
      title: 'Annie',
      warmUp: {
        title: 'Calentamiento',
        duration: '8 minutos',
        parts: [
          '2 min de single-unders o saltar cuerda a ritmo suave',
          '2 rondas: 10 sit-ups, 10 toe touches, 20 single-unders',
          'Práctica de double-unders: 2 x 30 segundos',
        ],
      },
      strengthSkill: {
        title: 'Preparación: Double-under',
        details: [
          'Práctica 20 double-unders ininterrumpidos (o máximo posible)',
          'Si escalas: confirmar ritmo de single-unders x3',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: '50-40-30-20-10 reps de:',
        movements: [
          'Double-unders',
          'Sit-ups',
        ],
        notes: 'Escalado: Triple single-unders (150-120-90-60-30) o attempts de DU. Target: sub 10 min.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          'Cobra stretch 1 min',
          'Seated forward fold 1 min',
          'Respiración diafragmática 2 min',
        ],
      },
    },
  },
  {
    id: 'isabel',
    name: 'Isabel',
    category: 'girl',
    difficulty: 'Avanzado',
    equipmentRequired: ['Barra'],
    estimatedMinutes: 8,
    description: '30 Snatches for time. Sprint de potencia olímpica pura.',
    scoringType: 'time',
    rxStandard: { men: '135 lbs / 61 kg', women: '95 lbs / 43 kg' },
    wod: {
      title: 'Isabel',
      warmUp: {
        title: 'Calentamiento',
        duration: '12 minutos',
        parts: [
          '500m remo o 2 min saltar cuerda',
          '2 rondas: 5 snatch grip deadlifts, 5 hang muscle snatches, 5 overhead squats (barra vacía)',
          'Progresión Snatch: 3 a 50%, 3 a 70%, 2 a 85%',
        ],
      },
      strengthSkill: {
        title: 'Preparación: Snatch',
        details: [
          '2-3 singles al peso objetivo',
          'Decide si power snatch o squat snatch según preferencia',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: '30 reps de:',
        movements: [
          'Snatch (61/43 kg | 135/95 lbs)',
        ],
        notes: 'Escalado: Power snatch con peso reducido. Target elite: sub 3 min. Target intermedio: sub 7 min.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          'Caminata 200m',
          'Estiramiento de muñecas y hombros con banda',
          'Pigeon stretch 1 min cada lado',
        ],
      },
    },
  },
  {
    id: 'jackie',
    name: 'Jackie',
    category: 'girl',
    difficulty: 'Intermedio',
    equipmentRequired: ['Remo', 'Barra', 'Pull-up bar'],
    estimatedMinutes: 12,
    description: 'Row + Thrusters + Pull-ups for time. Triatlón clásico de CrossFit.',
    scoringType: 'time',
    rxStandard: { men: '45 lbs / 20 kg', women: '35 lbs / 15 kg' },
    wod: {
      title: 'Jackie',
      warmUp: {
        title: 'Calentamiento',
        duration: '10 minutos',
        parts: [
          '500m remo a ritmo conversacional',
          '2 rondas: 10 air squats, 5 push press (barra vacía), 5 ring rows',
          '250m remo a ritmo de WOD',
        ],
      },
      strengthSkill: {
        title: 'Preparación',
        details: [
          '5 Thrusters al peso objetivo',
          '5 pull-ups o escalado elegido',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: 'For Time:',
        movements: [
          '1000m Row',
          '50 Thrusters (20/15 kg | 45/35 lbs)',
          '30 Pull-ups',
        ],
        notes: 'Escalado: Ring rows en lugar de pull-ups, peso reducido en thrusters.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          'Caminata 200m',
          'Foam roll cuádriceps y espalda',
          'Estiramiento de hombros y lats',
        ],
      },
    },
  },
  {
    id: 'karen',
    name: 'Karen',
    category: 'girl',
    difficulty: 'Intermedio',
    equipmentRequired: ['Wall ball'],
    estimatedMinutes: 12,
    description: '150 Wall Balls for time. Simplemente brutal. Un solo movimiento, cero escape.',
    scoringType: 'time',
    rxStandard: { men: '20 lbs / 9 kg (10 ft)', women: '14 lbs / 6 kg (9 ft)' },
    wod: {
      title: 'Karen',
      warmUp: {
        title: 'Calentamiento',
        duration: '8 minutos',
        parts: [
          '400m trote suave',
          '2 rondas: 10 air squats, 10 push press ligeros, 10 wall balls ligeros',
          '10 wall balls al peso objetivo para encontrar ritmo',
        ],
      },
      strengthSkill: {
        title: 'Estrategia',
        details: [
          'Planifica tus sets: 25-25-25-25-25-25, 30-20 series, o lo que te funcione',
          'Practica mantener la pelota arriba en la transición',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: '150 reps de:',
        movements: [
          'Wall Balls (9/6 kg | 20/14 lbs) al target (3m/2.7m | 10/9 ft)',
        ],
        notes: 'Escalado: Peso reducido, target más bajo. Clave: no dejar caer la pelota, sets consistentes.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          'Caminata suave 200m',
          'Quad stretch 30s cada lado',
          'Glute stretch 30s cada lado',
          'Deep breathing 1 min',
        ],
      },
    },
  },
  {
    id: 'nancy',
    name: 'Nancy',
    category: 'girl',
    difficulty: 'Intermedio',
    equipmentRequired: ['Barra'],
    estimatedMinutes: 20,
    description: '5 rondas de Run + Overhead Squats. Resistencia aeróbica + estabilidad overhead bajo fatiga.',
    scoringType: 'time',
    rxStandard: { men: '95 lbs / 43 kg', women: '65 lbs / 29 kg' },
    wod: {
      title: 'Nancy',
      warmUp: {
        title: 'Calentamiento',
        duration: '10 minutos',
        parts: [
          '400m trote suave',
          '2 rondas: 10 pass-throughs con PVC, 10 overhead squats con PVC, 10 walking lunges',
          '5 OHS a 50%, 5 OHS a 70%',
        ],
      },
      strengthSkill: {
        title: 'Preparación: Overhead Squat',
        details: [
          '5 OHS al peso objetivo — foco en estabilidad overhead y profundidad',
          '200m a ritmo de WOD para calibrar',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: '5 rondas de:',
        movements: [
          '400m Run',
          '15 Overhead Squats (43/29 kg | 95/65 lbs)',
        ],
        notes: 'Escalado: Front Squats si no hay movilidad para OHS, o peso reducido. Target: sub 20 min.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          'Caminata 200m',
          'Foam roll cuádriceps y thoracic spine',
          'Shoulder stretch con banda 30s cada lado',
        ],
      },
    },
  },
  // ========== HERO WOD ==========
  {
    id: 'murph',
    name: 'Murph',
    category: 'hero',
    difficulty: 'Avanzado',
    equipmentRequired: ['Pull-up bar', 'Chaleco lastrado (opcional)'],
    estimatedMinutes: 45,
    description: 'En honor al Lt. Michael Murphy. 1 mile run, 100 pull-ups, 200 push-ups, 300 squats, 1 mile run. El WOD más emblemático de CrossFit.',
    scoringType: 'time',
    rxStandard: { men: 'Chaleco 20 lbs / 9 kg', women: 'Chaleco 14 lbs / 6 kg' },
    wod: {
      title: 'Murph',
      warmUp: {
        title: 'Calentamiento',
        duration: '10 minutos',
        parts: [
          '400m trote muy suave',
          '2 rondas: 10 air squats, 5 push-ups, 5 pull-ups o ring rows',
          'Movilidad de hombros y caderas',
          'Si usas chaleco: 200m caminata con chaleco para aclimatarse',
        ],
      },
      strengthSkill: {
        title: 'Estrategia',
        details: [
          'Partición recomendada: 20 rondas de 5 pull-ups, 10 push-ups, 15 squats',
          'Alternativa: 10 rondas de 10-20-30',
          'Pace la primera milla — no salir al sprint',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'For Time',
        description: 'For Time (con chaleco si Rx):',
        movements: [
          '1 Mile Run (1.6 km)',
          '100 Pull-ups',
          '200 Push-ups',
          '300 Air Squats',
          '1 Mile Run (1.6 km)',
        ],
        notes: 'Escalado: Sin chaleco, ring rows en lugar de pull-ups, push-ups de rodillas. Particionar el trabajo del medio. Time cap sugerido: 60 min.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '10 minutos',
        parts: [
          'Caminata suave 400m',
          'Foam roll completo: quads, hamstrings, lats, pecho',
          'Estiramiento de pecho en puerta 30s cada lado',
          'Pigeon stretch 1 min cada lado',
          'Hidratarse bien',
        ],
      },
    },
  },
  // ========== BENCHMARKS ==========
  {
    id: 'cindy',
    name: 'Cindy',
    category: 'benchmark',
    difficulty: 'Principiante',
    equipmentRequired: ['Pull-up bar'],
    estimatedMinutes: 20,
    description: 'AMRAP 20 min de Pull-ups, Push-ups, Air Squats. Benchmark clásico de peso corporal que revela tu motor.',
    scoringType: 'rounds',
    rxStandard: { men: 'Rx (peso corporal)', women: 'Rx (peso corporal)' },
    wod: {
      title: 'Cindy',
      warmUp: {
        title: 'Calentamiento',
        duration: '8 minutos',
        parts: [
          '400m trote suave',
          '2 rondas: 5 pull-ups o ring rows, 10 push-ups, 15 air squats',
          'Activación de glúteos: 10 glute bridges',
        ],
      },
      strengthSkill: {
        title: 'Estrategia',
        details: [
          '1 ronda completa a ritmo de WOD para calibrar',
          'Objetivo: mantener ritmo consistente las 20 min sin fallar',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'AMRAP 20 min',
        description: 'AMRAP en 20 minutos de:',
        movements: [
          '5 Pull-ups',
          '10 Push-ups',
          '15 Air Squats',
        ],
        notes: 'Escalado: Ring rows o pull-ups con banda, push-ups de rodillas. Bueno: 15+ rondas, Excelente: 20+ rondas.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          'Caminata suave 200m',
          'Estiramiento de pecho contra pared 30s cada lado',
          'Forward fold 1 min',
          'Child\'s pose 1 min',
        ],
      },
    },
  },
  {
    id: 'mary',
    name: 'Mary',
    category: 'benchmark',
    difficulty: 'Avanzado',
    equipmentRequired: ['Pull-up bar', 'Espacio pared'],
    estimatedMinutes: 20,
    description: 'AMRAP 20 min de Handstand Push-ups, Pistols, Pull-ups. La versión gimnástica avanzada de Cindy.',
    scoringType: 'rounds',
    rxStandard: { men: 'Rx (peso corporal)', women: 'Rx (peso corporal)' },
    wod: {
      title: 'Mary',
      warmUp: {
        title: 'Calentamiento',
        duration: '10 minutos',
        parts: [
          '400m trote suave',
          '2 rondas: 5 pike push-ups, 5 air squats cada pierna, 5 pull-ups',
          'Kick-ups a pared: 5 reps',
          'Pistol squat progresión: 5 cada pierna a cajón',
        ],
      },
      strengthSkill: {
        title: 'Preparación',
        details: [
          '3 HSPU o escalado elegido',
          '3 pistols cada pierna o escalado',
          '5 pull-ups',
        ],
      },
      metcon: {
        title: 'Metcon',
        type: 'AMRAP 20 min',
        description: 'AMRAP en 20 minutos de:',
        movements: [
          '5 Handstand Push-ups',
          '10 Pistols (alternando)',
          '15 Pull-ups',
        ],
        notes: 'Escalado: Pike HSPU, pistols a cajón, pull-ups con banda. Este es un WOD avanzado — escalar sin vergüenza.',
      },
      coolDown: {
        title: 'Enfriamiento',
        duration: '5 minutos',
        parts: [
          'Caminata 200m',
          'Wrist stretches 1 min',
          'Pigeon stretch 1 min cada lado',
          'Shoulder stretch con banda',
        ],
      },
    },
  },
];

// --- Helper functions ---

export function getTemplateById(id: string): WodTemplate | undefined {
  return WOD_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): WodTemplate[] {
  return WOD_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplatesByDifficulty(difficulty: ExperienceLevel): WodTemplate[] {
  return WOD_TEMPLATES.filter((t) => t.difficulty === difficulty);
}
