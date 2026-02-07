import type { TimerMode, TimerPhase } from '@/hooks/useTimer';

interface LiveTimerDisplayProps {
  seconds: number;
  mode: TimerMode;
  isRunning: boolean;
  phase?: TimerPhase;
  currentRound?: number;
  totalRounds?: number;
  suggestedDuration?: string | null;
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
}) => {
  const isCountingDown = mode === 'countdown' || mode === 'emom' || mode === 'tabata';
  const isLastSeconds = isCountingDown && seconds <= 10 && seconds > 0 && isRunning;
  const isTabata = mode === 'tabata';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Tabata phase indicator */}
      {isTabata && (
        <div
          className={`px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest transition-colors duration-300 ${
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
        <div className="px-4 py-1 rounded-full bg-white/10 text-sm font-semibold text-neutral-300">
          Ronda {currentRound}/{totalRounds}
        </div>
      )}

      {/* Timer digits */}
      <div
        className={`text-6xl sm:text-8xl md:text-9xl font-mono font-bold tabular-nums transition-colors duration-300 ${
          isLastSeconds
            ? 'text-red-500 animate-timer-pulse'
            : 'text-white'
        }`}
      >
        {formatTime(seconds)}
      </div>

      {/* Suggested duration hint for stopwatch */}
      {mode === 'stopwatch' && suggestedDuration && (
        <p className="text-sm text-neutral-500">
          Sugerido: {suggestedDuration}
        </p>
      )}
    </div>
  );
};

export default LiveTimerDisplay;
