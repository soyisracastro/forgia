'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Wod, WorkoutFeedback } from '@/types/wod';
import { generateWod } from '@/lib/gemini';
import { saveWod, getLatestWod, bulkInsertWods } from '@/lib/wods';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/Spinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import WodDisplay from '@/components/WodDisplay';
import CopyWodButton from '@/components/CopyWodButton';
import PrintWodButton from '@/components/PrintWodButton';
import WorkoutFeedbackForm from '@/components/WorkoutFeedbackForm';
import WorkoutAnalysis from '@/components/WorkoutAnalysis';
import TrainingIntelligenceCard from '@/components/TrainingIntelligenceCard';

const DiceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M8 8h.01"/><path d="M16 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/></svg>
);

const NoteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z"/></svg>
);

const ClipboardCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
);

export default function AppPage() {
  const { user } = useAuth();
  const [wod, setWod] = useState<Wod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLatest, setIsLoadingLatest] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [savedWodId, setSavedWodId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<WorkoutFeedback | null>(null);

  // Load latest saved WOD from Supabase on mount
  useEffect(() => {
    setCurrentDate(
      new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(new Date())
    );

    const loadLatest = async () => {
      try {
        const latest = await getLatestWod();
        if (latest) {
          setWod(latest.wod);
          setSavedWodId(latest.id);
        }
      } catch {
        // silently ignore – user can generate a fresh WOD
      } finally {
        setIsLoadingLatest(false);
      }
    };

    loadLatest();
  }, []);

  // One-time localStorage → Supabase migration
  useEffect(() => {
    if (!user) return;

    const migrateLocalStorage = async () => {
      try {
        const stored = localStorage.getItem('savedWods');
        if (!stored) return;

        const savedWods = JSON.parse(stored);
        if (!Array.isArray(savedWods) || savedWods.length === 0) return;

        const toMigrate = savedWods.map((s: { wod: Wod; savedAt: string }) => ({
          wod: s.wod,
          created_at: s.savedAt,
        }));

        await bulkInsertWods(user.id, toMigrate);
        localStorage.removeItem('savedWods');
        localStorage.removeItem('lastWod');
      } catch (e) {
        console.error('localStorage migration failed:', e);
      }
    };

    migrateLocalStorage();
  }, [user]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setWod(null);
    setJustSaved(false);
    setSavedWodId(null);
    setShowFeedback(false);
    setSavedFeedback(null);

    try {
      const newWod = await generateWod(
        sessionNotes.trim() ? { sessionNotes: sessionNotes.trim() } : undefined
      );
      setWod(newWod);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error desconocido al generar el WOD.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionNotes]);

  const handleSaveWod = useCallback(async () => {
    if (!wod || !user) return;

    try {
      const saved = await saveWod(user.id, wod);
      setSavedWodId(saved.id);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      console.error('Error saving WOD:', err);
    }
  }, [wod, user]);

  const handleFeedbackSaved = useCallback((feedback: WorkoutFeedback) => {
    setSavedFeedback(feedback);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <h3 className="text-lg text-neutral-500 dark:text-neutral-400 mb-4">Personalizando tu infierno diario...</h3>
          <Spinner />
        </div>
      );
    }
    if (error) {
      return <ErrorDisplay message={error} />;
    }
    if (isLoadingLatest) {
      return (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      );
    }
    if (wod) {
      return (
        <>
          <WodDisplay wod={wod} />
          <div data-print-hide className="flex flex-wrap justify-center gap-3 mt-8">
            <CopyWodButton wod={wod} />
            <PrintWodButton />
            <button
              onClick={handleSaveWod}
              disabled={justSaved || !!savedWodId}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900 disabled:opacity-60"
            >
              {justSaved ? 'Guardado!' : savedWodId ? 'Guardado' : 'Guardar WOD'}
            </button>
            {!savedFeedback && (
              <button
                onClick={() => setShowFeedback((prev) => !prev)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900"
              >
                <ClipboardCheckIcon className="h-4 w-4" />
                {showFeedback ? 'Ocultar' : 'Registrar Resultado'}
              </button>
            )}
          </div>

          {/* Feedback form */}
          {showFeedback && !savedFeedback && user && (
            <div data-print-hide className="mt-6">
              <WorkoutFeedbackForm
                wod={wod}
                wodId={savedWodId}
                userId={user.id}
                onSaved={handleFeedbackSaved}
              />
            </div>
          )}

          {/* Analysis (after feedback saved) */}
          {savedFeedback && (
            <div data-print-hide className="mt-6">
              <WorkoutAnalysis feedback={savedFeedback} />
            </div>
          )}
        </>
      );
    }
    return (
      <div className="text-center py-16">
        <DiceIcon className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
        <h3 className="text-lg font-medium text-neutral-500 dark:text-neutral-400 mb-2">No hay WOD todavía</h3>
        <p className="text-sm text-neutral-400 dark:text-neutral-500">Haz clic en &ldquo;Generar WOD&rdquo; para crear tu entrenamiento del día.</p>
      </div>
    );
  };

  return (
    <>
      <div className="mb-2">
        <h1 className="print-title text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100">WOD del Día</h1>
        <p className="print-date text-neutral-500 dark:text-neutral-400 text-sm mt-1">{currentDate}</p>
      </div>

      <TrainingIntelligenceCard />

      <div data-print-hide className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Tu Entrenamiento</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes((prev) => !prev)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900"
          >
            <NoteIcon className="h-4 w-4" />
            {showNotes ? 'Ocultar notas' : 'Notas de sesión'}
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 dark:focus:ring-offset-neutral-900"
          >
            <DiceIcon className="h-4 w-4" />
            {wod ? 'Generar Nuevo' : 'Generar WOD'}
          </button>
        </div>
      </div>

      {showNotes && (
        <div data-print-hide className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <label htmlFor="sessionNotes" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Notas para esta sesión (opcional)
          </label>
          <textarea
            id="sessionNotes"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Ej: Hoy me duele la rodilla izquierda, quiero enfoque en gimnásticos..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            rows={2}
          />
        </div>
      )}

      {renderContent()}
    </>
  );
}
