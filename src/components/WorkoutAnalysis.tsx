'use client';

import { useState } from 'react';
import type { WorkoutFeedback, GeminiAnalysis } from '@/types/wod';
import { analyzeFeedback } from '@/lib/gemini';
import Spinner from '@/components/Spinner';

interface WorkoutAnalysisProps {
  feedback: WorkoutFeedback;
  onAnalysisComplete?: (analysis: GeminiAnalysis) => void;
}

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>
);

export default function WorkoutAnalysis({ feedback, onAnalysisComplete }: WorkoutAnalysisProps) {
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(feedback.gemini_analysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeFeedback({ feedbackId: feedback.id });
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar el rendimiento.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!analysis && !isAnalyzing) {
    return (
      <div className="animate-fade-in-up mt-4">
        <button
          onClick={handleAnalyze}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900"
        >
          <SparklesIcon className="h-4 w-4" />
          Analizar con IA
        </button>
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="animate-fade-in-up mt-4 flex items-center gap-3 p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <Spinner />
        <span className="text-sm text-neutral-600 dark:text-neutral-400">Analizando tu rendimiento...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up mt-4 space-y-3">
      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
        <SparklesIcon className="h-4 w-4 text-red-500" />
        Análisis de tu Entrenamiento
      </h4>

      {/* Resumen */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border-l-4 border-l-red-500">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">Resumen</h5>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{analysis!.resumen}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Fortalezas */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border-l-4 border-l-emerald-500">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Fortalezas</h5>
          <ul className="space-y-1">
            {analysis!.fortalezas.map((item, i) => (
              <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 flex gap-2">
                <span className="text-emerald-500 mt-0.5 shrink-0">&#8226;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Áreas de mejora */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border-l-4 border-l-amber-500">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">Áreas de Mejora</h5>
          <ul className="space-y-1">
            {analysis!.areas_mejora.map((item, i) => (
              <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 flex gap-2">
                <span className="text-amber-500 mt-0.5 shrink-0">&#8226;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Recomendaciones */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border-l-4 border-l-blue-500">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Recomendaciones</h5>
          <ul className="space-y-1">
            {analysis!.recomendaciones.map((item, i) => (
              <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 flex gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">&#8226;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Progresión sugerida */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border-l-4 border-l-red-500">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">Progresión Sugerida</h5>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{analysis!.progresion_sugerida}</p>
        </div>
      </div>
    </div>
  );
}
