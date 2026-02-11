import { createClient } from '@/lib/supabase/client';
import type { ExperienceLevel, Objective, TrainingType, EquipmentLevel } from '@/types/profile';

export interface ProfileUpdateInput {
  display_name: string;
  age: number;
  experience_level: ExperienceLevel;
  injury_history: string | null;
  objectives: Objective[];
  training_type: TrainingType;
  equipment_level: EquipmentLevel;
  training_frequency: number | null;
}

export async function updateProfile(userId: string, input: ProfileUpdateInput): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.display_name,
      age: input.age,
      experience_level: input.experience_level,
      injury_history: input.injury_history,
      objectives: input.objectives,
      training_type: input.training_type,
      equipment_level: input.equipment_level,
      training_frequency: input.training_frequency,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw new Error(`Error al actualizar perfil: ${error.message}`);
}
