export type RecordType = '1RM' | '3RM' | '5RM' | 'max_reps' | 'time';
export type RecordUnit = 'kg' | 'lbs' | 'reps' | 'seconds';

export interface PersonalRecord {
  id: string;
  user_id: string;
  movement_name: string;
  record_type: RecordType;
  value: number;
  unit: RecordUnit;
  date_achieved: string;
  notes: string | null;
  created_at: string;
}

export interface PersonalRecordInput {
  movement_name: string;
  record_type: RecordType;
  value: number;
  unit: RecordUnit;
  date_achieved: string;
  notes?: string | null;
}
