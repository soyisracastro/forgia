'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { WodTemplate, TemplateCategory, TemplateResult } from '@/types/wod-template';
import { WOD_TEMPLATES } from '@/lib/wod-templates';
import { getBestResults } from '@/lib/template-results';
import TemplateCard from '@/components/templates/TemplateCard';
import TemplateDetailView from '@/components/templates/TemplateDetailView';
import SegmentedButton from '@/components/ui/SegmentedButton';
import { Library } from 'lucide-react';

type FilterCategory = 'Todos' | 'Girls' | 'Heroes' | 'Benchmark';

const filterToCategory: Record<FilterCategory, TemplateCategory | null> = {
  Todos: null,
  Girls: 'girl',
  Heroes: 'hero',
  Benchmark: 'benchmark',
};

export default function BibliotecaPage() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('Todos');
  const [selectedTemplate, setSelectedTemplate] = useState<WodTemplate | null>(null);
  const [bestResults, setBestResults] = useState<Map<string, TemplateResult>>(new Map());

  const loadBestResults = useCallback(async () => {
    if (!user) return;
    try {
      const results = await getBestResults(user.id);
      setBestResults(results);
    } catch (err) {
      console.error('Error loading best results:', err);
    }
  }, [user]);

  useEffect(() => {
    loadBestResults();
  }, [loadBestResults]);

  const filteredTemplates = useMemo(() => {
    const category = filterToCategory[selectedFilter];
    if (!category) return WOD_TEMPLATES;
    return WOD_TEMPLATES.filter((t) => t.category === category);
  }, [selectedFilter]);

  // If a template is selected, show detail view
  if (selectedTemplate) {
    return (
      <TemplateDetailView
        template={selectedTemplate}
        onBack={() => {
          setSelectedTemplate(null);
          loadBestResults(); // Refresh best results when coming back
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
          <Library className="w-7 h-7 text-neutral-400" />
          Biblioteca de WODs
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
          WODs clásicos de CrossFit. Registra tus tiempos y trackea tu progreso.
        </p>
      </div>

      {/* Filter */}
      <SegmentedButton
        options={['Todos', 'Girls', 'Heroes', 'Benchmark']}
        selected={selectedFilter}
        onSelect={(v) => setSelectedFilter(v as FilterCategory)}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            bestResult={bestResults.get(template.id) || null}
            onClick={() => setSelectedTemplate(template)}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            No hay WODs en esta categoría.
          </p>
        </div>
      )}
    </div>
  );
}
