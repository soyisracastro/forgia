import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 max-w-4xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-semibold text-red-500">
              Forgia
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <Link
              href="/blog"
              className="text-xl font-semibold text-neutral-900 dark:text-neutral-100"
            >
              Blog
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="grow max-w-4xl mx-auto px-4 py-8 md:py-12 w-full">
        {children}
      </main>

      <footer className="text-center py-6 text-neutral-500 text-sm border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex justify-center gap-4 mb-2">
          <Link
            href="/privacidad"
            className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            Aviso de Privacidad
          </Link>
          <span>|</span>
          <Link
            href="/terminos"
            className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            Términos y Condiciones
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Forgia. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
