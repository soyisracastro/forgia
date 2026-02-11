'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function AppHeader() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/app', label: 'WOD' },
    { href: '/app/programa', label: 'Programa' },
    { href: '/app/historia', label: 'Historia' },
    { href: '/app/perfil', label: 'Perfil' },
  ];

  return (
    <header className="py-6 border-b border-neutral-200 dark:border-neutral-800">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/app" className="text-xl font-semibold text-red-500">
              Forgia
            </Link>
            <nav className="hidden sm:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-red-500'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <Link
                href="/app/perfil"
                className="hidden sm:inline text-sm text-neutral-500 dark:text-neutral-400 hover:text-red-500 transition-colors"
              >
                {profile.display_name || profile.email}
              </Link>
            )}
            <ThemeToggle />
            <button
              onClick={signOut}
              className="text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="flex sm:hidden items-center gap-4 mt-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-red-500'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
