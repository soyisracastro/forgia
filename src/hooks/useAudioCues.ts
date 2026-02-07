'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

type BeepType = 'tick' | 'transition' | 'finish';

const STORAGE_KEY = 'live-workout-muted';

export function useAudioCues() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    // Resume if suspended (autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((frequency: number, durationMs: number, startOffset = 0) => {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.value = 0.3;

    const start = ctx.currentTime + startOffset;
    osc.start(start);
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + durationMs / 1000);
    osc.stop(start + durationMs / 1000 + 0.01);
  }, [getContext]);

  const playBeep = useCallback((type: BeepType) => {
    if (isMuted) return;

    try {
      switch (type) {
        case 'tick':
          playTone(880, 80);
          break;
        case 'transition':
          playTone(660, 80, 0);
          playTone(660, 80, 0.12);
          break;
        case 'finish':
          playTone(440, 400, 0);
          playTone(440, 400, 0.5);
          playTone(880, 500, 1.0);
          break;
      }
    } catch {
      // Web Audio API may not be available
    }
  }, [isMuted, playTone]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  return { playBeep, isMuted, toggleMute };
}
