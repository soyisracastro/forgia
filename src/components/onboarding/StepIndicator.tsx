'use client';

import { ArrowLeft } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  onBack?: () => void;
}

export default function StepIndicator({ currentStep, totalSteps = 4, onBack }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {currentStep > 1 ? (
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      ) : (
        <div />
      )}
      <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">
        {currentStep} de {totalSteps}
      </span>
    </div>
  );
}
