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
