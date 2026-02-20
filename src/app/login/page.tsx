'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// Mapeo de errores de Supabase a español
const errorTranslations: Record<string, string> = {
  'Invalid login credentials': 'Credenciales de acceso inválidas. Verifica tu correo y contraseña.',
  'Email not confirmed': 'Tu correo no ha sido confirmado. Revisa tu bandeja de entrada.',
  'User already registered': 'Este correo ya está registrado. Intenta iniciar sesión.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'El formato del correo electrónico no es válido.',
  'email rate limit exceeded': 'Has excedido el límite de intentos. Intenta de nuevo más tarde.',
  'For security purposes, you can only request this once every 60 seconds': 'Por seguridad, solo puedes intentar esto una vez cada 60 segundos.',
  'Error sending recovery email': 'Error al enviar el correo de recuperación. Verifica que el correo esté registrado e intenta de nuevo.',
};

function translateError(message: string): string {
  return errorTranslations[message] || message;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (isSignUp && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(translateError(error.message));
      } else {
        if (data.user) {
          await supabase
            .from('profiles')
            .update({ terms_accepted_at: new Date().toISOString() })
            .eq('id', data.user.id);
        }
        setMessage('Revisa tu correo para confirmar tu cuenta.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translateError(error.message));
      } else {
        window.location.href = '/app';
      }
    }

    setLoading(false);
  };

  const handleToggle = (signUp: boolean) => {
    setIsSignUp(signUp);
    setIsForgotPassword(false);
    setTermsAccepted(false);
    setError('');
    setMessage('');
    setConfirmPassword('');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(translateError(error.message));
    } else {
      setMessage('Te hemos enviado un correo con instrucciones para restablecer tu contraseña.');
    }

    setLoading(false);
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#181111] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-neutral-200 dark:border-neutral-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 pt-10">
          <Link 
            href="/" 
            className="flex items-center justify-center w-10 h-10 rounded-full text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-red-500">Forgia</h1>
          <div className="w-10" />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 px-6 pb-8">
          {isForgotPassword ? (
            /* Forgot Password Form */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">Recuperar contraseña</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Te enviaremos un enlace para restablecer tu contraseña</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Correo electrónico
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoCorrect="off"
                      autoCapitalize="none"
                      className="block w-full pl-10 pr-3 py-3.5 bg-white dark:bg-[#221010] border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                      placeholder="hola@ejemplo.com"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {message && (
                  <div className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-200 px-4 py-3 rounded-xl text-sm">
                    {message}
                  </div>
                )}

                {/* Spacer */}
                <div className="pt-2" />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-red-500/30 text-base font-semibold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-neutral-900"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>

                {/* Back to Login */}
                <div className="flex justify-center mt-2">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-500 transition-colors"
                  >
                    ← Volver a iniciar sesión
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Login / Signup Form */
            <>
              {/* Toggle / Segmented Control */}
              <div className="flex p-1 mb-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleToggle(false)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    !isSignUp
                      ? 'text-white bg-red-500 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(true)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isSignUp
                      ? 'text-white bg-red-500 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {/* Welcome Text (only for signup) */}
              {isSignUp && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">Empieza tu viaje</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Crea una cuenta para guardar tu historial de WODs</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Correo electrónico
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoCorrect="off"
                      autoCapitalize="none"
                      className="block w-full pl-10 pr-3 py-3.5 bg-white dark:bg-[#221010] border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                      placeholder="hola@ejemplo.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="block w-full pl-10 pr-10 py-3.5 bg-white dark:bg-[#221010] border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field (only for signup) */}
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Confirmar contraseña
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22c-4 0-8-6-8-10a8 8 0 1 1 16 0c0 4-4 10-8 10z"/><path d="M8 11h8"/><path d="M12 7v8"/>
                        </svg>
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="block w-full pl-10 pr-10 py-3.5 bg-white dark:bg-[#221010] border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Terms checkbox (only for signup) */}
                {isSignUp && (
                  <div className="flex items-start gap-3 pt-2">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-red-500 focus:ring-red-500"
                    />
                    <label htmlFor="terms" className="text-sm text-neutral-600 dark:text-neutral-400">
                      Acepto los{' '}
                      <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600 underline">
                        Términos y Condiciones
                      </a>{' '}
                      y el{' '}
                      <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600 underline">
                        Aviso de Privacidad
                      </a>
                    </label>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {message && (
                  <div className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-200 px-4 py-3 rounded-xl text-sm">
                    {message}
                  </div>
                )}

                {/* Spacer */}
                <div className="pt-2" />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || (isSignUp && !termsAccepted)}
                  className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-red-500/30 text-base font-semibold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-neutral-900"
                >
                  {loading ? 'Cargando...' : isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </button>

                {/* Forgot Password (only for login) */}
                {!isSignUp && (
                  <div className="flex justify-center mt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-500 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
