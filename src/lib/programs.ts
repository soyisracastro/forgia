import { createClient } from '@/lib/supabase/client';
import type { ProgramWeek, MonthlyProgram } from '@/types/program';

export async function getActiveProgram(month: number, year: number): Promise<MonthlyProgram | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('training_programs')
    .select('*')
    .eq('month', month)
    .eq('year', year)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    month: data.month,
    year: data.year,
    weeks: data.structure as ProgramWeek[],
    created_at: data.created_at,
  };
}

export async function saveProgram(
  userId: string,
  month: number,
  year: number,
  weeks: ProgramWeek[]
): Promise<MonthlyProgram> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('training_programs')
    .upsert(
      {
        user_id: userId,
        month,
        year,
        structure: weeks,
      },
      { onConflict: 'user_id,month,year' }
    )
    .select()
    .single();

  if (error) throw new Error(`Error al guardar programa: ${error.message}`);

  return {
    id: data.id,
    user_id: data.user_id,
    month: data.month,
    year: data.year,
    weeks: data.structure as ProgramWeek[],
    created_at: data.created_at,
  };
}

export async function getWodCountThisWeek(): Promise<number> {
  const supabase = createClient();
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('wods')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekStart.toISOString());

  if (error) return 0;
  return count ?? 0;
}

/**
 * Returns the current program week number (1-4) based on day of month.
 */
export function getCurrentWeekNumber(): number {
  const day = new Date().getDate();
  return Math.min(Math.ceil(day / 7), 4);
}
