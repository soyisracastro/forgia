'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Wod, WodSection } from '@/types/wod';
import { useTimer, type TimerConfig, type TimerState } from '@/hooks/useTimer';
import { useAudioCues } from '@/hooks/useAudioCues';
import { useWakeLock } from '@/hooks/useWakeLock';
import LiveTimerDisplay from './LiveTimerDisplay';
import LiveSectionView from './LiveSectionView';
import LiveWorkoutSummary from './LiveWorkoutSummary';

type SectionKey = 'warmUp' | 'strengthSkill' | 'metcon' | 'coolDown';
type WorkoutPhase = 'countdown' | SectionKey | 'summary';

const SECTION_ORDER: SectionKey[] = ['warmUp', 'strengthSkill', 'metcon', 'coolDown'];

const SECTION_LABELS: Record<SectionKey, string> = {
  warmUp: 'Calentamiento',
  strengthSkill: 'Fuerza / Skill',
  metcon: 'Metcon',
  coolDown: 'Vuelta a la calma',
};

const PHASE_COLORS: Record<SectionKey, string> = {
  warmUp: 'bg-amber-500',
  strengthSkill: 'bg-blue-500',
  metcon: 'bg-red-500',
  coolDown: 'bg-emerald-500',
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
  // Match patterns like "12 min", "10-15 min", "20 minutos"
  const match = text.match(/(\d+)(?:\s*[-–]\s*\d+)?\s*min/i);
  if (match) return parseInt(match[1], 10);
  // Standalone number (e.g., in EMOM "cada minuto por 12 minutos")
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

// --- Icons ---

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>
);

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="6 3 20 12 6 21 6 3"/></svg>
);

const SkipIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>
);

const VolumeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
);

const VolumeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>
);

const StopIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
);

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
    // Countdown beeps for last 3 seconds
    if (timerConfig.mode !== 'stopwatch' && state.displaySeconds <= 3 && state.displaySeconds > 0) {
      playBeep('tick');
    }
  }, [timerConfig.mode, playBeep]);

  const handleRoundChange = useCallback(() => {
    playBeep('transition');
  }, [playBeep]);

  const advancePhase = useCallback(() => {
    // Record time for current section
    if (currentSectionKey) {
      const elapsed = Math.floor((Date.now() - sectionStartRef.current) / 1000);
      setSectionTimes((prev) => ({ ...prev, [currentSectionKey]: elapsed }));
    }

    if (phase === 'countdown') {
      // Start workout
      totalStartRef.current = Date.now();
      sectionStartRef.current = Date.now();
      setPhase('warmUp');
    } else if (currentSectionKey) {
      const idx = SECTION_ORDER.indexOf(currentSectionKey);
      if (idx < SECTION_ORDER.length - 1) {
        sectionStartRef.current = Date.now();
        setPhase(SECTION_ORDER[idx + 1]);
      } else {
        // Freeze total time before entering summary
        setFinalTotalSeconds(Math.floor((Date.now() - totalStartRef.current) / 1000));
        setPhase('summary');
      }
    }
  }, [phase, currentSectionKey]);

  const handleTimerFinish = useCallback(() => {
    playBeep('finish');
    // Auto-advance after timed sections finish
    // Small delay so the user can see the 00:00
    setTimeout(advancePhase, 1500);
  }, [playBeep, advancePhase]);

  const timer = useTimer({
    config: timerConfig,
    onTick: handleTick,
    onRoundChange: handleRoundChange,
    onFinish: handleTimerFinish,
  });

  // --- Phase transitions: auto-start timer ---
  useEffect(() => {
    timer.reset();
    // Small delay for visual transition
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
    // Save state periodically
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

  // Check for recovery on mount
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

  // Cleanup storage on unmount if finished/cancelled
  useEffect(() => {
    return () => {
      // Only clean if we're leaving
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
    // Record time and advance
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

  const totalTimeSeconds = finalTotalSeconds ?? (
    totalStartRef.current ? Math.floor((Date.now() - totalStartRef.current) / 1000) : 0
  );

  const handleSummaryContinue = () => {
    const totalMinutes = Math.round(totalTimeSeconds / 60 * 10) / 10;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    onFinish(totalMinutes);
  };

  const handleSummaryDiscard = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    onCancel();
  };

  // --- Countdown phase (3-2-1 GO) ---
  if (phase === 'countdown') {
    const display = timer.displaySeconds;
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium text-neutral-500">{wod.title}</span>
          <button onClick={handleClose} className="p-2 text-neutral-400 hover:text-white transition-colors">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="text-8xl sm:text-9xl font-mono font-bold text-white animate-timer-pulse">
          {display > 0 ? display : 'GO'}
        </div>
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
  const sectionIndex = SECTION_ORDER.indexOf(phase as SectionKey);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          {/* Section indicator dots */}
          <div className="flex gap-1.5">
            {SECTION_ORDER.map((key, i) => (
              <div
                key={key}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= sectionIndex ? PHASE_COLORS[key] : 'bg-neutral-700'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-neutral-400">
            {SECTION_LABELS[phase as SectionKey]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeIcon />}
          </button>
          <button
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 overflow-hidden">
        <LiveTimerDisplay
          seconds={timer.displaySeconds}
          mode={timerConfig.mode}
          isRunning={timer.isRunning}
          phase={timer.phase}
          currentRound={timer.currentRound}
          totalRounds={timer.totalRounds}
          suggestedDuration={currentSection ? getSuggestedDuration(currentSection) : null}
        />

        {currentSection && currentSectionKey && (
          <LiveSectionView
            section={currentSection}
            sectionType={currentSectionKey}
          />
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-4 px-6 py-6 shrink-0">
        {/* Pause/Resume */}
        <button
          onClick={timer.isRunning ? timer.pause : timer.resume}
          className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition-colors"
        >
          {timer.isRunning ? (
            <>
              <PauseIcon className="h-5 w-5" />
              Pausar
            </>
          ) : (
            <>
              <PlayIcon className="h-5 w-5" />
              Reanudar
            </>
          )}
        </button>

        {/* For Time: Finish button */}
        {isForTime && (
          <button
            onClick={handleForTimeFinish}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            <StopIcon className="h-5 w-5" />
            Terminar
          </button>
        )}

        {/* Skip to next */}
        <button
          onClick={handleSkip}
          className="flex items-center gap-2 px-6 py-3 border border-neutral-600 hover:bg-neutral-800 text-neutral-300 font-semibold rounded-lg transition-colors"
        >
          <SkipIcon className="h-5 w-5" />
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default LiveWorkoutOverlay;
