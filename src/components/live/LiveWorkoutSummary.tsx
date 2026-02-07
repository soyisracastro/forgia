import type { Wod } from '@/types/wod';

type SectionKey = 'warmUp' | 'strengthSkill' | 'metcon' | 'coolDown';

interface LiveWorkoutSummaryProps {
  wod: Wod;
  sectionTimes: Partial<Record<SectionKey, number>>;
  totalTimeSeconds: number;
  onContinue: () => void;
  onDiscard: () => void;
}

const sectionLabels: Record<SectionKey, string> = {
  warmUp: 'Calentamiento',
  strengthSkill: 'Fuerza / Skill',
  metcon: 'Metcon',
  coolDown: 'Vuelta a la calma',
};

const sectionColors: Record<SectionKey, string> = {
  warmUp: 'text-amber-400',
  strengthSkill: 'text-blue-400',
  metcon: 'text-red-400',
  coolDown: 'text-emerald-400',
};

const sectionDotColors: Record<SectionKey, string> = {
  warmUp: 'bg-amber-400',
  strengthSkill: 'bg-blue-400',
  metcon: 'bg-red-400',
  coolDown: 'bg-emerald-400',
};

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const sectionOrder: SectionKey[] = ['warmUp', 'strengthSkill', 'metcon', 'coolDown'];

const LiveWorkoutSummary: React.FC<LiveWorkoutSummaryProps> = ({
  wod,
  sectionTimes,
  totalTimeSeconds,
  onContinue,
  onDiscard,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <CheckIcon />
      <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4 mb-1">
        Entrenamiento Completado
      </h1>
      <p className="text-neutral-400 mb-8">{wod.title}</p>

      {/* Section breakdown */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        {sectionOrder.map((key) => {
          const time = sectionTimes[key];
          if (time === undefined) return null;
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${sectionDotColors[key]}`} />
                <span className={`text-sm font-medium ${sectionColors[key]}`}>
                  {sectionLabels[key]}
                </span>
              </div>
              <span className="text-sm font-mono text-neutral-300">
                {formatTime(time)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total time */}
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Tiempo Total</p>
        <p className="text-4xl font-mono font-bold text-white">{formatTime(totalTimeSeconds)}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          onClick={onContinue}
          className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
        >
          Registrar Resultado
        </button>
        <button
          onClick={onDiscard}
          className="flex-1 px-6 py-3 border border-neutral-600 hover:bg-neutral-800 text-neutral-300 font-semibold rounded-lg transition-colors"
        >
          Descartar
        </button>
      </div>
    </div>
  );
};

export default LiveWorkoutSummary;
