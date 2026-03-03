'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, X, SendHorizontal } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';
import type { Wod } from '@/types/wod';
import ChatMessageBubble from './ChatMessageBubble';

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  remainingMessages: number;
  streamingMessageId: string | null;
  wod: Wod | null;
  onSend: (text: string) => void;
  onClose: () => void;
}

function getQuickQuestions(wod: Wod | null): string[] {
  if (!wod) {
    return [
      '¿Cómo mejorar mi resistencia?',
      '¿Qué debo comer antes de entrenar?',
    ];
  }

  const questions = [
    '¿Qué peso debo usar en el metcon?',
    '¿Cómo escalar los movimientos?',
  ];

  // Add contextual question from first metcon movement
  const firstMovement = wod.metcon.movements?.[0];
  if (firstMovement) {
    const movementName = firstMovement.replace(/^\d+\s*/, '').split('(')[0].trim();
    questions.push(`¿Cuál es la técnica de ${movementName}?`);
  }

  questions.push('¿Qué zona de intensidad busca este WOD?');

  return questions;
}

export default function ChatPanel({
  messages,
  isStreaming,
  remainingMessages,
  streamingMessageId,
  wod,
  onSend,
  onClose,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const quickQuestions = getQuickQuestions(wod);
  const showQuickQuestions = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700/60 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-red-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Coach IA</h2>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Cerrar Coach IA"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
        {showQuickQuestions && (
          <div className="text-center py-6">
            <Sparkles className="h-8 w-8 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Pregúntame sobre tu WOD, ejercicios, progresiones, o cualquier duda de entrenamiento.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-red-300 dark:hover:border-red-500/50 hover:text-red-500 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            isStreaming={isStreaming && msg.id === streamingMessageId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Remaining messages indicator */}
      {remainingMessages <= 5 && (
        <div className="text-center px-4 py-1 shrink-0">
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            Te quedan {remainingMessages} mensaje{remainingMessages !== 1 ? 's' : ''} hoy
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700/60 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta algo sobre tu entrenamiento..."
            rows={1}
            disabled={isStreaming || remainingMessages <= 0}
            className="flex-1 px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700/60 bg-white dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming || remainingMessages <= 0}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-40 disabled:hover:bg-red-500 shrink-0"
            aria-label="Enviar mensaje"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
