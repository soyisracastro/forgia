import type { ExperienceLevel } from '@/types/profile';
import type { ScoringType } from '@/types/wod-template';

export interface LevelSuggestion {
  suggestedLevel: ExperienceLevel;
  reason: string;
}

interface ThresholdEntry {
  maxValue: number;
  rxOnly: boolean;
  level: ExperienceLevel;
}

// Thresholds per template: lower time = better for 'time' type, higher rounds = better for 'rounds' type
const THRESHOLDS: Record<string, { scoringType: ScoringType; entries: ThresholdEntry[] }> = {
  fran: {
    scoringType: 'time',
    entries: [
      { maxValue: 360, rxOnly: true, level: 'Avanzado' },    // < 6 min Rx
      { maxValue: 600, rxOnly: true, level: 'Intermedio' },   // < 10 min Rx
      { maxValue: 600, rxOnly: false, level: 'Principiante' }, // < 10 min Scaled
    ],
  },
  grace: {
    scoringType: 'time',
    entries: [
      { maxValue: 300, rxOnly: true, level: 'Avanzado' },    // < 5 min Rx
      { maxValue: 480, rxOnly: true, level: 'Intermedio' },   // < 8 min Rx
    ],
  },
  isabel: {
    scoringType: 'time',
    entries: [
      { maxValue: 300, rxOnly: true, level: 'Avanzado' },    // < 5 min Rx
      { maxValue: 480, rxOnly: true, level: 'Intermedio' },   // < 8 min Rx
    ],
  },
  murph: {
    scoringType: 'time',
    entries: [
      { maxValue: 2700, rxOnly: true, level: 'Avanzado' },   // < 45 min Rx (with vest)
      { maxValue: 3600, rxOnly: false, level: 'Intermedio' }, // < 60 min any
    ],
  },
  cindy: {
    scoringType: 'rounds',
    entries: [
      { maxValue: 20, rxOnly: true, level: 'Avanzado' },     // 20+ rounds Rx
      { maxValue: 12, rxOnly: true, level: 'Intermedio' },    // 12+ rounds Rx
    ],
  },
  mary: {
    scoringType: 'rounds',
    entries: [
      { maxValue: 12, rxOnly: true, level: 'Avanzado' },     // 12+ rounds Rx
      { maxValue: 6, rxOnly: true, level: 'Intermedio' },     // 6+ rounds Rx
    ],
  },
  helen: {
    scoringType: 'time',
    entries: [
      { maxValue: 540, rxOnly: true, level: 'Avanzado' },    // < 9 min Rx
      { maxValue: 720, rxOnly: true, level: 'Intermedio' },   // < 12 min Rx
    ],
  },
  karen: {
    scoringType: 'time',
    entries: [
      { maxValue: 420, rxOnly: true, level: 'Avanzado' },    // < 7 min Rx
      { maxValue: 660, rxOnly: true, level: 'Intermedio' },   // < 11 min Rx
    ],
  },
};

const LEVEL_ORDER: ExperienceLevel[] = ['Novato', 'Principiante', 'Intermedio', 'Avanzado'];

function levelIndex(level: ExperienceLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

/**
 * Check if a template result suggests the user should be at a higher level.
 * Returns a suggestion only if the result indicates a HIGHER level than current.
 */
export function checkLevelSuggestion(
  templateId: string,
  scoreValue: number,
  rxOrScaled: 'Rx' | 'Scaled',
  currentLevel: ExperienceLevel
): LevelSuggestion | null {
  const config = THRESHOLDS[templateId];
  if (!config) return null;

  const isRx = rxOrScaled === 'Rx';
  const templateName = templateId.charAt(0).toUpperCase() + templateId.slice(1);

  for (const entry of config.entries) {
    // Check if rxOnly requirement is met
    if (entry.rxOnly && !isRx) continue;

    let meetsThreshold = false;
    if (config.scoringType === 'time') {
      // For time: lower is better, check if score is UNDER the threshold
      meetsThreshold = scoreValue <= entry.maxValue;
    } else {
      // For rounds/reps: higher is better, check if score is AT OR ABOVE the threshold
      meetsThreshold = scoreValue >= entry.maxValue;
    }

    if (meetsThreshold && levelIndex(entry.level) > levelIndex(currentLevel)) {
      const formattedScore = config.scoringType === 'time'
        ? `${Math.floor(scoreValue / 60)}:${String(Math.round(scoreValue % 60)).padStart(2, '0')}`
        : `${scoreValue} rondas`;

      return {
        suggestedLevel: entry.level,
        reason: `Basado en tu resultado en ${templateName} (${formattedScore} ${rxOrScaled}), tu nivel podría ser ${entry.level}.`,
      };
    }
  }

  return null;
}
