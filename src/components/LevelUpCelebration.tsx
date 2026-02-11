'use client';

import { useEffect, useState } from 'react';
import type { ExperienceLevel } from '@/types/profile';

interface LevelUpCelebrationProps {
  newLevel: ExperienceLevel;
  onClose: () => void;
}

const LEVEL_MESSAGES: Record<string, string> = {
  Principiante: 'Has demostrado dominio de los fundamentos. Ahora puedes trabajar con movimientos y pesos reales.',
  Intermedio: 'Tu capacidad de trabajo es impresionante. Es hora de atacar movimientos complejos y cargas moderadas.',
  Avanzado: 'Eres un atleta de elite. Dominas los movimientos olímpicos y la gimnasia avanzada.',
};

export default function LevelUpCelebration({ newLevel, onClose }: LevelUpCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Confetti particles (CSS-only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][i % 5],
              width: `${6 + Math.random() * 6}px`,
              height: `${6 + Math.random() * 6}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className={`relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl max-w-sm w-full p-8 text-center transition-transform duration-300 ${
          visible ? 'scale-100' : 'scale-90'
        }`}
      >
        {/* Trophy */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Nivel Alcanzado
        </h2>

        <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-red-500 text-white font-bold text-lg">
          {newLevel}
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
          {LEVEL_MESSAGES[newLevel] || 'Has alcanzado un nuevo nivel. Sigue entrenando duro.'}
        </p>

        <button
          onClick={handleClose}
          className="w-full py-3 text-sm font-bold uppercase tracking-wider text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all duration-200"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
