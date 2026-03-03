'use client';

import { useRef, useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

const LONG_PRESS_MS = 500;

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

/** Parse inline markdown: [links](url), **bold**, and *italic* */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match [link](url), **bold**, or *italic* (non-greedy)
  const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      // [text](url)
      nodes.push(
        <a
          key={match.index}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      // **bold**
      nodes.push(<strong key={match.index} className="font-semibold">{match[4]}</strong>);
    } else if (match[5]) {
      // *italic*
      nodes.push(<em key={match.index}>{match[5]}</em>);
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

/** Render markdown text as React nodes: paragraphs, lists, bold, italic */
function FormattedContent({ text }: { text: string }) {
  const blocks = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let key = 0;

  function flushList() {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key++}`} className="list-disc list-inside space-y-0.5 my-1">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  }

  for (const line of blocks) {
    const trimmed = line.trim();

    // List items: "* item", "- item", "· item"
    const listMatch = trimmed.match(/^[\*\-·]\s+(.+)/);
    if (listMatch) {
      currentList.push(
        <li key={`li-${key++}`}>{renderInline(listMatch[1])}</li>
      );
      continue;
    }

    // Non-list line: flush any pending list
    flushList();

    if (trimmed === '') {
      // Blank line = paragraph break (add spacing)
      elements.push(<span key={`br-${key++}`} className="block h-2" />);
    } else {
      elements.push(
        <span key={`p-${key++}`} className="block">{renderInline(trimmed)}</span>
      );
    }
  }

  // Flush any remaining list
  flushList();

  return <>{elements}</>;
}

export default function ChatMessageBubble({ message, isStreaming }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  const isEmptyStreaming = isStreaming && !isUser && !message.content;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyToClipboard = useCallback(() => {
    if (!message.content || isStreaming) return;
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [message.content, isStreaming]);

  const handlePressStart = useCallback(() => {
    if (isUser || isStreaming || !message.content) return;
    timerRef.current = setTimeout(() => {
      copyToClipboard();
    }, LONG_PRESS_MS);
  }, [isUser, isStreaming, message.content, copyToClipboard]);

  const handlePressEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative group max-w-[85%] px-4 py-2.5 text-sm leading-relaxed select-none ${
          isUser
            ? 'bg-red-500 text-white rounded-2xl rounded-br-sm'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-2xl rounded-bl-sm'
        }`}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        onContextMenu={(e) => {
          if (!isUser && message.content && !isStreaming) {
            e.preventDefault();
            copyToClipboard();
          }
        }}
      >
        {isEmptyStreaming ? (
          <TypingIndicator />
        ) : (
          <>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div>
                <FormattedContent text={message.content} />
              </div>
            )}
            {isStreaming && !isUser && (
              <span className="inline-block w-1.5 h-4 ml-0.5 -mb-0.5 bg-red-500 animate-timer-pulse" />
            )}
          </>
        )}

        {/* Copy button: visible on hover (desktop) or after long press feedback */}
        {!isUser && message.content && !isStreaming && (
          <button
            onClick={copyToClipboard}
            className={`absolute -bottom-3 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition-all duration-200 ${
              copied
                ? 'opacity-100 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                : 'opacity-0 group-hover:opacity-100 bg-white dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 shadow-sm border border-neutral-200 dark:border-neutral-600'
            }`}
            aria-label="Copiar respuesta"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copiar</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
