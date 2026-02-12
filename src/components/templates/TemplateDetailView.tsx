'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WodTemplate, TemplateResult } from '@/types/wod-template';
import { useAuth } from '@/contexts/AuthContext';
import { getResultsForTemplate } from '@/lib/template-results';
import WodDisplay from '@/components/WodDisplay';
import TemplateResultForm from './TemplateResultForm';
import LiveWorkoutOverlay from '@/components/live/LiveWorkoutOverlay';
import { ArrowLeft, Play, ClipboardCheck, Trophy, Trash2 } from 'lucide-react';
import { deleteTemplateResult } from '@/lib/template-results';

const categoryLabels: Record<string, string> = {
  girl: 'Girl WOD',
  hero: 'Hero WOD',
  benchmark: 'Benchmark',
};

function formatScore(result: TemplateResult): string {
  switch (result.score_type) {
    case 'time': {
      const mins = Math.floor(result.score_value / 60);
      const secs = Math.round(result.score_value % 60);
      return `${mins}:${String(secs).padStart(2, '0')}`;
    }
    case 'rounds':
      return `${result.score_value} rondas`;
    case 'reps':
      return `${result.score_value} reps`;
    default:
      return `${result.score_value}`;
  }
}

interface TemplateDetailViewProps {
  template: WodTemplate;
  onBack: () => void;
}

export default function TemplateDetailView({ template, onBack }: TemplateDetailViewProps) {
  const { user } = useAuth();
  const [results, setResults] = useState<TemplateResult[]>([]);
  const [showResultForm, setShowResultForm] = useState(false);
  const [showLiveMode, setShowLiveMode] = useState(false);
  const [liveWorkoutTime, setLiveWorkoutTime] = useState<number | null>(null);

  const loadResults = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getResultsForTemplate(user.id, template.id);
      setResults(data);
    } catch (err) {
      console.error('Error loading results:', err);
    }
  }, [user, template.id]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleDeleteResult = async (resultId: string) => {
    try {
      await deleteTemplateResult(resultId);
      setResults((prev) => prev.filter((r) => r.id !== resultId));
    } catch (err) {
      console.error('Error deleting result:', err);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Back + header */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Biblioteca
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {template.name}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {categoryLabels[template.category]} — {template.difficulty} — ~{template.estimatedMinutes} min
          </p>
        </div>

        {/* Description + Rx standards */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 space-y-3">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {template.description}
          </p>
          <div className="flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Rx Hombres: <strong className="text-neutral-700 dark:text-neutral-200">{template.rxStandard.men}</strong></span>
            <span>Rx Mujeres: <strong className="text-neutral-700 dark:text-neutral-200">{template.rxStandard.women}</strong></span>
          </div>
          <div className="text-xs text-neutral-400 dark:text-neutral-500">
            Equipo: {template.equipmentRequired.join(', ')}
          </div>
        </div>

        {/* WOD Display */}
        <WodDisplay wod={template.wod} />

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowLiveMode(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/25 transition-colors"
          >
            <Play className="w-4 h-4" />
            Iniciar Entrenamiento
          </button>
          <button
            onClick={() => setShowResultForm(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            Registrar Resultado
          </button>
        </div>

        {/* Results history */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Tu historial
            </h3>
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatScore(result)} <span className="text-xs font-normal text-neutral-500">{result.rx_or_scaled}</span>
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {new Date(result.created_at).toLocaleDateString('es-ES')}
                    {result.notes && ` — ${result.notes}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteResult(result.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                  aria-label="Eliminar resultado"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live mode overlay */}
      {showLiveMode && (
        <LiveWorkoutOverlay
          wod={template.wod}
          onFinish={(totalMinutes) => {
            setShowLiveMode(false);
            setLiveWorkoutTime(totalMinutes);
            setShowResultForm(true);
          }}
          onCancel={() => setShowLiveMode(false)}
        />
      )}

      {/* Result form overlay */}
      {showResultForm && user && (
        <TemplateResultForm
          template={template}
          userId={user.id}
          initialTime={liveWorkoutTime}
          onSaved={() => {
            setShowResultForm(false);
            setLiveWorkoutTime(null);
            loadResults();
          }}
          onClose={() => {
            setShowResultForm(false);
            setLiveWorkoutTime(null);
          }}
        />
      )}
    </>
  );
}
