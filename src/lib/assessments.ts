import { createClient } from '@/lib/supabase/client';
import type { LevelAssessment } from '@/types/assessment';

export async function getLatestAssessment(): Promise<LevelAssessment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('level_assessments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as LevelAssessment;
}

export async function shouldSuggestAssessment(): Promise<boolean> {
  const supabase = createClient();

  // Check profile updated_at — if 4+ weeks at current level
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('updated_at')
    .single();

  if (error || !profile?.updated_at) return false;

  const updatedAt = new Date(profile.updated_at);
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  return updatedAt <= fourWeeksAgo;
}
