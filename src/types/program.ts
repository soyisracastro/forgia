export type SessionIntensity = 'baja' | 'moderada' | 'alta' | 'muy alta';

export interface ProgramSession {
  order: number;
  type: string;
  emphasis: string;
  intensity: SessionIntensity;
}

export interface ProgramWeek {
  number: number;
  focus: string;
  skillFocus: string;
  sessions: ProgramSession[];
}

export interface MonthlyProgram {
  id: string;
  user_id: string;
  month: number;
  year: number;
  weeks: ProgramWeek[];
  created_at: string;
}
