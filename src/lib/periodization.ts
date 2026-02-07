import type { Wod } from '@/types/wod';

// --- Types ---

export interface WodRecord {
  id: string;
  wod: Wod;
  created_at: string;
}

export interface FeedbackRecord {
  difficulty_rating: number;
  total_time_minutes: number | null;
  rx_or_scaled: string;
  notes: string | null;
  wod_snapshot: Wod;
  created_at: string;
}

export interface DomainBalance {
  weightlifting: number;
  gymnastics: number;
  monostructural: number;
  patterns: { push: number; pull: number; squat: number; hinge: number; core: number };
  overrepresented: string[];
  underrepresented: string[];
}

export interface WeeklyLoad {
  currentWeek: { sessions: number; avgDifficulty: number | null; highIntensityDays: number };
  previousWeek: { sessions: number; avgDifficulty: number | null } | null;
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendation: 'push' | 'maintain' | 'recover';
}

export interface StrengthRotation {
  recent: Array<{ name: string; count: number; lastDate: string }>;
  suggested: string[];
  overused: string[];
}

export interface DeloadAssessment {
  consecutiveHighIntensity: number;
  totalSessions4Weeks: number;
  needsDeload: boolean;
  reason: string | null;
  weekPhase: 'build' | 'peak' | 'deload' | 'recovery';
}

export interface TrainingPattern {
  preferredDays: string[];
  avgSessionsPerWeek: number;
  daysSinceLastSession: number;
  isTypicalTrainingDay: boolean;
}

export interface PeriodizationAnalysis {
  domainBalance: DomainBalance | null;
  weeklyLoad: WeeklyLoad | null;
  strengthRotation: StrengthRotation | null;
  deload: DeloadAssessment | null;
  trainingPattern: TrainingPattern | null;
  hasEnoughData: boolean;
}

// --- Movement Classification ---

const MOVEMENT_DOMAINS: Record<string, RegExp[]> = {
  monostructural: [
    /\brun\b/i, /\bcorrer\b/i, /\bcarrera\b/i, /\brow\b/i, /\bremo\b/i,
    /\bbike\b/i, /\bbici\b/i, /\bski\b/i, /jump rope/i, /saltar cuerda/i,
    /double.?under/i, /single.?under/i, /\bsprint/i, /box jump/i, /\bsalto\b/i,
    /\bswim/i, /\bnadar/i,
  ],
  gymnastics: [
    /pull.?up/i, /dominada/i, /push.?up/i, /flexion/i, /flexión/i,
    /muscle.?up/i, /handstand/i, /parada de mano/i, /\bhspu\b/i, /\bpistol/i,
    /\bring\b/i, /anilla/i, /rope climb/i, /\bcuerda\b/i, /toes.?to.?bar/i,
    /\bt2b\b/i, /\bl-sit/i, /\bdip\b/i, /\bdips\b/i, /burpee/i,
    /\bplank\b/i, /\bplancha\b/i, /\bhollow\b/i, /\blever\b/i,
  ],
  weightlifting: [
    /\bclean\b/i, /\bsnatch\b/i, /deadlift/i, /peso muerto/i, /\bsquat\b/i,
    /sentadilla/i, /\bpress\b/i, /\bjerk\b/i, /thruster/i, /kettlebell/i,
    /\bkb\b/i, /dumbbell/i, /mancuerna/i, /wall ball/i, /\bswing\b/i,
    /barbell/i, /\bbarra\b/i, /\blunge\b/i, /zancada/i,
  ],
};

const MOVEMENT_PATTERNS: Record<string, RegExp[]> = {
  push: [/\bpress\b/i, /push.?up/i, /flexion/i, /flexión/i, /\bjerk\b/i, /thruster/i, /\bdip\b/i, /\bdips\b/i, /\bhspu\b/i],
  pull: [/pull.?up/i, /dominada/i, /\brow\b/i, /\bclean\b/i, /\bsnatch\b/i, /deadlift/i, /peso muerto/i, /rope climb/i],
  squat: [/\bsquat\b/i, /sentadilla/i, /thruster/i, /wall ball/i, /\bpistol/i, /\blunge\b/i, /zancada/i],
  hinge: [/deadlift/i, /peso muerto/i, /\bswing\b/i, /\bclean\b/i, /\bsnatch\b/i],
  core: [/toes.?to.?bar/i, /\bt2b\b/i, /sit.?up/i, /\bplank\b/i, /\bplancha\b/i, /\bhollow\b/i, /\bl-sit/i, /\bcore\b/i, /abdomen/i],
};

function classifyMovement(movement: string): {
  domain: 'weightlifting' | 'gymnastics' | 'monostructural' | 'unknown';
  patterns: string[];
} {
  let domain: 'weightlifting' | 'gymnastics' | 'monostructural' | 'unknown' = 'unknown';

  // Priority: monostructural > gymnastics > weightlifting (most distinct first)
  for (const [domainName, regexes] of Object.entries(MOVEMENT_DOMAINS)) {
    if (regexes.some((r) => r.test(movement))) {
      domain = domainName as typeof domain;
      break;
    }
  }

  const patterns: string[] = [];
  for (const [pattern, regexes] of Object.entries(MOVEMENT_PATTERNS)) {
    if (regexes.some((r) => r.test(movement))) {
      patterns.push(pattern);
    }
  }

  return { domain, patterns };
}

function extractMovements(wod: Wod): string[] {
  const movements: string[] = [];
  if (wod.metcon?.movements) movements.push(...wod.metcon.movements);
  if (wod.strengthSkill?.details) movements.push(...wod.strengthSkill.details);
  return movements;
}

// --- Date Helpers ---

const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function toLocalDate(isoString: string): Date {
  return new Date(isoString);
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000;
  const aStart = new Date(a); aStart.setHours(0, 0, 0, 0);
  const bStart = new Date(b); bStart.setHours(0, 0, 0, 0);
  return Math.round(Math.abs(bStart.getTime() - aStart.getTime()) / msPerDay);
}

// --- Analysis Functions ---

export function analyzeMovementDomains(wods: WodRecord[]): DomainBalance | null {
  if (wods.length < 5) return null;

  const counts = { weightlifting: 0, gymnastics: 0, monostructural: 0 };
  const patternCounts = { push: 0, pull: 0, squat: 0, hinge: 0, core: 0 };

  for (const record of wods) {
    const movements = extractMovements(record.wod);
    for (const m of movements) {
      const { domain, patterns } = classifyMovement(m);
      if (domain !== 'unknown') {
        counts[domain]++;
      }
      for (const p of patterns) {
        patternCounts[p as keyof typeof patternCounts]++;
      }
    }
  }

  const total = counts.weightlifting + counts.gymnastics + counts.monostructural;
  if (total === 0) return null;

  const overrepresented: string[] = [];
  const underrepresented: string[] = [];

  const domainLabels: Record<string, string> = {
    weightlifting: 'Halterofilia',
    gymnastics: 'Gimnásticos',
    monostructural: 'Monostructural',
  };

  for (const [key, count] of Object.entries(counts)) {
    const pct = count / total;
    if (pct > 0.4) overrepresented.push(domainLabels[key]);
    if (pct < 0.15) underrepresented.push(domainLabels[key]);
  }

  return {
    weightlifting: counts.weightlifting,
    gymnastics: counts.gymnastics,
    monostructural: counts.monostructural,
    patterns: patternCounts,
    overrepresented,
    underrepresented,
  };
}

export function analyzeWeeklyLoad(wods: WodRecord[], feedback: FeedbackRecord[]): WeeklyLoad | null {
  if (feedback.length === 0) return null;

  const now = new Date();
  const thisMonday = getMonday(now);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(lastMonday.getDate() - 7);

  // Count WODs per week
  let currentWeekSessions = 0;
  let previousWeekSessions = 0;

  for (const w of wods) {
    const d = toLocalDate(w.created_at);
    if (d >= thisMonday) {
      currentWeekSessions++;
    } else if (d >= lastMonday && d < thisMonday) {
      previousWeekSessions++;
    }
  }

  // Match feedback to weeks by date
  const currentWeekDifficulties: number[] = [];
  const previousWeekDifficulties: number[] = [];

  for (const f of feedback) {
    const d = toLocalDate(f.created_at);
    if (d >= thisMonday) {
      currentWeekDifficulties.push(f.difficulty_rating);
    } else if (d >= lastMonday && d < thisMonday) {
      previousWeekDifficulties.push(f.difficulty_rating);
    }
  }

  const avgCurrent = currentWeekDifficulties.length > 0
    ? currentWeekDifficulties.reduce((a, b) => a + b, 0) / currentWeekDifficulties.length
    : null;
  const avgPrevious = previousWeekDifficulties.length > 0
    ? previousWeekDifficulties.reduce((a, b) => a + b, 0) / previousWeekDifficulties.length
    : null;

  const highIntensityDays = currentWeekDifficulties.filter((d) => d >= 7).length;

  // Determine trend
  let trend: WeeklyLoad['trend'] = 'stable';
  if (avgCurrent !== null && avgPrevious !== null) {
    if (avgCurrent > avgPrevious + 1) trend = 'increasing';
    else if (avgCurrent < avgPrevious - 1) trend = 'decreasing';
  }

  // Determine recommendation
  let recommendation: WeeklyLoad['recommendation'] = 'maintain';
  if (highIntensityDays >= 3) {
    recommendation = 'recover';
  } else if (trend === 'increasing' && avgCurrent !== null && avgCurrent > 7.5) {
    recommendation = 'recover';
  } else if (currentWeekSessions === 0 && previousWeekSessions > 0) {
    recommendation = 'push';
  }

  return {
    currentWeek: {
      sessions: currentWeekSessions,
      avgDifficulty: avgCurrent !== null ? Math.round(avgCurrent * 10) / 10 : null,
      highIntensityDays,
    },
    previousWeek: previousWeekSessions > 0 || previousWeekDifficulties.length > 0
      ? { sessions: previousWeekSessions, avgDifficulty: avgPrevious !== null ? Math.round(avgPrevious * 10) / 10 : null }
      : null,
    trend,
    recommendation,
  };
}

export function analyzeStrengthRotation(wods: WodRecord[]): StrengthRotation | null {
  if (wods.length < 3) return null;

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const strengthMap = new Map<string, { count: number; lastDate: string }>();

  for (const record of wods) {
    const title = record.wod.strengthSkill?.title ?? '';
    // Parse: "Fuerza: Back Squat" → "Back Squat", "Habilidad: Handstand Walk" → "Handstand Walk"
    const match = title.match(/^(?:Fuerza|Habilidad|Skill|Strength)\s*:\s*(.+)/i);
    const name = match ? match[1].trim() : title.trim();
    if (!name) continue;

    const existing = strengthMap.get(name);
    if (existing) {
      existing.count++;
    } else {
      strengthMap.set(name, { count: 1, lastDate: record.created_at });
    }
  }

  const recent = Array.from(strengthMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);

  // Identify overused (3+ in 14 days) — only count recent WODs
  const recentWods = wods.filter((w) => toLocalDate(w.created_at) >= fourteenDaysAgo);
  const recentStrengthCounts = new Map<string, number>();
  for (const record of recentWods) {
    const title = record.wod.strengthSkill?.title ?? '';
    const match = title.match(/^(?:Fuerza|Habilidad|Skill|Strength)\s*:\s*(.+)/i);
    const name = match ? match[1].trim() : title.trim();
    if (!name) continue;
    recentStrengthCounts.set(name, (recentStrengthCounts.get(name) ?? 0) + 1);
  }

  const overused = Array.from(recentStrengthCounts.entries())
    .filter(([, count]) => count >= 3)
    .map(([name]) => name);

  // Suggest common strength movements that haven't appeared in 14 days
  const commonMovements = [
    'Back Squat', 'Front Squat', 'Overhead Squat', 'Deadlift', 'Shoulder Press',
    'Push Press', 'Push Jerk', 'Power Clean', 'Squat Clean', 'Power Snatch',
    'Bench Press', 'Strict Pull-ups', 'Weighted Pull-ups',
  ];
  const recentNames = new Set(recentStrengthCounts.keys());
  const suggested = commonMovements.filter((m) => !recentNames.has(m)).slice(0, 4);

  return { recent: recent.slice(0, 6), suggested, overused };
}

export function analyzeDeloadNeed(feedback: FeedbackRecord[]): DeloadAssessment | null {
  if (feedback.length === 0) return null;

  // Count consecutive high-intensity sessions (from most recent)
  let consecutiveHighIntensity = 0;
  for (const f of feedback) {
    if (f.difficulty_rating >= 8) {
      consecutiveHighIntensity++;
    } else {
      break;
    }
  }

  // Count sessions per week for last 4 weeks
  const now = new Date();
  const weekCounts = [0, 0, 0, 0]; // [this week, last week, 2 weeks ago, 3 weeks ago]
  const weekDifficulties: number[][] = [[], [], [], []];

  for (const f of feedback) {
    const d = toLocalDate(f.created_at);
    const daysAgo = daysBetween(d, now);
    const weekIndex = Math.floor(daysAgo / 7);
    if (weekIndex < 4) {
      weekCounts[weekIndex]++;
      weekDifficulties[weekIndex].push(f.difficulty_rating);
    }
  }

  const totalSessions4Weeks = weekCounts.reduce((a, b) => a + b, 0);

  // Determine if deload is needed
  let needsDeload = false;
  let reason: string | null = null;

  if (consecutiveHighIntensity >= 3) {
    needsDeload = true;
    reason = `${consecutiveHighIntensity} sesiones consecutivas de alta intensidad (8+/10)`;
  }

  if (!needsDeload) {
    // Check if 3 consecutive weeks with 4+ sessions and avg difficulty > 7
    let highLoadWeeks = 0;
    for (let i = 0; i < 3; i++) {
      const weekAvg = weekDifficulties[i].length > 0
        ? weekDifficulties[i].reduce((a, b) => a + b, 0) / weekDifficulties[i].length
        : 0;
      if (weekCounts[i] >= 4 && weekAvg > 7) {
        highLoadWeeks++;
      }
    }
    if (highLoadWeeks >= 3) {
      needsDeload = true;
      reason = '3 semanas consecutivas de alta carga (4+ sesiones, dificultad >7)';
    }
  }

  // Determine week phase
  let weekPhase: DeloadAssessment['weekPhase'] = 'build';
  if (needsDeload) {
    weekPhase = 'deload';
  } else if (consecutiveHighIntensity >= 2) {
    weekPhase = 'peak';
  } else {
    // Simple heuristic: if previous week was a deload (low sessions or difficulty)
    const lastWeekAvg = weekDifficulties[1].length > 0
      ? weekDifficulties[1].reduce((a, b) => a + b, 0) / weekDifficulties[1].length
      : 0;
    if (weekCounts[1] <= 2 && lastWeekAvg < 5) {
      weekPhase = 'recovery';
    }
  }

  return {
    consecutiveHighIntensity,
    totalSessions4Weeks,
    needsDeload,
    reason,
    weekPhase,
  };
}

export function analyzeTrainingPattern(wods: WodRecord[]): TrainingPattern | null {
  if (wods.length < 3) return null;

  // Count WODs per day of week
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun=0 through Sat=6

  for (const record of wods) {
    const d = toLocalDate(record.created_at);
    dayCounts[d.getDay()]++;
  }

  // Find preferred days (any day with count >= average)
  const totalDays = dayCounts.reduce((a, b) => a + b, 0);
  const avgPerDay = totalDays / 7;
  const preferredDays: string[] = [];
  // Sort by count descending, then filter
  const dayEntries = dayCounts
    .map((count, index) => ({ day: index, count }))
    .filter((e) => e.count > avgPerDay)
    .sort((a, b) => b.count - a.count);

  for (const entry of dayEntries) {
    preferredDays.push(DAY_NAMES_ES[entry.day]);
  }

  // Average sessions per week
  const dates = wods.map((w) => toLocalDate(w.created_at));
  const earliest = dates[dates.length - 1];
  const latest = dates[0];
  const weeks = Math.max(1, daysBetween(earliest, latest) / 7);
  const avgSessionsPerWeek = Math.round((wods.length / weeks) * 10) / 10;

  // Days since last session
  const now = new Date();
  const daysSinceLastSession = dates.length > 0 ? daysBetween(dates[0], now) : 0;

  // Is today a typical training day?
  const todayDow = now.getDay();
  const isTypicalTrainingDay = dayCounts[todayDow] > avgPerDay;

  return {
    preferredDays,
    avgSessionsPerWeek,
    daysSinceLastSession,
    isTypicalTrainingDay,
  };
}

// --- Orchestrators ---

export function buildPeriodizationAnalysis(
  wods: WodRecord[],
  feedback: FeedbackRecord[]
): PeriodizationAnalysis {
  const hasEnoughData = wods.length >= 3;

  return {
    domainBalance: analyzeMovementDomains(wods),
    weeklyLoad: analyzeWeeklyLoad(wods, feedback),
    strengthRotation: analyzeStrengthRotation(wods),
    deload: analyzeDeloadNeed(feedback),
    trainingPattern: analyzeTrainingPattern(wods),
    hasEnoughData,
  };
}

export function buildPeriodizationContext(analysis: PeriodizationAnalysis): string {
  if (!analysis.hasEnoughData) return '';

  const sections: string[] = ['INTELIGENCIA DE PERIODIZACIÓN:'];

  // Domain balance
  if (analysis.domainBalance) {
    const db = analysis.domainBalance;
    const total = db.weightlifting + db.gymnastics + db.monostructural;
    const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

    const lines = ['BALANCE DE DOMINIOS (últimas 4 semanas):'];
    lines.push(`- Halterofilia: ${pct(db.weightlifting)}%${db.overrepresented.includes('Halterofilia') ? ' (SOBREREPRESENTADO)' : ''}${db.underrepresented.includes('Halterofilia') ? ' (SUBREPRESENTADO)' : ''}`);
    lines.push(`- Gimnásticos: ${pct(db.gymnastics)}%${db.overrepresented.includes('Gimnásticos') ? ' (SOBREREPRESENTADO)' : ''}${db.underrepresented.includes('Gimnásticos') ? ' (SUBREPRESENTADO)' : ''}`);
    lines.push(`- Monostructural: ${pct(db.monostructural)}%${db.overrepresented.includes('Monostructural') ? ' (SOBREREPRESENTADO)' : ''}${db.underrepresented.includes('Monostructural') ? ' (SUBREPRESENTADO)' : ''}`);

    const p = db.patterns;
    const lowPatterns = Object.entries(p).filter(([, v]) => v <= 2).map(([k]) => k);
    lines.push(`- Patrones: Push ${p.push}, Pull ${p.pull}, Squat ${p.squat}, Hinge ${p.hinge}, Core ${p.core}${lowPatterns.length > 0 ? ` (${lowPatterns.join(', ')} BAJO)` : ''}`);

    const directives: string[] = [];
    if (db.underrepresented.length > 0) directives.push(`Incluir más trabajo de: ${db.underrepresented.join(', ')}.`);
    if (db.overrepresented.length > 0) directives.push(`Reducir: ${db.overrepresented.join(', ')}.`);
    if (lowPatterns.length > 0) directives.push(`Patrones bajos: incluir movimientos de ${lowPatterns.join(', ')}.`);
    if (directives.length > 0) lines.push(`- DIRECTIVA: ${directives.join(' ')}`);

    sections.push(lines.join('\n'));
  }

  // Weekly load
  if (analysis.weeklyLoad) {
    const wl = analysis.weeklyLoad;
    const lines = ['CARGA SEMANAL:'];
    lines.push(`- Esta semana: ${wl.currentWeek.sessions} sesiones${wl.currentWeek.avgDifficulty !== null ? `, dificultad promedio ${wl.currentWeek.avgDifficulty}/10` : ''}${wl.currentWeek.highIntensityDays > 0 ? `, ${wl.currentWeek.highIntensityDays} de alta intensidad` : ''}`);
    if (wl.previousWeek) {
      lines.push(`- Semana anterior: ${wl.previousWeek.sessions} sesiones${wl.previousWeek.avgDifficulty !== null ? `, dificultad promedio ${wl.previousWeek.avgDifficulty}/10` : ''}`);
    }
    const trendLabels = { increasing: 'INCREMENTANDO', stable: 'ESTABLE', decreasing: 'DISMINUYENDO' };
    lines.push(`- Tendencia: ${trendLabels[wl.trend]}`);

    const recLabels = {
      push: 'Buena oportunidad para una sesión intensa. El atleta viene descansado.',
      maintain: 'Mantener intensidad similar. Balance adecuado.',
      recover: 'Carga alta acumulada. Considerar sesión de intensidad moderada o enfoque técnico.',
    };
    lines.push(`- DIRECTIVA: ${recLabels[wl.recommendation]}`);

    sections.push(lines.join('\n'));
  }

  // Strength rotation
  if (analysis.strengthRotation) {
    const sr = analysis.strengthRotation;
    const lines = ['ROTACIÓN DE FUERZA/HABILIDAD:'];

    if (sr.recent.length > 0) {
      const recentStr = sr.recent.slice(0, 4).map((r) => `${r.name} (x${r.count})`).join(', ');
      lines.push(`- Recientes: ${recentStr}`);
    }
    if (sr.overused.length > 0) {
      lines.push(`- Sobreusado: ${sr.overused.join(', ')}`);
    }
    if (sr.suggested.length > 0) {
      lines.push(`- Sugeridos (no recientes): ${sr.suggested.join(', ')}`);
    }

    const directives: string[] = [];
    if (sr.overused.length > 0) directives.push(`Rotar fuerza a un movimiento distinto de ${sr.overused.join('/')}.`);
    if (sr.suggested.length > 0) directives.push(`Considerar: ${sr.suggested.slice(0, 3).join(', ')}.`);
    if (directives.length > 0) lines.push(`- DIRECTIVA: ${directives.join(' ')}`);

    sections.push(lines.join('\n'));
  }

  // Deload assessment
  if (analysis.deload) {
    const dl = analysis.deload;
    const lines = ['EVALUACIÓN DE DELOAD:'];
    lines.push(`- Sesiones alta intensidad consecutivas: ${dl.consecutiveHighIntensity}`);
    lines.push(`- Total sesiones (4 semanas): ${dl.totalSessions4Weeks}`);

    const phaseLabels = { build: 'BUILD', peak: 'PEAK', deload: 'DELOAD', recovery: 'RECOVERY' };
    lines.push(`- Fase sugerida: ${phaseLabels[dl.weekPhase]}`);

    if (dl.needsDeload && dl.reason) {
      lines.push(`- DIRECTIVA: DELOAD RECOMENDADO. Razón: ${dl.reason}. Reducir volumen e intensidad un 30-40%. Enfoque en técnica y movilidad.`);
    } else if (dl.weekPhase === 'peak') {
      lines.push('- DIRECTIVA: Fase de pico. Mantener intensidad pero controlar volumen total.');
    } else if (dl.weekPhase === 'recovery') {
      lines.push('- DIRECTIVA: Fase de recuperación. Incrementar progresivamente la carga.');
    } else {
      lines.push('- DIRECTIVA: Fase de construcción. Mantener progresión gradual.');
    }

    sections.push(lines.join('\n'));
  }

  // Training pattern
  if (analysis.trainingPattern) {
    const tp = analysis.trainingPattern;
    const lines = ['PATRÓN DE ENTRENAMIENTO:'];
    if (tp.preferredDays.length > 0) {
      lines.push(`- Días habituales: ${tp.preferredDays.join(', ')}`);
    }
    lines.push(`- Promedio: ${tp.avgSessionsPerWeek} sesiones/semana`);
    lines.push(`- Último entrenamiento: hace ${tp.daysSinceLastSession} ${tp.daysSinceLastSession === 1 ? 'día' : 'días'}`);

    const todayName = DAY_NAMES_ES[new Date().getDay()];
    if (tp.isTypicalTrainingDay) {
      lines.push(`- Hoy (${todayName}) ES un día habitual de entrenamiento`);
    } else {
      lines.push(`- Hoy (${todayName}) NO es un día habitual de entrenamiento`);
      lines.push('- DIRECTIVA: Entrenamiento fuera de patrón habitual. Considerar sesión técnica o de recuperación activa.');
    }

    if (tp.daysSinceLastSession >= 3) {
      lines.push(`- DIRECTIVA: ${tp.daysSinceLastSession} días sin entrenar. Incluir calentamiento más gradual y evitar carga máxima.`);
    }

    sections.push(lines.join('\n'));
  }

  return sections.join('\n\n');
}
