import { createClient } from '@/lib/supabase/client';
import type { Wod, SavedWod, WorkoutFeedback, WorkoutFeedbackInput } from '@/types/wod';

export async function saveWod(userId: string, wod: Wod): Promise<SavedWod> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('wods')
    .insert({ user_id: userId, wod })
    .select()
    .single();

  if (error) throw new Error(`Error al guardar WOD: ${error.message}`);
  return data as SavedWod;
}

export async function getWodHistory(): Promise<SavedWod[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('wods')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al cargar historial: ${error.message}`);
  return (data ?? []) as SavedWod[];
}

export async function deleteWod(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('wods')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Error al eliminar WOD: ${error.message}`);
}

export async function getLatestWod(): Promise<SavedWod | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('wods')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw new Error(`Error al cargar último WOD: ${error.message}`);
  return (data && data.length > 0 ? data[0] : null) as SavedWod | null;
}

export async function bulkInsertWods(
  userId: string,
  wods: { wod: Wod; created_at: string }[]
): Promise<void> {
  if (wods.length === 0) return;
  const supabase = createClient();
  const rows = wods.map((w) => ({ user_id: userId, wod: w.wod, created_at: w.created_at }));
  const { error } = await supabase.from('wods').insert(rows);
  if (error) throw new Error(`Error en migración de WODs: ${error.message}`);
}

// --- Workout Feedback ---

export async function saveFeedback(userId: string, input: WorkoutFeedbackInput): Promise<WorkoutFeedback> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workout_feedback')
    .insert({
      user_id: userId,
      wod_id: input.wod_id ?? null,
      wod_snapshot: input.wod_snapshot,
      difficulty_rating: input.difficulty_rating,
      total_time_minutes: input.total_time_minutes ?? null,
      rx_or_scaled: input.rx_or_scaled,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Error al guardar resultado: ${error.message}`);
  return data as WorkoutFeedback;
}

export async function getFeedbackForWod(wodId: string): Promise<WorkoutFeedback | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workout_feedback')
    .select('*')
    .eq('wod_id', wodId)
    .maybeSingle();

  if (error) throw new Error(`Error al cargar feedback: ${error.message}`);
  return data as WorkoutFeedback | null;
}

export async function getRecentFeedback(limit = 5): Promise<WorkoutFeedback[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workout_feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Error al cargar feedback reciente: ${error.message}`);
  return (data ?? []) as WorkoutFeedback[];
}

export async function getWodIdsWithFeedback(): Promise<Set<string>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workout_feedback')
    .select('wod_id')
    .not('wod_id', 'is', null);

  if (error) throw new Error(`Error al cargar indicadores de feedback: ${error.message}`);
  return new Set((data ?? []).map((row) => row.wod_id as string));
}
