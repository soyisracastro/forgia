'use client';

import dynamic from 'next/dynamic';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import OnboardingGuard from '@/components/onboarding/OnboardingGuard';
import OpenBanner from '@/components/open/OpenBanner';

const ChatAssistant = dynamic(() => import('@/components/chat/ChatAssistant'), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ChatProvider>
        <div className="min-h-screen flex flex-col">
          <OpenBanner />
          <AppHeader />
          <main className="container mx-auto px-4 py-8 max-w-4xl grow overflow-x-hidden">
            <OnboardingGuard>
              {children}
            </OnboardingGuard>
          </main>
          <AppFooter />
          <ChatAssistant />
        </div>
      </ChatProvider>
    </AuthProvider>
  );
}
