'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateDisplayName } from '@/lib/profiles';
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Zap,
  Save,
  Loader2,
  Check,
} from 'lucide-react';

function formatDate(isoString: string | null): string {
  if (!isoString) return 'No disponible';
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(isoString));
}

export default function CuentaPage() {
  const { user, profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  const hasChanges = displayName.trim() !== (profile?.display_name || '');
  const isValid = displayName.trim().length > 0;

  const handleSave = async () => {
    if (!user || !isValid || !hasChanges) return;

    setIsSaving(true);
    setError('');

    try {
      await updateDisplayName(user.id, displayName.trim());
      await refreshProfile();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          Cuenta
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
          Administra tu información personal y suscripción.
        </p>
      </div>

      {/* Account Information */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <User className="w-5 h-5 text-neutral-400" />
          Información Personal
        </h2>

        {/* Email (read-only) */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            <Mail className="w-3.5 h-3.5 text-neutral-400" />
            Email
          </label>
          <div className="px-3 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            {user?.email}
          </div>
        </div>

        {/* Display Name (editable) */}
        <div>
          <label htmlFor="account-name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="account-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out text-sm"
          />
        </div>

        {/* Member since */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            Miembro desde
          </label>
          <div className="px-3 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            {formatDate(profile.created_at)}
          </div>
        </div>

        {/* Save name */}
        {hasChanges && (
          <div className="pt-2">
            {showSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl text-sm mb-3">
                <Check className="w-4 h-4 shrink-0" />
                Nombre actualizado correctamente.
              </div>
            )}
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm mb-3">
                {error}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !isValid}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Nombre
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* Plan */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700">
            <CreditCard className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Plan actual
          </h2>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/50">
          <Zap className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Plan Gratuito
          </span>
        </div>

        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Funciones premium y planes de suscripción estarán disponibles próximamente.
        </p>
      </section>

      {/* Danger Zone */}
      <section className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Zona de Peligro
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Estas acciones son permanentes y no se pueden deshacer.
        </p>
        <button
          disabled
          className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded-lg opacity-50 cursor-not-allowed"
        >
          Eliminar cuenta (próximamente)
        </button>
      </section>
    </div>
  );
}
