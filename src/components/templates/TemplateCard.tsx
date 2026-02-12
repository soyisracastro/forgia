'use client';

import type { WodTemplate, TemplateResult } from '@/types/wod-template';
import { Clock, Dumbbell } from 'lucide-react';

const categoryColors: Record<string, string> = {
  girl: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  hero: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  benchmark: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
};

const categoryLabels: Record<string, string> = {
  girl: 'Girl',
  hero: 'Hero',
  benchmark: 'Benchmark',
};

const difficultyColors: Record<string, string> = {
  Novato: 'text-emerald-500',
  Principiante: 'text-blue-500',
  Intermedio: 'text-amber-500',
  Avanzado: 'text-red-500',
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
    case 'weight':
      return `${result.score_value}`;
    default:
      return `${result.score_value}`;
  }
}

interface TemplateCardProps {
  template: WodTemplate;
  bestResult?: TemplateResult | null;
  onClick: () => void;
}

export default function TemplateCard({ template, bestResult, onClick }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200 hover:shadow-sm"
    >
      {/* Header: name + badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          {template.name}
        </h3>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${categoryColors[template.category]}`}>
          {categoryLabels[template.category]}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
        {template.description}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
        <span className={`font-semibold ${difficultyColors[template.difficulty]}`}>
          {template.difficulty}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          ~{template.estimatedMinutes} min
        </span>
        <span className="flex items-center gap-1">
          <Dumbbell className="w-3 h-3" />
          {template.equipmentRequired.length}
        </span>
      </div>

      {/* Best result badge */}
      {bestResult && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-red-500">
            PR: {formatScore(bestResult)} {bestResult.rx_or_scaled}
          </span>
        </div>
      )}
    </button>
  );
}
