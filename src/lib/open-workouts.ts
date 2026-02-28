import type { Wod } from '@/types/wod';

// --- Types ---

export type OpenDivision = 'rx' | 'scaled' | 'foundations';
export type OpenGender = 'hombre' | 'mujer' | 'prefiero_no_definir';

// --- Constants ---

export const OPEN_END_DATE = new Date('2026-03-17T23:59:59');
export const OPEN_BANNER_DISMISS_KEY = 'forgia-open-2026-dismissed';

// --- Specs por división + género ---

interface DivisionSpecs {
  wallBallWeight: string;
  wallBallTarget: string;
  boxHeight: string;
}

const SPECS: Record<OpenDivision, Record<'hombre' | 'mujer', DivisionSpecs>> = {
  rx: {
    hombre: { wallBallWeight: '20 lb (9 kg)', wallBallTarget: '10 ft (3 m)', boxHeight: '24" (60 cm)' },
    mujer: { wallBallWeight: '14 lb (6 kg)', wallBallTarget: '9 ft (2.7 m)', boxHeight: '20" (50 cm)' },
  },
  scaled: {
    hombre: { wallBallWeight: '14 lb (6 kg)', wallBallTarget: '10 ft (3 m)', boxHeight: '24" (60 cm)' },
    mujer: { wallBallWeight: '10 lb (5 kg)', wallBallTarget: '9 ft (2.7 m)', boxHeight: '20" (50 cm)' },
  },
  foundations: {
    hombre: { wallBallWeight: '14 lb (6 kg)', wallBallTarget: '10 ft (3 m)', boxHeight: '20" (50 cm)' },
    mujer: { wallBallWeight: '10 lb (5 kg)', wallBallTarget: '9 ft (2.7 m)', boxHeight: '20" (50 cm)' },
  },
};

// --- Helpers ---

export function isOpenSeasonActive(): boolean {
  return new Date() <= OPEN_END_DATE;
}

function getSpecs(division: OpenDivision, gender: OpenGender): DivisionSpecs | null {
  if (gender === 'prefiero_no_definir') return null;
  return SPECS[division][gender];
}

function formatSpecsNote(division: OpenDivision, gender: OpenGender): string {
  if (gender === 'prefiero_no_definir') {
    const m = SPECS[division].hombre;
    const f = SPECS[division].mujer;
    return `Hombre: Wall-Ball ${m.wallBallWeight} al ${m.wallBallTarget}, Box ${m.boxHeight}. Mujer: Wall-Ball ${f.wallBallWeight} al ${f.wallBallTarget}, Box ${f.boxHeight}.`;
  }
  const s = getSpecs(division, gender)!;
  return `Wall-Ball ${s.wallBallWeight} al ${s.wallBallTarget}. Box ${s.boxHeight}.`;
}

function buildMovements(division: OpenDivision, gender: OpenGender): string[] {
  const specs = gender === 'prefiero_no_definir' ? null : getSpecs(division, gender);

  const wallBallLabel = specs
    ? `Wall-Ball Shots (${specs.wallBallWeight} al ${specs.wallBallTarget})`
    : 'Wall-Ball Shots (ver notas para peso/altura)';

  const boxLabel = specs
    ? `Box Step-Overs (${specs.boxHeight})`
    : 'Box Step-Overs (ver notas para altura)';

  const jumpOverLabel = specs
    ? `Box Jump-Overs (${specs.boxHeight})`
    : 'Box Jump-Overs (ver notas para altura)';

  const useStepUps = division === 'scaled' || division === 'foundations';
  const boxMovement = useStepUps ? boxLabel : jumpOverLabel;

  return [
    `20 ${wallBallLabel} + 6 ${boxMovement}`,
    `30 Wall-Balls + 18 ${boxMovement}`,
    `40 Wall-Balls + 18 Med-Ball Box Step-Overs`,
    `66 Wall-Balls + 18 Med-Ball Box Step-Overs`,
    '40 Wall-Balls + 18 Box Jump-Overs',
    '30 Wall-Balls + 18 Box Jump-Overs',
    '20 Wall-Balls',
  ];
}

// --- Build the full WOD ---

export function buildOpenWod(division: OpenDivision, gender: OpenGender): Wod {
  const divisionLabel = division === 'rx' ? 'Rx' : division === 'scaled' ? 'Scaled' : 'Foundations';

  return {
    title: `CrossFit Open 26.1 — ${divisionLabel}`,
    warmUp: {
      title: 'Calentamiento',
      duration: '12 minutos',
      parts: [
        '3 min cardio suave (remo, bici o caminata rápida)',
        '2 rondas: 10 Air Squats + 10 Wall-Ball ligeros (peso reducido)',
        '1 min Step-Ups al cajón sin peso',
        '1 min movilidad de caderas (90/90 o pigeon stretch)',
        '1 min movilidad de hombros (dislocaciones con PVC)',
      ],
    },
    strengthSkill: {
      title: 'Activación y Estrategia',
      details: [
        'Practica 5-8 Wall-Balls al peso objetivo — foco en ritmo respiratorio',
        'Practica 3-4 Step-Overs o Jump-Overs al cajón',
        'Define tu estrategia de sets: decide en qué rondas romper los Wall-Balls',
        'Recuerda: step-down obligatorio al bajar del cajón',
      ],
    },
    metcon: {
      title: 'Open 26.1',
      type: 'For Time',
      description: 'Time Cap: 12 minutos. Estructura piramidal:',
      movements: buildMovements(division, gender),
      notes: `${formatSpecsNote(division, gender)} Step-down obligatorio al bajar del cajón. El balón no puede apoyarse en los muslos ni tocar el cajón durante los Step-Overs.`,
    },
    coolDown: {
      title: 'Enfriamiento',
      duration: '8 minutos',
      parts: [
        '2 min caminata suave para bajar pulsaciones',
        '1 min foam roll cuádriceps (cada lado)',
        '1 min pigeon stretch (cada lado)',
        '1 min estiramiento de hombros con banda',
        '1 min respiración diafragmática (nariz, 4-4-4)',
      ],
    },
  };
}

// --- Division default from experience level ---

export function getDefaultDivision(experienceLevel: string | null): OpenDivision {
  switch (experienceLevel) {
    case 'Avanzado':
      return 'rx';
    case 'Intermedio':
      return 'scaled';
    default:
      return 'foundations';
  }
}
