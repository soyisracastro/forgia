'use client';

import { useState, useEffect } from 'react';
import type { WodTemplate, TemplateResultInput, ScoringType } from '@/types/wod-template';
import type { ExperienceLevel } from '@/types/profile';
import { saveTemplateResult } from '@/lib/template-results';
import { checkLevelSuggestion, type LevelSuggestion } from '@/lib/level-suggestions';
import { updateProfile } from '@/lib/profiles';
import { useAuth } from '@/contexts/AuthContext';
import SegmentedButton from '@/components/ui/SegmentedButton';
import { ArrowUp } from 'lucide-react';

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

interface TemplateResultFormProps {
  template: WodTemplate;
  userId: string;
  onSaved: () => void;
  onClose: () => void;
  initialTime?: number | null;
}

export default function TemplateResultForm({ template, userId, onSaved, onClose, initialTime }: TemplateResultFormProps) {
  const { profile, refreshProfile } = useAuth();
  const [scoreValue, setScoreValue] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [rxOrScaled, setRxOrScaled] = useState<'Rx' | 'Scaled'>('Rx');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [levelSuggestion, setLevelSuggestion] = useState<LevelSuggestion | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Pre-fill time if available
  useEffect(() => {
    if (initialTime && template.scoringType === 'time') {
      const totalSeconds = Math.round(initialTime * 60);
      setMinutes(String(Math.floor(totalSeconds / 60)));
      setSeconds(String(totalSeconds % 60));
    }
  }, [initialTime, template.scoringType]);

  const getScoreValue = (): number | null => {
    if (template.scoringType === 'time') {
      const m = parseInt(minutes, 10) || 0;
      const s = parseInt(seconds, 10) || 0;
      const total = m * 60 + s;
      return total > 0 ? total : null;
    }
    const val = parseFloat(scoreValue);
    return val > 0 ? val : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const value = getScoreValue();
    if (value === null) return;

    setIsSaving(true);
    try {
      const input: TemplateResultInput = {
        template_id: template.id,
        score_value: value,
        score_type: template.scoringType,
        rx_or_scaled: rxOrScaled,
        notes: notes.trim() || null,
      };

      await saveTemplateResult(userId, input);

      // Check level suggestion
      if (profile?.experience_level) {
        const suggestion = checkLevelSuggestion(
          template.id,
          value,
          rxOrScaled,
          profile.experience_level
        );
        if (suggestion) {
          setLevelSuggestion(suggestion);
          setShowSuggestion(true);
          return; // Don't close yet, show suggestion first
        }
      }

      onSaved();
    } catch (err) {
      console.error('Error saving template result:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptLevelSuggestion = async () => {
    if (!levelSuggestion || !profile) return;

    try {
      await updateProfile(profile.id, {
        display_name: profile.display_name || '',
        age: profile.age || 0,
        experience_level: levelSuggestion.suggestedLevel,
        injury_history: profile.injury_history,
        objectives: profile.objectives || [],
        training_type: profile.training_type || 'CrossFit',
        equipment_level: profile.equipment_level || 'Box completo',
      });
      await refreshProfile();
    } catch (err) {
      console.error('Error updating level:', err);
    }

    onSaved();
  };

  // Show level suggestion screen
  if (showSuggestion && levelSuggestion) {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <ArrowUp className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Subida de nivel detectada</h2>
          <p className="text-sm text-neutral-300">
            {levelSuggestion.reason}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAcceptLevelSuggestion}
              className="w-full py-3 text-sm font-bold uppercase tracking-wider text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
            >
              Actualizar a {levelSuggestion.suggestedLevel}
            </button>
            <button
              onClick={onSaved}
              className="w-full py-3 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              No, gracias
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-6 shrink-0">
        <h2 className="text-lg font-bold text-white">Registrar Resultado</h2>
        <button
          type="button"
          onClick={onClose}
          className="size-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <XIcon />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-lg mx-auto w-full">
          <p className="text-sm text-neutral-500 mb-6">{template.name}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Score input */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                {template.scoringType === 'time' ? 'Tiempo' : template.scoringType === 'rounds' ? 'Rondas completadas' : 'Score'}
              </label>
              {template.scoringType === 'time' ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min={0}
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder="00"
                    className="w-20 px-3 py-2 text-sm text-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-neutral-400 font-bold">:</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    placeholder="00"
                    className="w-20 px-3 py-2 text-sm text-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-xs text-neutral-500">min : seg</span>
                </div>
              ) : (
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(e.target.value)}
                  placeholder={template.scoringType === 'rounds' ? '15' : '100'}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              )}
            </div>

            {/* Rx/Scaled */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Modalidad
              </label>
              <SegmentedButton
                options={['Rx', 'Scaled']}
                selected={rxOrScaled}
                onSelect={(v) => setRxOrScaled(v as 'Rx' | 'Scaled')}
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                Rx: {template.rxStandard.men} (H) / {template.rxStandard.women} (M)
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Notas <span className="font-normal text-neutral-500">(opcional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Partí en sets de 7..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSaving || getScoreValue() === null}
              className="w-full py-3 text-sm font-bold uppercase tracking-wider text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all duration-200 disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Guardar Resultado'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
