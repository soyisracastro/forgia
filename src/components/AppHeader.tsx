'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import { Menu, X, LogOut } from 'lucide-react';

const navLinks = [
  { href: '/app', label: 'WOD' },
  { href: '/app/biblioteca', label: 'Biblioteca' },
  { href: '/app/records', label: 'Records' },
  { href: '/app/historia', label: 'Historia' },
  { href: '/app/perfil', label: 'Perfil' },
  { href: '/app/cuenta', label: 'Cuenta' },
];

export default function AppHeader() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/app', label: 'WOD' },
    { href: '/app/biblioteca', label: 'Biblioteca' },
    { href: '/app/records', label: 'Records' },
    { href: '/app/historia', label: 'Historia' },
    { href: '/app/perfil', label: 'Perfil' },
    { href: '/app/cuenta', label: 'Cuenta' },
  ];

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [menuOpen]);

  return (
    <header className="py-6 border-b border-neutral-200 dark:border-neutral-800">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/app" className="flex items-center gap-2 text-xl font-semibold text-red-500">
              <Image src="/apple-touch-icon.png" alt="" width={24} height={24} className="rounded-md" />
              Forgia
            </Link>
            {/* Desktop nav */}
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
            {/* Desktop: profile name + theme + sign out */}
            {profile && (
              <Link
                href="/app/perfil"
                className="hidden sm:inline text-sm text-neutral-500 dark:text-neutral-400 hover:text-red-500 transition-colors"
              >
                {profile.display_name || profile.email}
              </Link>
            )}
            <span className="hidden sm:inline">
              <ThemeToggle />
            </span>
            <button
              onClick={signOut}
              className="hidden sm:inline text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Salir
            </button>
            {/* Mobile: hamburger button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="absolute top-0 right-0 h-full w-72 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-xl flex flex-col">
            {/* Menu header */}
            <div className="flex items-center justify-between px-5 py-6 border-b border-neutral-200 dark:border-neutral-800">
              <span className="flex items-center gap-2 text-lg font-semibold text-red-500">
                <Image src="/apple-touch-icon.png" alt="" width={22} height={22} className="rounded-md" />
                Forgia
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile info */}
            {profile && (
              <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {profile.display_name || 'Atleta'}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {profile.email}
                </p>
              </div>
            )}

            {/* Navigation links */}
            <nav className="flex-1 py-3 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-5 py-3 text-base font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-red-500 bg-red-50 dark:bg-red-500/10'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Bottom section: theme + sign out */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 px-5 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Tema</span>
                <ThemeToggle />
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="flex items-center gap-2 w-full py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
