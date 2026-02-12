'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { ExperienceLevel, Objective, EquipmentLevel, WeightUnit } from '@/types/profile';
import { ArrowRight } from 'lucide-react';
import { trackSignupComplete, trackOnboardingStep } from '@/lib/analytics';
import StepIndicator from './StepIndicator';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Objectives from './Step2Objectives';
import Step4Equipment from './Step4Equipment';
import Step4Frequency from './Step4Frequency';

interface FormData {
  name: string;
  age: number | '';
  experienceLevel: ExperienceLevel | null;
  injuryHistory: string;
  weightUnit: WeightUnit;
  objectives: Objective[];
  equipmentLevel: EquipmentLevel | null;
  trainingFrequency: number | null;
}

export default function OnboardingWizard() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    experienceLevel: null,
    injuryHistory: '',
    weightUnit: 'lbs' as WeightUnit,
    objectives: [],
    equipmentLevel: null,
    trainingFrequency: null,
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          formData.name.trim() !== '' &&
          typeof formData.age === 'number' &&
          formData.age >= 13 &&
          formData.age <= 120 &&
          formData.experienceLevel !== null
        );
      case 2:
        return formData.objectives.length >= 1;
      case 3:
        return formData.equipmentLevel !== null;
      case 4:
        return formData.trainingFrequency !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep) && currentStep < 4) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      trackOnboardingStep(nextStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !isStepValid(4)) return;

    setIsSubmitting(true);
    setError('');

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email!,
        display_name: formData.name.trim(),
        age: formData.age as number,
        experience_level: formData.experienceLevel,
        injury_history: formData.injuryHistory.trim() || null,
        objectives: formData.objectives,
        training_type: 'CrossFit',
        equipment_level: formData.equipmentLevel,
        weight_unit: formData.weightUnit,
        training_frequency: formData.trainingFrequency,
        onboarding_completed: true,
      });

    if (updateError) {
      setError('No se pudo guardar tu perfil. Inténtalo de nuevo.');
      setIsSubmitting(false);
      return;
    }

    await refreshProfile();
    trackSignupComplete();
    router.push('/app');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            data={{
              name: formData.name,
              age: formData.age,
              experienceLevel: formData.experienceLevel,
              injuryHistory: formData.injuryHistory,
              weightUnit: formData.weightUnit,
            }}
            onChange={(updates) => updateFormData(updates)}
          />
        );
      case 2:
        return (
          <Step2Objectives
            selectedObjectives={formData.objectives}
            onChange={(objectives) => updateFormData({ objectives })}
          />
        );
      case 3:
        return (
          <Step4Equipment
            selectedEquipment={formData.equipmentLevel}
            onChange={(equipmentLevel) => updateFormData({ equipmentLevel })}
          />
        );
      case 4:
        return (
          <Step4Frequency
            selectedFrequency={formData.trainingFrequency}
            onChange={(trainingFrequency) => updateFormData({ trainingFrequency })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator currentStep={currentStep} onBack={handlePrev} />

      <div className="min-h-[320px]">
        {renderStep()}
      </div>

      {error && (
        <div className="mt-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid(currentStep)}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300 dark:disabled:bg-red-500/30 disabled:cursor-not-allowed"
          >
            Siguiente
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isStepValid(4) || isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300 dark:disabled:bg-red-500/30 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : 'Completar'}
          </button>
        )}
      </div>
    </div>
  );
}
