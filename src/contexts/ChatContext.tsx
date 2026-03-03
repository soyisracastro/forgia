'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { Wod } from '@/types/wod';

interface ChatContextType {
  currentWod: Wod | null;
  setCurrentWod: (wod: Wod | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [currentWod, setCurrentWodState] = useState<Wod | null>(null);
  const setCurrentWod = useCallback((wod: Wod | null) => setCurrentWodState(wod), []);

  return (
    <ChatContext.Provider value={{ currentWod, setCurrentWod }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
