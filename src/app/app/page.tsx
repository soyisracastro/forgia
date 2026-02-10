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
import LiveWorkoutOverlay from '@/components/live/LiveWorkoutOverlay';

// --- SVG Icons ---

const BoltIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M13 3v7h6l-8 11v-7H5l8-11z"/></svg>
);

const DiceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M8 8h.01"/><path d="M16 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/></svg>
);

const ClipboardCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
);

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="6 3 20 12 6 21 6 3"/></svg>
);

const BookmarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
);

const BookmarkCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/><path d="m9 10 2 2 4-4"/></svg>
);

const LOADING_PHRASES = [
  'Personalizando tu infierno diario...',
  'Consultando con el dios de los burpees...',
  'Calculando cuánto vas a sufrir hoy...',
  'Preparando tu dosis de humildad...',
  'La IA está eligiendo tus movimientos favoritos (los que odias)...',
  'Generando excusas creativas para mañana...',
  'Activando modo "no pain, no gain"...',
  'Mezclando sudor, lágrimas y wall balls...',
  'Preguntándole a ChatGPT si eres capaz...',
  'Diseñando tu nueva relación amor-odio con el gimnasio...',
  'Cargando el soundtrack perfecto para tus gemidos...',
  'Invocando el espíritu de Rich Froning...',
];

export default function AppPage() {
  const { user } = useAuth();
  const [wod, setWod] = useState<Wod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLatest, setIsLoadingLatest] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [savedWodId, setSavedWodId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<WorkoutFeedback | null>(null);
  const [showLiveMode, setShowLiveMode] = useState(false);
  const [liveWorkoutTime, setLiveWorkoutTime] = useState<number | null>(null);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

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

  // Rotate loading phrases every 2 seconds
  useEffect(() => {
    if (!isLoading) {
      setLoadingPhraseIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setWod(null);
    setJustSaved(false);
    setSavedWodId(null);
    setShowFeedback(false);
    setSavedFeedback(null);
    setLiveWorkoutTime(null);

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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Spinner />
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 min-h-6 transition-opacity duration-300">
            {LOADING_PHRASES[loadingPhraseIndex]}
          </p>
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
      {/* Page header */}
      <div className="mb-6">
        <h1 className="print-title text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100">Tu Entrenamiento</h1>
        <p className="print-date text-neutral-500 dark:text-neutral-400 text-sm mt-1">{currentDate}</p>
      </div>

      <TrainingIntelligenceCard />

      {/* Session notes — always visible */}
      <div data-print-hide className="mb-6">
        <label htmlFor="sessionNotes" className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          Notas de sesión <span className="font-normal text-neutral-400 dark:text-neutral-500">(opcional)</span>
        </label>
        <textarea
          id="sessionNotes"
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Ej: Hoy quiero enfoque en gimnásticos, tengo 45 min..."
          className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700/60 bg-white dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          rows={3}
        />
      </div>

      {/* Generate CTA — full width */}
      <button
        data-print-hide
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 h-14 mb-8 text-base font-bold uppercase tracking-wider text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 dark:focus:ring-offset-neutral-900"
      >
        <BoltIcon className="h-5 w-5" />
        {wod ? 'Generar Nuevo' : 'Generar WOD'}
      </button>

      {/* Content area */}
      <div className={wod && !showLiveMode ? 'pb-28' : ''}>
        {renderContent()}
      </div>

      {/* Floating Action Bar */}
      {wod && !showLiveMode && (
        <div data-print-hide className="fixed bottom-0 left-0 right-0 z-40">
          {/* Gradient fade */}
          <div className="h-8 bg-linear-to-t from-white dark:from-[#0a0a0a] to-transparent" />
          {/* Action bar */}
          <div className="bg-white dark:bg-[#0a0a0a] border-t border-neutral-200 dark:border-neutral-800 px-4 pb-[env(safe-area-inset-bottom,0px)]">
            <div className="container mx-auto max-w-4xl flex items-center justify-between py-3">
              {/* Left: utility buttons */}
              <div className="flex items-center gap-2">
                <CopyWodButton wod={wod} variant="icon" />
                <PrintWodButton variant="icon" />
                <button
                  onClick={handleSaveWod}
                  disabled={justSaved || !!savedWodId}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  aria-label={justSaved ? 'Guardado' : savedWodId ? 'Guardado' : 'Guardar WOD'}
                >
                  {savedWodId ? <BookmarkCheckIcon className="h-4 w-4" /> : <BookmarkIcon className="h-4 w-4" />}
                </button>
              </div>
              {/* Right: main actions */}
              <div className="flex items-center gap-2">
                {!savedFeedback && (
                  <button
                    onClick={() => setShowFeedback((prev) => !prev)}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <ClipboardCheckIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Registrar</span>
                  </button>
                )}
                <button
                  onClick={() => setShowLiveMode(true)}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-lg shadow-red-500/25 transition-colors"
                >
                  <PlayIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Iniciar Entrenamiento</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLiveMode && wod && (
        <LiveWorkoutOverlay
          wod={wod}
          onFinish={(totalMinutes) => {
            setShowLiveMode(false);
            setLiveWorkoutTime(totalMinutes);
            setShowFeedback(true);
            if (!savedWodId) handleSaveWod();
          }}
          onCancel={() => setShowLiveMode(false)}
        />
      )}

      {showFeedback && !savedFeedback && wod && user && (
        <WorkoutFeedbackForm
          wod={wod}
          wodId={savedWodId}
          userId={user.id}
          onSaved={handleFeedbackSaved}
          onClose={() => setShowFeedback(false)}
          initialTotalTime={liveWorkoutTime}
        />
      )}
    </>
  );
}
