'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Wod, WodSection } from '@/types/wod';
import { useTimer, type TimerConfig, type TimerState } from '@/hooks/useTimer';
import { useAudioCues } from '@/hooks/useAudioCues';
import { useWakeLock } from '@/hooks/useWakeLock';
import LiveTimerDisplay from './LiveTimerDisplay';
import LiveSectionView from './LiveSectionView';
import LiveWorkoutSummary from './LiveWorkoutSummary';
import { trackWorkoutCompleted } from '@/lib/analytics';
import { X, Pause, Play, SkipForward, Flag, Volume2, VolumeX } from 'lucide-react';

type SectionKey = 'warmUp' | 'strengthSkill' | 'metcon' | 'coolDown';
type WorkoutPhase = 'countdown' | SectionKey | 'summary';

const SECTION_ORDER: SectionKey[] = ['warmUp', 'strengthSkill', 'metcon', 'coolDown'];

const SECTION_LABELS: Record<SectionKey, string> = {
  warmUp: 'Calentamiento',
  strengthSkill: 'Fuerza',
  metcon: 'Metcon',
  coolDown: 'Vuelta a la Calma',
};

const SECTION_EMOJIS: Record<SectionKey, string> = {
  warmUp: '🔥',
  strengthSkill: '🏋️',
  metcon: '⚡',
  coolDown: '💚',
};

const SECTION_PILL_ACTIVE: Record<SectionKey, string> = {
  warmUp:        'bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  strengthSkill: 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]',
  metcon:        'bg-red-500 text-white shadow-[0_0_12px_rgba(239,67,67,0.4)]',
  coolDown:      'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]',
};

const SESSION_STORAGE_KEY = 'live-workout-state';
const RECOVERY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

interface LiveWorkoutOverlayProps {
  wod: Wod;
  onFinish: (totalMinutes: number) => void;
  onCancel: () => void;
}

// --- Helpers ---

function parseMinutes(text?: string): number | null {
  if (!text) return null;
  const match = text.match(/(\d+)(?:\s*[-–]\s*\d+)?\s*min/i);
  if (match) return parseInt(match[1], 10);
  const standalone = text.match(/(\d+)/);
  return standalone ? parseInt(standalone[1], 10) : null;
}

function getSuggestedDuration(section: WodSection): string | null {
  if (section.duration) return section.duration;
  const mins = parseMinutes(section.description);
  if (mins) return `${mins} min`;
  return null;
}

function getTimerConfig(key: SectionKey, section: WodSection): TimerConfig {
  if (key === 'metcon') {
    const type = section.type?.toLowerCase() ?? '';

    if (type.includes('amrap')) {
      const mins = parseMinutes(section.duration) ?? parseMinutes(section.description);
      if (mins) return { mode: 'countdown', durationSeconds: mins * 60 };
    }

    if (type.includes('emom')) {
      const mins = parseMinutes(section.duration) ?? parseMinutes(section.description);
      if (mins) return { mode: 'emom', durationSeconds: 60, totalRounds: mins };
    }

    if (type.includes('tabata')) {
      return { mode: 'tabata', workSeconds: 20, restSeconds: 10, totalRounds: 8 };
    }

    // For Time or unknown → stopwatch
    return { mode: 'stopwatch' };
  }

  // warmUp, strengthSkill, coolDown → always stopwatch
  return { mode: 'stopwatch' };
}

function getTotalDurationSeconds(config: TimerConfig): number | null {
  switch (config.mode) {
    case 'countdown':
      return config.durationSeconds ?? null;
    case 'emom':
      return (config.durationSeconds ?? 60) * (config.totalRounds ?? 1);
    case 'tabata':
      return ((config.workSeconds ?? 20) + (config.restSeconds ?? 10)) * (config.totalRounds ?? 8);
    default:
      return null;
  }
}


// --- Component ---

const LiveWorkoutOverlay: React.FC<LiveWorkoutOverlayProps> = ({ wod, onFinish, onCancel }) => {
  const [phase, setPhase] = useState<WorkoutPhase>('countdown');
  const [sectionTimes, setSectionTimes] = useState<Partial<Record<SectionKey, number>>>({});
  const [finalTotalSeconds, setFinalTotalSeconds] = useState<number | null>(null);
  const totalStartRef = useRef<number>(0);
  const sectionStartRef = useRef<number>(0);

  const { playBeep, isMuted, toggleMute } = useAudioCues();
  const wakeLock = useWakeLock();

  // --- Current section info ---
  const currentSectionKey = phase !== 'countdown' && phase !== 'summary' ? phase : null;
  const currentSection = currentSectionKey ? wod[currentSectionKey] : null;

  const timerConfig = useMemo<TimerConfig>(() => {
    if (phase === 'countdown') return { mode: 'countdown', durationSeconds: 3 };
    if (currentSectionKey && currentSection) return getTimerConfig(currentSectionKey, currentSection);
    return { mode: 'stopwatch' };
  }, [phase, currentSectionKey, currentSection]);

  // Whether the current metcon is "For Time" (stopwatch that needs manual finish)
  const isForTime = currentSectionKey === 'metcon' && timerConfig.mode === 'stopwatch';

  // --- Timer callbacks ---
  const handleTick = useCallback((state: TimerState) => {
    if (timerConfig.mode !== 'stopwatch' && state.displaySeconds <= 3 && state.displaySeconds > 0) {
      playBeep('tick');
    }
  }, [timerConfig.mode, playBeep]);

  const handleRoundChange = useCallback(() => {
    playBeep('transition');
  }, [playBeep]);

  const advancePhase = useCallback(() => {
    if (currentSectionKey) {
      const elapsed = Math.floor((Date.now() - sectionStartRef.current) / 1000);
      setSectionTimes((prev) => ({ ...prev, [currentSectionKey]: elapsed }));
    }

    if (phase === 'countdown') {
      totalStartRef.current = Date.now();
      sectionStartRef.current = Date.now();
      setPhase('warmUp');
    } else if (currentSectionKey) {
      const idx = SECTION_ORDER.indexOf(currentSectionKey);
      if (idx < SECTION_ORDER.length - 1) {
        sectionStartRef.current = Date.now();
        setPhase(SECTION_ORDER[idx + 1]);
      } else {
        setFinalTotalSeconds(Math.floor((Date.now() - totalStartRef.current) / 1000));
        setPhase('summary');
      }
    }
  }, [phase, currentSectionKey]);

  const handleTimerFinish = useCallback(() => {
    playBeep('finish');
    setTimeout(advancePhase, 1500);
  }, [playBeep, advancePhase]);

  const timer = useTimer({
    config: timerConfig,
    onTick: handleTick,
    onRoundChange: handleRoundChange,
    onFinish: handleTimerFinish,
  });

  // --- Progress percent ---
  const progressPercent = useMemo(() => {
    const totalDuration = getTotalDurationSeconds(timerConfig);
    if (totalDuration === null || totalDuration === 0) return undefined;
    return ((timer.elapsedSeconds) / totalDuration) * 100;
  }, [timerConfig, timer.elapsedSeconds]);

  // --- Phase transitions: auto-start timer ---
  useEffect(() => {
    timer.reset();
    const id = setTimeout(() => timer.start(), 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // --- Body scroll lock + wake lock ---
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    wakeLock.request();
    return () => {
      document.body.style.overflow = prev;
      wakeLock.release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Session storage recovery ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (phase !== 'summary' && phase !== 'countdown') {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
          wodTitle: wod.title,
          phase,
          sectionTimes,
          totalStart: totalStartRef.current,
          timestamp: Date.now(),
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [phase, sectionTimes, wod.title]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (
        saved.wodTitle === wod.title &&
        Date.now() - saved.timestamp < RECOVERY_TIMEOUT_MS &&
        saved.phase !== 'summary'
      ) {
        const resume = window.confirm('Se encontró un entrenamiento en progreso. ¿Deseas reanudarlo?');
        if (resume) {
          setSectionTimes(saved.sectionTimes || {});
          totalStartRef.current = saved.totalStart || Date.now();
          sectionStartRef.current = Date.now();
          setPhase(saved.phase);
        } else {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (phase === 'summary') {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    };
  }, [phase]);

  // --- Actions ---
  const handleClose = () => {
    if (phase === 'countdown') {
      onCancel();
      return;
    }
    const confirmed = window.confirm('¿Seguro que quieres salir? Tu progreso se perderá.');
    if (confirmed) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      onCancel();
    }
  };

  const handleSkip = () => {
    timer.reset();
    advancePhase();
  };

  const handleForTimeFinish = () => {
    timer.finish();
    if (currentSectionKey) {
      const elapsed = Math.floor((Date.now() - sectionStartRef.current) / 1000);
      setSectionTimes((prev) => ({ ...prev, [currentSectionKey]: elapsed }));
    }
    playBeep('finish');
    const idx = currentSectionKey ? SECTION_ORDER.indexOf(currentSectionKey) : -1;
    if (idx < SECTION_ORDER.length - 1) {
      sectionStartRef.current = Date.now();
      setPhase(SECTION_ORDER[idx + 1]);
    } else {
      setFinalTotalSeconds(Math.floor((Date.now() - totalStartRef.current) / 1000));
      setPhase('summary');
    }
  };

  const handleFinishButton = () => {
    if (isForTime) {
      handleForTimeFinish();
    } else {
      handleSkip();
    }
  };

  const totalTimeSeconds = finalTotalSeconds ?? (
    totalStartRef.current ? Math.floor((Date.now() - totalStartRef.current) / 1000) : 0
  );

  const handleSummaryContinue = () => {
    const totalMinutes = Math.round(totalTimeSeconds / 60 * 10) / 10;
    trackWorkoutCompleted(totalMinutes);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    onFinish(totalMinutes);
  };

  const handleSummaryDiscard = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    onCancel();
  };

  // --- Footer status text ---
  const getFooterStatus = (): string => {
    if (timerConfig.mode === 'emom' && timer.currentRound && timer.totalRounds) {
      return `Ronda ${timer.currentRound} de ${timer.totalRounds}`;
    }
    if (timerConfig.mode === 'tabata' && timer.currentRound && timer.totalRounds) {
      return `Ronda ${timer.currentRound} de ${timer.totalRounds} · ${timer.phase === 'work' ? 'Trabajo' : 'Descanso'}`;
    }
    if (timerConfig.mode === 'stopwatch') {
      return 'Cronómetro en curso';
    }
    if (timerConfig.mode === 'countdown') {
      return 'Tiempo restante';
    }
    return SECTION_LABELS[phase as SectionKey] ?? '';
  };

  // --- Section subtitle (type + duration) ---
  const getSectionSubtitle = (): string | null => {
    if (!currentSection) return null;
    const parts: string[] = [];
    if (currentSection.type) parts.push(currentSection.type);
    if (currentSection.duration) parts.push(currentSection.duration);
    if (parts.length > 0) return parts.join(' ').toUpperCase();
    const suggested = getSuggestedDuration(currentSection);
    return suggested ? suggested.toUpperCase() : null;
  };

  // --- Countdown phase (3-2-1 GO) ---
  if (phase === 'countdown') {
    const display = timer.displaySeconds;
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-6">
          <span className="text-sm font-medium text-neutral-500">{wod.title}</span>
          <button
            onClick={handleClose}
            className="size-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-8xl sm:text-9xl font-mono font-bold text-white animate-timer-pulse timer-glow">
          {display > 0 ? display : 'GO'}
        </div>
        <p className="mt-4 text-neutral-500 text-sm">{wod.title}</p>
      </div>
    );
  }

  // --- Summary phase ---
  if (phase === 'summary') {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto">
        <LiveWorkoutSummary
          wod={wod}
          sectionTimes={sectionTimes}
          totalTimeSeconds={totalTimeSeconds}
          onContinue={handleSummaryContinue}
          onDiscard={handleSummaryDiscard}
        />
      </div>
    );
  }

  // --- Active section phase ---
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between p-4 pt-6 z-10 shrink-0">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="size-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Phase pills */}
        <div className="flex-1 mx-4">
          <div className="flex items-center justify-center gap-2">
            {SECTION_ORDER.map((key) => (
              key === phase ? (
                <span
                  key={key}
                  className={`${SECTION_PILL_ACTIVE[key]} text-xs font-bold px-3 py-1.5 rounded-full`}
                >
                  {SECTION_LABELS[key]}
                </span>
              ) : (
                <span key={key} className="size-2 rounded-full bg-white/20 shrink-0" />
              )
            ))}
          </div>
        </div>

        {/* Volume button */}
        <button
          onClick={toggleMute}
          className="size-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center gap-4 px-6 pb-4 pt-2 min-h-0 overflow-y-auto">
        {/* Workout header */}
        <div className="text-center w-full space-y-1">
          <h1 className="text-red-500 text-2xl sm:text-[32px] font-bold tracking-tight leading-tight flex items-center justify-center gap-2">
            <span className="text-2xl animate-pulse">{SECTION_EMOJIS[phase as SectionKey]}</span>
            {currentSection?.title}
          </h1>
          {getSectionSubtitle() && (
            <p className="text-white/60 text-sm font-medium tracking-wide uppercase">
              {getSectionSubtitle()}
            </p>
          )}
        </div>

        {/* Hero Timer */}
        <LiveTimerDisplay
          seconds={timer.displaySeconds}
          mode={timerConfig.mode}
          isRunning={timer.isRunning}
          phase={timer.phase}
          currentRound={timer.currentRound}
          totalRounds={timer.totalRounds}
          suggestedDuration={currentSection ? getSuggestedDuration(currentSection) : null}
          progressPercent={progressPercent}
        />

        {/* Exercise card */}
        {currentSection && (
          <LiveSectionView section={currentSection} />
        )}
      </main>

      {/* Controls & Footer */}
      <div className="w-full flex flex-col items-center gap-6 px-6 pb-8 shrink-0">
        {/* Control buttons */}
        <div className="flex items-center justify-between w-full max-w-[320px]">
          {/* Skip */}
          <button
            onClick={handleSkip}
            className="group flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <div className="size-14 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-white hover:bg-neutral-700 transition-colors">
              <SkipForward className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider group-hover:text-white/60">Sig.</span>
          </button>

          {/* Pause / Resume */}
          <button
            onClick={timer.isRunning ? timer.pause : timer.resume}
            className="group flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <div className="size-20 rounded-full bg-neutral-800 border-2 border-white/10 flex items-center justify-center text-white shadow-lg hover:bg-neutral-700 hover:border-white/20 transition-all">
              {timer.isRunning ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10" />}
            </div>
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider group-hover:text-white/60">
              {timer.isRunning ? 'Pausa' : 'Play'}
            </span>
          </button>

          {/* Finish */}
          <button
            onClick={handleFinishButton}
            className="group flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <div className="size-14 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white hover:border-transparent transition-all shadow-[0_0_15px_rgba(239,67,67,0.15)]">
              <Flag className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium text-red-500/60 uppercase tracking-wider group-hover:text-red-500">Fin</span>
          </button>
        </div>

        {/* Footer status */}
        <div className="text-center">
          <p className="text-white/40 text-sm font-medium tracking-wide">
            {getFooterStatus()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveWorkoutOverlay;
