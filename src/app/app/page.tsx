'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Wod, Level, Location, Equipment, SavedWod } from '@/types/wod';
import { generateWod } from '@/lib/gemini';
import Spinner from '@/components/Spinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import WodDisplay from '@/components/WodDisplay';
import WodControls from '@/components/WodControls';

const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);

const DiceIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M8 8h.01"/><path d="M16 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/></svg>
);

export default function AppPage() {
  const [wod, setWod] = useState<Wod | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');

  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [location, setLocation] = useState<Location>('Box');
  const [equipment, setEquipment] = useState<Equipment>('Completo');
  const [level, setLevel] = useState<Level>('Intermedio');
  const [injury, setInjury] = useState<string>('');
  const [justSaved, setJustSaved] = useState<boolean>(false);

  const fetchAndSetWod = useCallback(async (params: { location: Location; equipment: Equipment; level: Level; injury: string }) => {
    setIsLoading(true);
    setError(null);
    setWod(null);
    try {
      const newWod = await generateWod(params);
      setWod(newWod);
      localStorage.setItem('lastWod', JSON.stringify(newWod));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al generar el WOD.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentDate(new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(new Date()));

    try {
      const stored = localStorage.getItem('lastWod');
      if (stored) {
        setWod(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse WOD from localStorage", e);
      localStorage.removeItem('lastWod');
    }
  }, []);

  const handleGenerateNewWod = () => {
    fetchAndSetWod({ location, equipment, level, injury });
  };

  const handleSaveWod = () => {
    if (!wod) return;
    const saved: SavedWod = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      wod,
    };
    try {
      const existing: SavedWod[] = JSON.parse(localStorage.getItem('savedWods') || '[]');
      existing.unshift(saved);
      localStorage.setItem('savedWods', JSON.stringify(existing));
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch {
      console.error('Failed to save WOD to localStorage');
    }
  };

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
    if (wod) {
      return (
        <>
          <WodDisplay wod={wod} />
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSaveWod}
              disabled={justSaved}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900 disabled:opacity-60"
            >
              {justSaved ? 'Guardado!' : 'Guardar WOD'}
            </button>
          </div>
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
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100">WOD del Día</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{currentDate}</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 mt-6">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Tu Entrenamiento</h2>
        <div className="flex items-center gap-2">
          <button
              onClick={() => setIsCustomizing(prev => !prev)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900"
          >
              <FilterIcon className="h-4 w-4" />
              {isCustomizing ? 'Ocultar' : 'Personalizar'}
          </button>
          {!isCustomizing && (
              <button
                  onClick={handleGenerateNewWod}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 dark:focus:ring-offset-neutral-900"
              >
                  <DiceIcon className="h-4 w-4" />
                  {wod ? 'Generar Nuevo' : 'Generar WOD'}
              </button>
          )}
        </div>
      </div>

      {isCustomizing && (
          <WodControls
            location={location}
            setLocation={setLocation}
            equipment={equipment}
            setEquipment={setEquipment}
            level={level}
            setLevel={setLevel}
            injury={injury}
            setInjury={setInjury}
            onGenerate={() => {
              handleGenerateNewWod();
              setIsCustomizing(false);
            }}
            disabled={isLoading}
          />
      )}

      {renderContent()}
    </>
  );
}
