'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Revisa tu correo para confirmar tu cuenta.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = '/app';
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="text-2xl font-semibold text-red-500 mb-4">Forgia</p>
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {isSignUp
              ? 'Crea una cuenta para guardar tu historial de WODs'
              : 'Inicia sesión para acceder a tu historial'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Correo electr&oacute;nico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out sm:text-sm"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Contrase&ntilde;a
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out sm:text-sm"
              placeholder="M&iacute;nimo 6 caracteres"
            />
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2.5 text-base font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 dark:focus:ring-offset-neutral-900"
          >
            {loading ? 'Cargando...' : isSignUp ? 'Crear cuenta' : 'Iniciar sesi\u00F3n'}
          </button>
        </form>

        <div className="text-center space-y-3">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setMessage('');
            }}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            {isSignUp ? '\u00BFYa tienes cuenta? Inicia sesi\u00F3n' : '\u00BFNo tienes cuenta? Cr\u00E9ala aqu\u00ED'}
          </button>

          <div>
            <Link
              href="/"
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              &larr; Volver sin iniciar sesi&oacute;n
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
