'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/Spinner';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isOnboardingRoute = pathname === '/app/onboarding';
  const needsOnboarding = !profile || !profile.onboarding_completed;

  useEffect(() => {
    if (isLoading) return;

    if (needsOnboarding && !isOnboardingRoute) {
      router.replace('/app/onboarding');
    }

    if (!needsOnboarding && isOnboardingRoute) {
      router.replace('/app');
    }
  }, [isLoading, needsOnboarding, isOnboardingRoute, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  // Prevent flash of wrong content during redirect
  if (needsOnboarding && !isOnboardingRoute) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  if (!needsOnboarding && isOnboardingRoute) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
