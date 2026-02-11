export interface WodSection {
  title: string;
  duration?: string;
  parts?: string[];
  details?: string[];
  type?: string;
  description?: string;
  movements?: string[];
  notes?: string;
}

export interface Wod {
  title: string;
  warmUp: WodSection;
  strengthSkill: WodSection;
  metcon: WodSection;
  coolDown: WodSection;
}

export interface GenerateWodRequest {
  sessionNotes?: string;
}

export interface SavedWod {
  id: string;
  user_id: string;
  wod: Wod;
  created_at: string;
}

export type RxOrScaled = 'Rx' | 'Scaled';

export interface WorkoutFeedback {
  id: string;
  user_id: string;
  wod_id: string | null;
  wod_snapshot: Wod;
  difficulty_rating: number;
  total_time_minutes: number | null;
  rx_or_scaled: RxOrScaled;
  notes: string | null;
  gemini_analysis: GeminiAnalysis | null;
  created_at: string;
}

export interface WorkoutFeedbackInput {
  wod_id?: string | null;
  wod_snapshot: Wod;
  difficulty_rating: number;
  total_time_minutes?: number | null;
  rx_or_scaled: RxOrScaled;
  notes?: string | null;
}

export interface GeminiAnalysis {
  resumen: string;
  fortalezas: string[];
  areas_mejora: string[];
  recomendaciones: string[];
  progresion_sugerida: string;
}

