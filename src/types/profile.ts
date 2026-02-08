export type ExperienceLevel = 'Principiante' | 'Intermedio' | 'Avanzado';

export type Objective =
  | 'Ganar fuerza'
  | 'Ganar masa muscular'
  | 'Perder peso'
  | 'Reducir tallas'
  | 'Mejorar resistencia'
  | 'Mejorar movilidad'
  | 'Preparación para competencia';

export type TrainingType = 'CrossFit' | 'Calistenia';

export type CrossFitEquipment =
  | 'Box completo'
  | 'Box equipado básico'
  | 'Peso corporal + equipamiento mínimo';

export type CalisteniaEquipment =
  | 'Superficies para ejercicios'
  | 'Equipamiento complementario';

export type EquipmentLevel = CrossFitEquipment | CalisteniaEquipment;

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  age: number | null;
  experience_level: ExperienceLevel | null;
  injury_history: string | null;
  objectives: Objective[] | null;
  training_type: TrainingType | null;
  equipment_level: EquipmentLevel | null;
  terms_accepted_at: string | null;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
}
