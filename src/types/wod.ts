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

export type Level = 'Principiante' | 'Intermedio' | 'Avanzado';
export type Location = 'Box' | 'Casa';
export type Equipment = 'Completo' | 'Peso Corporal';

export interface GenerateWodParams {
  location: Location;
  equipment: Equipment;
  level: Level;
  injury?: string;
}
