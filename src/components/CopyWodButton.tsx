'use client';

import { useState } from 'react';
import type { Wod } from '@/types/wod';
import { formatWodAsText } from '@/lib/formatWodAsText';
import { trackWodCopied } from '@/lib/analytics';

const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface CopyWodButtonProps {
  wod: Wod;
  variant?: 'default' | 'icon';
}

export default function CopyWodButton({ wod, variant = 'default' }: CopyWodButtonProps) {
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatWodAsText(wod);
    await navigator.clipboard.writeText(text);
    setJustCopied(true);
    trackWodCopied();
    setTimeout(() => setJustCopied(false), 2000);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCopy}
        disabled={justCopied}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 print:hidden"
        aria-label={justCopied ? 'Copiado' : 'Copiar WOD'}
      >
        {justCopied ? <CheckIcon /> : <ClipboardIcon />}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      disabled={justCopied}
      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900 disabled:opacity-60 print:hidden"
    >
      {justCopied ? <CheckIcon /> : <ClipboardIcon />}
      {justCopied ? 'Copiado!' : 'Copiar WOD'}
    </button>
  );
}
