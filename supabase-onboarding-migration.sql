-- Phase 2: Add onboarding profile fields
-- Execute this in the Supabase SQL Editor AFTER running supabase-setup.sql

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age SMALLINT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS injury_history TEXT,
  ADD COLUMN IF NOT EXISTS objectives TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS training_type TEXT,
  ADD COLUMN IF NOT EXISTS equipment_level TEXT;

-- Constraints for valid enum values
ALTER TABLE public.profiles
  ADD CONSTRAINT chk_experience_level
    CHECK (experience_level IS NULL OR experience_level IN ('Principiante', 'Intermedio', 'Avanzado'));

ALTER TABLE public.profiles
  ADD CONSTRAINT chk_training_type
    CHECK (training_type IS NULL OR training_type IN ('CrossFit', 'Calistenia'));

ALTER TABLE public.profiles
  ADD CONSTRAINT chk_equipment_level
    CHECK (equipment_level IS NULL OR equipment_level IN (
      'Box completo',
      'Box equipado básico',
      'Peso corporal + equipamiento mínimo',
      'Superficies para ejercicios',
      'Equipamiento complementario'
    ));

ALTER TABLE public.profiles
  ADD CONSTRAINT chk_age
    CHECK (age IS NULL OR (age >= 13 AND age <= 120));

ALTER TABLE public.profiles
  ADD CONSTRAINT chk_objectives_length
    CHECK (objectives IS NULL OR array_length(objectives, 1) IS NULL OR array_length(objectives, 1) <= 2);
