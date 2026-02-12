'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import OnboardingGuard from '@/components/onboarding/OnboardingGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-4xl grow overflow-x-hidden">
          <OnboardingGuard>
            {children}
          </OnboardingGuard>
        </main>
        <AppFooter />
      </div>
    </AuthProvider>
  );
}
