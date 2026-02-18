'use client';

import { useState } from 'react';
import { Twitter, Linkedin, Share2, Check, MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: 'Twitter',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: Twitter,
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: MessageCircle,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: Linkedin,
    },
  ];

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-neutral-500 mr-1">
        Compartir:
      </span>
      {links.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Compartir en ${label}`}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-red-300 dark:hover:border-red-500/50 hover:text-red-500 transition-colors"
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
      <button
        onClick={copyToClipboard}
        aria-label="Copiar enlace"
        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-red-300 dark:hover:border-red-500/50 hover:text-red-500 transition-colors"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>
      {copied && (
        <span className="text-xs text-green-500 font-medium">Copiado</span>
      )}
    </div>
  );
}
