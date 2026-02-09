'use client';

const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

interface PrintWodButtonProps {
  variant?: 'default' | 'icon';
}

export default function PrintWodButton({ variant = 'default' }: PrintWodButtonProps) {
  if (variant === 'icon') {
    return (
      <button
        onClick={() => window.print()}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors print:hidden"
        aria-label="Imprimir"
      >
        <PrinterIcon />
      </button>
    );
  }

  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900 print:hidden"
    >
      <PrinterIcon />
      Imprimir
    </button>
  );
}
