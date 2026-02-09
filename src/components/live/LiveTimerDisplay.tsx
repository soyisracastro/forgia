import type { TimerMode, TimerPhase } from '@/hooks/useTimer';

interface LiveTimerDisplayProps {
  seconds: number;
  mode: TimerMode;
  isRunning: boolean;
  phase?: TimerPhase;
  currentRound?: number;
  totalRounds?: number;
  suggestedDuration?: string | null;
  progressPercent?: number;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

const LiveTimerDisplay: React.FC<LiveTimerDisplayProps> = ({
  seconds,
  mode,
  isRunning,
  phase = 'work',
  currentRound,
  totalRounds,
  suggestedDuration,
  progressPercent,
}) => {
  const isCountingDown = mode === 'countdown' || mode === 'emom' || mode === 'tabata';
  const isLastSeconds = isCountingDown && seconds <= 10 && seconds > 0 && isRunning;
  const isTabata = mode === 'tabata';

  return (
    <div className="flex flex-col items-center justify-center w-full py-6">
      {/* Tabata phase indicator */}
      {isTabata && (
        <div
          className={`px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest transition-colors duration-300 mb-4 ${
            phase === 'work'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-emerald-500/20 text-emerald-400'
          }`}
        >
          {phase === 'work' ? 'Trabajo' : 'Descanso'}
        </div>
      )}

      {/* EMOM round badge */}
      {mode === 'emom' && currentRound && totalRounds && (
        <div className="px-4 py-1 rounded-full bg-white/10 text-sm font-semibold text-neutral-300 mb-4">
          Ronda {currentRound}/{totalRounds}
        </div>
      )}

      {/* Timer digits */}
      <div className="relative">
        <span
          className={`font-mono text-7xl sm:text-8xl md:text-[100px] leading-[0.9] font-semibold tracking-tighter timer-glow select-none tabular-nums transition-colors duration-300 ${
            isLastSeconds
              ? 'text-red-500 animate-timer-pulse'
              : 'text-white'
          }`}
        >
          {formatTime(seconds)}
        </span>
      </div>

      {/* Progress bar */}
      {progressPercent !== undefined && (
        <div className="w-full max-w-[280px] mt-6 flex flex-col gap-2">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,67,67,0.6)] transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}

      {/* Suggested duration hint for stopwatch */}
      {mode === 'stopwatch' && suggestedDuration && (
        <p className="text-sm text-white/40 mt-4">
          Sugerido: {suggestedDuration}
        </p>
      )}
    </div>
  );
};

export default LiveTimerDisplay;
