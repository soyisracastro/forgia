import { createClient } from '@/lib/supabase/client';
import type { PersonalRecord, PersonalRecordInput } from '@/types/personal-records';

export async function savePersonalRecord(
  userId: string,
  input: PersonalRecordInput
): Promise<PersonalRecord> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('personal_records')
    .insert({
      user_id: userId,
      movement_name: input.movement_name,
      record_type: input.record_type,
      value: input.value,
      unit: input.unit,
      date_achieved: input.date_achieved,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Error al guardar record: ${error.message}`);
  return data as PersonalRecord;
}

export async function getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .order('date_achieved', { ascending: false });

  if (error) throw new Error(`Error al cargar records: ${error.message}`);
  return (data ?? []) as PersonalRecord[];
}

export async function getRecordsForMovement(
  userId: string,
  movementName: string
): Promise<PersonalRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('movement_name', movementName)
    .order('date_achieved', { ascending: false });

  if (error) throw new Error(`Error al cargar records del movimiento: ${error.message}`);
  return (data ?? []) as PersonalRecord[];
}

/** Returns the most recent 1RM for each movement (best for WOD generation context). */
export async function getBestRecords(userId: string): Promise<PersonalRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('record_type', '1RM')
    .order('date_achieved', { ascending: false });

  if (error) throw new Error(`Error al cargar mejores records: ${error.message}`);

  // Deduplicate: keep only the most recent 1RM per movement
  const seen = new Set<string>();
  const best: PersonalRecord[] = [];
  for (const record of (data ?? []) as PersonalRecord[]) {
    if (!seen.has(record.movement_name)) {
      seen.add(record.movement_name);
      best.push(record);
    }
  }

  return best;
}

export async function deletePersonalRecord(recordId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('personal_records')
    .delete()
    .eq('id', recordId);

  if (error) throw new Error(`Error al eliminar record: ${error.message}`);
}
