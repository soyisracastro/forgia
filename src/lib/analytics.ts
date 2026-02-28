function trackEvent(name: string, params?: Record<string, string | number | boolean | undefined>): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params);
  }
}

// --- Tier 1: Critical business events ---

export function trackSignupComplete(): void {
  trackEvent('signup_complete');
}

export function trackWodGenerated(level: string): void {
  trackEvent('wod_generated', { experience_level: level });
}

export function trackWodSaved(): void {
  trackEvent('wod_saved');
}

export function trackFeedbackSubmitted(difficulty: number, rxOrScaled: string): void {
  trackEvent('feedback_submitted', { difficulty_rating: difficulty, rx_or_scaled: rxOrScaled });
}

export function trackWorkoutStarted(): void {
  trackEvent('workout_started');
}

export function trackWorkoutCompleted(totalMinutes: number): void {
  trackEvent('workout_completed', { total_minutes: totalMinutes });
}

export function trackProfileUpdated(): void {
  trackEvent('profile_updated');
}

// --- Tier 2: Engagement events ---

export function trackOnboardingStep(step: number): void {
  trackEvent('onboarding_step', { step_number: step });
}

export function trackWodCopied(): void {
  trackEvent('wod_copied');
}

export function trackWodPrinted(): void {
  trackEvent('wod_printed');
}

// --- Open 2026 events ---

export function trackOpenWorkoutViewed(division: string, gender: string): void {
  trackEvent('open_workout_viewed', { division, gender });
}

export function trackOpenWorkoutStarted(division: string): void {
  trackEvent('open_workout_started', { division });
}
