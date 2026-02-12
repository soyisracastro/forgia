import type { Wod } from '@/types/wod';
import type { ExperienceLevel } from '@/types/profile';

export type TemplateCategory = 'girl' | 'hero' | 'benchmark';
export type ScoringType = 'time' | 'rounds' | 'reps' | 'weight';

export interface WodTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  wod: Wod;
  difficulty: ExperienceLevel;
  equipmentRequired: string[];
  estimatedMinutes: number;
  description: string;
  scoringType: ScoringType;
  rxStandard: { men: string; women: string };
}

export interface TemplateResult {
  id: string;
  user_id: string;
  template_id: string;
  score_value: number;
  score_type: ScoringType;
  rx_or_scaled: 'Rx' | 'Scaled';
  notes: string | null;
  created_at: string;
}

export interface TemplateResultInput {
  template_id: string;
  score_value: number;
  score_type: ScoringType;
  rx_or_scaled: 'Rx' | 'Scaled';
  notes?: string | null;
}
