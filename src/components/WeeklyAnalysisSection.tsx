'use client';

import { useState, useEffect } from 'react';
import type { WeeklyAnalysisData } from '@/types/weekly-analysis';
import { fetchWeeklyAnalysis } from '@/lib/gemini';
import Spinner from '@/components/Spinner';

const cargaBadge: Record<string, string> = {
  baja: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  moderada: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  alta: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  excesiva: 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

// Icons
const ChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
);

const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

const AlertIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
);

const TrendingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

function AnalysisCard({
  title,
  icon,
  items,
  borderColor,
  dotColor,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  borderColor: string;
  dotColor: string;
}) {
  return (
    <div className={`rounded-xl border ${borderColor} bg-white dark:bg-neutral-900 p-4`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span className={`size-1.5 rounded-full ${dotColor} mt-2 shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WeeklyAnalysisSection() {
  const [analysis, setAnalysis] = useState<WeeklyAnalysisData | null>(null);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchWeeklyAnalysis();
        setFeedbackCount(result.feedbackCount);
        setAnalysis(result.analysis);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <ChartIcon className="h-5 w-5 text-red-500" />
          Análisis Semanal
        </h2>
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error || feedbackCount === 0) {
    return (
      <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <ChartIcon className="h-5 w-5 text-red-500" />
          Análisis Semanal
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-6">
          No hay feedback registrado esta semana. Registra tus resultados para obtener un análisis.
        </p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <ChartIcon className="h-5 w-5 text-red-500" />
          Análisis Semanal
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{feedbackCount} sesiones</span>
          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${cargaBadge[analysis.carga_percibida] ?? ''}`}>
            Carga {analysis.carga_percibida}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 p-4 mb-4">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{analysis.resumen_semanal}</p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <AnalysisCard
          title="Logros"
          icon={<TrophyIcon className="h-4 w-4 text-emerald-500" />}
          items={analysis.logros}
          borderColor="border-emerald-200 dark:border-emerald-800/50"
          dotColor="bg-emerald-500"
        />
        <AnalysisCard
          title="Áreas de Atención"
          icon={<AlertIcon className="h-4 w-4 text-amber-500" />}
          items={analysis.areas_atencion}
          borderColor="border-amber-200 dark:border-amber-800/50"
          dotColor="bg-amber-500"
        />
        <AnalysisCard
          title="Recomendaciones"
          icon={<LightbulbIcon className="h-4 w-4 text-blue-500" />}
          items={analysis.recomendaciones_proxima_semana}
          borderColor="border-blue-200 dark:border-blue-800/50"
          dotColor="bg-blue-500"
        />
        <AnalysisCard
          title="Tendencias"
          icon={<TrendingIcon className="h-4 w-4 text-red-500" />}
          items={analysis.tendencias}
          borderColor="border-red-200 dark:border-red-800/50"
          dotColor="bg-red-500"
        />
      </div>

      {/* Motivational note */}
      <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 p-4 text-center">
        <p className="text-sm italic text-neutral-600 dark:text-neutral-400">
          &ldquo;{analysis.nota_motivacional}&rdquo;
        </p>
      </div>
    </div>
  );
}
