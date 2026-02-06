'use client';

const STEP_LABELS = ['Datos', 'Objetivos', 'Entrenamiento', 'Equipamiento'];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {STEP_LABELS.map((label, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isUpcoming = step > currentStep;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-red-500 text-white'
                    : isCurrent
                      ? 'bg-red-500 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium hidden sm:block ${
                  isUpcoming
                    ? 'text-neutral-400 dark:text-neutral-500'
                    : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {label}
              </span>
            </div>
            {step < STEP_LABELS.length && (
              <div
                className={`flex-1 h-0.5 mx-2 sm:mx-3 ${
                  isCompleted
                    ? 'bg-red-500'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
