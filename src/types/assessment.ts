import type { ExperienceLevel } from '@/types/profile';
import type { Wod } from '@/types/wod';

export type AssessmentStatus = 'pending' | 'passed' | 'failed';

export interface BenchmarkWod {
  id: string;
  fromLevel: ExperienceLevel;
  toLevel: ExperienceLevel;
  title: string;
  description: string;
  wod: Wod;
  passingCriteria: string;
}

export interface LevelAssessment {
  id: string;
  user_id: string;
  from_level: ExperienceLevel;
  to_level: ExperienceLevel;
  benchmark_id: string;
  status: AssessmentStatus;
  self_report: AssessmentSelfReport | null;
  created_at: string;
  completed_at: string | null;
}

export interface AssessmentSelfReport {
  completed: boolean;
  total_time_minutes: number | null;
  rounds_or_reps: string | null;
  rx_or_scaled: 'Rx' | 'Scaled';
  notes: string | null;
}
