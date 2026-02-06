'use client';

import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export default function OnboardingPage() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        Bienvenido
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8">
        Configuremos tu perfil para personalizar tus entrenamientos.
      </p>
      <OnboardingWizard />
    </div>
  );
}
