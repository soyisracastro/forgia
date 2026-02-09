'use client';

import { useState } from 'react';
import type { WorkoutFeedback, GeminiAnalysis } from '@/types/wod';
import { analyzeFeedback } from '@/lib/gemini';
import Spinner from '@/components/Spinner';

interface WorkoutAnalysisProps {
  feedback: WorkoutFeedback;
  onAnalysisComplete?: (analysis: GeminiAnalysis) => void;
}

// --- SVG Icons ---

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>
);

const DescriptionIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);

const CheckCircleIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const WarningIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

const LightbulbIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" /><path d="M10 22h4" />
  </svg>
);

const TrendingUpIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);

const BoltIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ClockIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

// --- Card config ---

type CardKey = 'resumen' | 'fortalezas' | 'areas_mejora' | 'recomendaciones';

const cardConfig: Record<CardKey, {
  title: string;
  borderColor: string;
  iconColor: string;
  bulletColor: string;
  watermarkColor: string;
  Icon: React.FC<{ className?: string }>;
}> = {
  resumen: {
    title: 'Resumen',
    borderColor: 'border-red-500',
    iconColor: 'text-red-500',
    bulletColor: 'bg-red-500',
    watermarkColor: 'text-red-500',
    Icon: DescriptionIcon,
  },
  fortalezas: {
    title: 'Fortalezas',
    borderColor: 'border-emerald-400',
    iconColor: 'text-emerald-400',
    bulletColor: 'bg-emerald-400',
    watermarkColor: 'text-emerald-400',
    Icon: CheckCircleIcon,
  },
  areas_mejora: {
    title: 'Áreas de Mejora',
    borderColor: 'border-amber-400',
    iconColor: 'text-amber-400',
    bulletColor: 'bg-amber-400',
    watermarkColor: 'text-amber-400',
    Icon: WarningIcon,
  },
  recomendaciones: {
    title: 'Recomendaciones',
    borderColor: 'border-blue-400',
    iconColor: 'text-blue-400',
    bulletColor: 'bg-blue-400',
    watermarkColor: 'text-blue-400',
    Icon: LightbulbIcon,
  },
};

// --- Helper Components ---

function AnalysisCard({
  cardKey,
  children,
}: {
  cardKey: CardKey;
  children: React.ReactNode;
}) {
  const { title, borderColor, iconColor, watermarkColor, Icon } = cardConfig[cardKey];

  return (
    <div className={`bg-neutral-50 dark:bg-neutral-900 rounded-lg p-5 border-t-2 ${borderColor} relative overflow-hidden group`}>
      {/* Watermark icon */}
      <div className={`absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity`}>
        <Icon className={`h-16 w-16 ${watermarkColor}`} />
      </div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h3 className="font-semibold text-neutral-900 dark:text-white">{title}</h3>
      </div>
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function BulletList({ items, cardKey }: { items: string[]; cardKey: CardKey }) {
  const { bulletColor } = cardConfig[cardKey];

  return (
    <ul className="text-neutral-600 dark:text-neutral-400 text-sm space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${bulletColor} mt-1.5 shrink-0`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// --- Main Component ---

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
    <div className="animate-fade-in-up mt-6 space-y-6">
      {/* Title + Stats */}
      <div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Análisis de tu Entrenamiento
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          <p>{feedback.wod_snapshot.title}</p>
          <span className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600" />
          <div className="flex items-center gap-1">
            <BoltIcon className="h-3.5 w-3.5" />
            <span>{feedback.difficulty_rating}/10</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600" />
          <span className="font-medium text-neutral-900 dark:text-white bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs">
            {feedback.rx_or_scaled}
          </span>
          {feedback.total_time_minutes && (
            <>
              <span className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600" />
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                <span>{feedback.total_time_minutes} min</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Resumen */}
        <AnalysisCard cardKey="resumen">
          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
            {analysis!.resumen}
          </p>
        </AnalysisCard>

        {/* Fortalezas */}
        <AnalysisCard cardKey="fortalezas">
          <BulletList items={analysis!.fortalezas} cardKey="fortalezas" />
        </AnalysisCard>

        {/* Áreas de Mejora */}
        <AnalysisCard cardKey="areas_mejora">
          <BulletList items={analysis!.areas_mejora} cardKey="areas_mejora" />
        </AnalysisCard>

        {/* Recomendaciones */}
        <AnalysisCard cardKey="recomendaciones">
          <BulletList items={analysis!.recomendaciones} cardKey="recomendaciones" />
        </AnalysisCard>
      </div>

      {/* Progresión Sugerida — Special Card */}
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700/50 shadow-lg relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row gap-4 sm:items-start relative z-10">
          <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 inline-flex self-start shrink-0">
            <TrendingUpIcon className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Progresión Sugerida
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {analysis!.progresion_sugerida}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
