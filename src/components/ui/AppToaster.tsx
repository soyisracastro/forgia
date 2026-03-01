'use client';

import { Toaster } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

export default function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-center"
      theme={theme}
      richColors
      duration={4000}
      toastOptions={{
        classNames: {
          success: 'border-emerald-500/30',
          error: 'border-red-500/30',
          warning: 'border-amber-500/30',
          info: 'border-blue-500/30',
        },
      }}
    />
  );
}
