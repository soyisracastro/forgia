import type { Metadata } from 'next';
import AppShell from './AppShell';

export const metadata: Metadata = {
  title: {
    template: '%s | Forgia',
    default: 'Forgia',
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
