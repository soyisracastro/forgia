export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export interface ChatHistoryEntry {
  role: ChatRole;
  content: string;
}
