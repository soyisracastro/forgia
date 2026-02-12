import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/profile';
import { buildPeriodizationAnalysis, buildPeriodizationContext } from '@/lib/periodization';
import type { WodRecord, FeedbackRecord as PeriodizationFeedbackRecord } from '@/lib/periodization';
import type { ProgramWeek } from '@/types/program';

// --- Feedback context ---

interface FeedbackRecord {
  difficulty_rating: number;
  total_time_minutes: number | null;
  rx_or_scaled: string;
  notes: string | null;
  wod_snapshot: { title: string; metcon: { movements?: string[] } };
  created_at: string;
}

function buildFeedbackContext(feedbackRecords: FeedbackRecord[]): string {
  if (!feedbackRecords.length) return '';

  const avgDifficulty = feedbackRecords.reduce((sum, f) => sum + f.difficulty_rating, 0) / feedbackRecords.length;

  const recentMovements = feedbackRecords
    .flatMap((f) => f.wod_snapshot.metcon?.movements ?? [])
    .slice(0, 15);

  const lines: string[] = [
    'HISTORIAL DE RENDIMIENTO RECIENTE:',
    `- Entrenamientos registrados: ${feedbackRecords.length}`,
    `- Dificultad promedio percibida: ${avgDifficulty.toFixed(1)}/10`,
  ];

  if (avgDifficulty < 4) {
    lines.push('- DIRECTIVA: El atleta encuentra los entrenamientos fáciles. AUMENTAR la intensidad, cargas, y/o volumen.');
  } else if (avgDifficulty > 8) {
    lines.push('- DIRECTIVA: El atleta encuentra los entrenamientos muy difíciles. REDUCIR ligeramente la intensidad o volumen. Priorizar recuperación.');
  } else {
    lines.push('- DIRECTIVA: La intensidad parece adecuada. Mantener nivel similar con variación de estímulos.');
  }

  const scaledCount = feedbackRecords.filter((f) => f.rx_or_scaled === 'Scaled').length;
  if (scaledCount > feedbackRecords.length / 2) {
    lines.push('- El atleta frecuentemente escala los WODs. Diseñar entrenamientos más accesibles con opciones de escalado claras.');
  }

  if (recentMovements.length > 0) {
    lines.push(`- Movimientos recientes (evitar repetir): ${recentMovements.join(', ')}`);
  }

  for (const f of feedbackRecords.slice(0, 3)) {
    const date = new Date(f.created_at).toLocaleDateString('es-ES');
    lines.push(`  · ${date}: "${f.wod_snapshot.title}" — Dificultad ${f.difficulty_rating}/10, ${f.rx_or_scaled}${f.total_time_minutes ? `, ${f.total_time_minutes}min` : ''}${f.notes ? ` — "${f.notes}"` : ''}`);
  }

  return lines.join('\n');
}

// --- Program context ---

function buildProgramContext(weeks: ProgramWeek[], weekNumber: number, sessionIndex: number): string {
  const week = weeks.find((w) => w.number === weekNumber);
  if (!week) return '';

  const session = week.sessions[sessionIndex];
  if (!session) return '';

  const lines = [
    'PROGRAMA MENSUAL ACTIVO:',
    `- Semana actual: ${weekNumber} de 4 (${week.focus})`,
    `- Sesión de hoy: ${sessionIndex + 1} de ${week.sessions.length}`,
    `- Tipo de sesión: ${session.type}`,
    `- Énfasis: ${session.emphasis}`,
    `- Intensidad objetivo: ${session.intensity}`,
    `- Skill focus de la semana: ${week.skillFocus}`,
    'DIRECTIVA: Diseña el WOD siguiendo esta estructura. El tipo de sesión y la intensidad son obligatorios. Adapta el WOD al tipo indicado.',
  ];

  return lines.join('\n');
}

// --- Personal Records context ---

interface PRRecord {
  movement_name: string;
  record_type: string;
  value: number;
  unit: string;
}

function buildPRContext(records: PRRecord[]): string {
  if (!records.length) return '';

  const lines: string[] = [
    'RECORDS PERSONALES DEL ATLETA (1RM más recientes):',
    ...records.map((r) => `- ${r.movement_name} ${r.record_type}: ${r.value} ${r.unit}`),
    '',
    'DIRECTIVA: Usa estos records para prescribir pesos específicos basados en porcentajes del 1RM cuando el movimiento coincida. Ejemplo: si Back Squat 1RM = 225 lbs, prescribir "Back Squat @ 70% (155 lbs)".',
  ];

  return lines.join('\n');
}

// --- Prompt builders ---

function buildSystemInstruction(profile: Profile, feedbackContext?: string, periodizationContext?: string, programContext?: string, prContext?: string): string {
  const sections = [
    `Eres un coach de CrossFit certificado de nivel elite con más de 15 años de experiencia. Tu especialidad es crear entrenamientos personalizados que se adaptan al perfil único de cada atleta.

REGLAS ESTRICTAS:
- Todo el contenido DEBE estar en español.
- Los pesos se expresan en ${profile.weight_unit === 'kg' ? 'kilogramos (kg)' : 'libras (lbs)'}. Usa notación CrossFit estándar: ${profile.weight_unit === 'kg' ? "'61/43 kg' (hombres/mujeres)" : "'135/95 lbs' (hombres/mujeres)"}. Las distancias en metros (m).
- Cada WOD debe ser único, variado, y no repetir patrones obvios.
- El WOD debe ser realista y ejecutable en una sesión de 45-60 minutos.
- Siempre incluir opciones de escalado en las notas cuando sea apropiado.
- Los nombres de ejercicios pueden estar en inglés cuando son términos técnicos universales (Clean & Jerk, Snatch, Muscle-up, etc.), pero las instrucciones y descripciones deben estar en español.

PERFIL DEL ATLETA:
- Nombre: ${profile.display_name || 'Atleta'}
- Edad: ${profile.age ? `${profile.age} años` : 'No especificada'}
- Nivel de experiencia: ${profile.experience_level || 'Intermedio'}
- Equipamiento disponible: ${profile.equipment_level || 'No especificado'}
- Objetivos: ${profile.objectives?.length ? profile.objectives.join(', ') : 'General fitness'}
- Frecuencia de entrenamiento: ${profile.training_frequency ? `${profile.training_frequency} días/semana` : 'No especificada'}
- Historial de lesiones o limitaciones: ${profile.injury_history?.trim() || 'Ninguno reportado'}`,

    buildLevelDirectives(profile),
    buildEquipmentDirectives(profile),
    buildObjectiveDirectives(profile),
    buildInjuryDirectives(profile),
    buildAgeDirectives(profile),
    feedbackContext || '',
    periodizationContext || '',
    programContext || '',
    prContext || '',
  ];

  return sections.filter(Boolean).join('\n\n');
}

function buildLevelDirectives(profile: Profile): string {
  switch (profile.experience_level) {
    case 'Novato':
      return `NIVEL NOVATO (sin experiencia previa en entrenamiento funcional):
- SOLO movimientos básicos universalmente conocidos: sentadillas (air squats), lagartijas (push-ups), zancadas (lunges), plancha (plank), jumping jacks, correr en el sitio.
- NO usar terminología específica de CrossFit sin explicar qué significa y cómo se ejecuta.
- CERO movimientos con barra, kettlebell pesada o equipamiento complejo.
- El metcon debe ser MUY CORTO: 5-8 minutos máximo.
- Incluir descansos generosos entre ejercicios (30-60 segundos).
- CADA movimiento debe incluir una breve descripción de cómo ejecutarlo correctamente.
- Enfocarse en construir patrones de movimiento fundamentales y acondicionamiento base.
- Repeticiones bajas y manejables (5-8 por movimiento).
- El calentamiento debe ser especialmente detallado, gradual y explicativo.
- Pesos: SOLO peso corporal. No incluir peso externo.
- Priorizar la confianza del atleta: movimientos que pueda hacer bien desde el primer intento.`;
    case 'Principiante':
      return `NIVEL PRINCIPIANTE:
- Priorizar movimientos fundamentales y mecánica correcta.
- Evitar movimientos complejos de halterofilia olímpica (no Snatch, no Clean & Jerk); usar variantes con mancuernas o kettlebells.
- No incluir movimientos gimnásticos avanzados (no muscle-ups, no handstand walks).
- Pesos moderados a ligeros. Usar rangos de repeticiones manejables (8-12).
- El metcon debe ser de duración moderada (8-15 minutos).
- Incluir instrucciones claras de escalado.`;
    case 'Avanzado':
      return `NIVEL AVANZADO:
- Incluir movimientos complejos de halterofilia y gimnásticos avanzados.
- Pesos pesados y exigentes (expresar como % de 1RM cuando sea apropiado).
- Metcons intensos y variados (chipper, couplets, triplets).
- Puede incluir: muscle-ups, handstand walks, pistol squats, rope climbs, etc.
- Volumen alto es aceptable. Duración de metcon: 12-25 minutos.`;
    default:
      return `NIVEL INTERMEDIO:
- Mezcla de movimientos fundamentales y algunos avanzados con escalado.
- Puede incluir halterofilia olímpica con pesos moderados.
- Movimientos gimnásticos intermedios: pull-ups, toes-to-bar, handstand push-ups (con escalado).
- Pesos moderados a pesados. Duración de metcon: 10-20 minutos.`;
  }
}

function buildEquipmentDirectives(profile: Profile): string {
  switch (profile.equipment_level) {
    case 'Box completo':
      return `EQUIPAMIENTO - BOX COMPLETO:
- Usa todo el equipamiento disponible: barras, discos, remo, esquí erg, assault bike, anillas, cuerdas, cajas, kettlebells, mancuernas, wall balls, etc.
- Varía el equipamiento entre sesiones.`;
    case 'Box equipado básico':
      return `EQUIPAMIENTO - BOX BÁSICO:
- Equipamiento disponible: barra olímpica, discos, mancuernas, kettlebells, cajas pliométricas, bandas.
- NO incluir: remadora, esquí erg, assault bike, anillas, cuerdas de trepar.
- Sustituir cardio con: correr, burpees, saltar cuerda, shuttle runs.`;
    case 'Peso corporal + equipamiento mínimo':
      return `EQUIPAMIENTO - MÍNIMO / PESO CORPORAL:
- Ejercicios principalmente con peso corporal.
- Puede incluir: mancuernas ligeras o kettlebells si están disponibles, pero diseñar de manera que funcione sin ellas.
- NO incluir barras olímpicas, racks, máquinas de cardio.
- Enfocarse en: push-ups, air squats, lunges, burpees, mountain climbers, planks, jumping jacks, correr, etc.`;
    default:
      return `EQUIPAMIENTO: Adaptar al equipamiento que el atleta tenga disponible.`;
  }
}

function buildObjectiveDirectives(profile: Profile): string {
  if (!profile.objectives?.length) return '';

  const directives: string[] = ['ADAPTACIÓN A OBJETIVOS:'];

  for (const obj of profile.objectives) {
    switch (obj) {
      case 'Ganar fuerza':
        directives.push('- FUERZA: La sección de Fuerza/Habilidad debe ser prominente. Incluir series pesadas (3-5 reps), descansos adecuados. El metcon puede ser más corto pero con cargas.');
        break;
      case 'Ganar masa muscular':
        directives.push('- HIPERTROFIA: Incluir trabajo accesorio con volumen (3-4 series de 8-12 reps). El metcon puede incluir ejercicios de aislamiento. Tempo controlado.');
        break;
      case 'Perder peso':
        directives.push('- PÉRDIDA DE PESO: Priorizar metcons de alta intensidad y larga duración. Circuitos con poco descanso. Incluir movimientos compuestos que quemen muchas calorías.');
        break;
      case 'Reducir tallas':
        directives.push('- REDUCCIÓN DE TALLAS: Similar a pérdida de peso. Combinar cardio con trabajo de resistencia. HIIT. Circuitos de cuerpo completo.');
        break;
      case 'Mejorar resistencia':
        directives.push('- RESISTENCIA: Metcons más largos (15-25 min). Incluir trabajo aeróbico. AMRAPs y EMOMs de mayor duración. Pace sostenible.');
        break;
      case 'Mejorar movilidad':
        directives.push('- MOVILIDAD: El calentamiento y enfriamiento deben ser más extensos con trabajo de movilidad articular específico. Incluir ejercicios de flexibilidad activa.');
        break;
      case 'Preparación para competencia':
        directives.push('- COMPETENCIA: Alta intensidad y variedad. Incluir movimientos de competencia. Simular formatos de competencia (couplets, triplets, chippers). Trabajar debilidades.');
        break;
      case 'Preparación HYROX':
        directives.push(`- PREPARACIÓN HYROX: El atleta se prepara para competir en HYROX (8km carrera + 8 estaciones funcionales).
- CONCEPTO CLAVE: "Running Comprometido" - correr bajo fatiga de estaciones funcionales.
- Incluir SIEMPRE trabajo de carrera (zona 2 o intervalos) en el WOD.
- Estaciones HYROX a simular: SkiErg, Sled Push/Pull, Burpee Broad Jump, Rowing, Farmers Carry, Sandbag Lunges, Wall Balls.
- Formato frecuente: "Sándwich de Fatiga" → Carrera + Estación + Carrera.
- NO incluir movimientos de alta complejidad técnica (no Snatch, no Muscle-ups). Enfocarse en transferencia directa a HYROX.
- Técnicas clave: Sled Push a 45° con pasos cortos, Rowing 60% piernas, Wall Balls rompiendo series temprano.
- REGLA DEL 85%: Pacing conservador. El primer kilómetro debe ser el más lento.
- Metcons más largos que CrossFit tradicional (20-40 min para simular duración de carrera HYROX).
- Priorizar base aeróbica y resistencia sobre fuerza máxima.`);
        break;
    }
  }

  return directives.join('\n');
}

function buildInjuryDirectives(profile: Profile): string {
  if (!profile.injury_history?.trim()) return '';

  return `LESIONES/LIMITACIONES CRÓNICAS (MUY IMPORTANTE):
El atleta reporta: "${profile.injury_history}"
- NUNCA incluir ejercicios que puedan agravar esta condición.
- Siempre ofrecer alternativas seguras para movimientos que involucren la zona afectada.
- Priorizar la seguridad sobre la intensidad.`;
}

function buildAgeDirectives(profile: Profile): string {
  if (!profile.age) return '';

  if (profile.age >= 50) {
    return `CONSIDERACIONES DE EDAD (${profile.age} años):
- Mayor énfasis en calentamiento y enfriamiento. Calentamiento más gradual.
- Priorizar movimientos de bajo impacto cuando sea posible.
- Incluir más trabajo de movilidad y estabilidad.
- Volumen e intensidad moderados. Evitar saltos de alto impacto excesivos.`;
  }

  if (profile.age < 18) {
    return `CONSIDERACIONES DE EDAD (${profile.age} años):
- Atleta joven/adolescente. Priorizar técnica y desarrollo motor.
- Evitar cargas máximas (no trabajar por encima de 80% 1RM).
- Incluir variedad de patrones de movimiento para desarrollo atlético general.`;
  }

  return '';
}

function buildUserPrompt(sessionNotes: string): string {
  let prompt = 'Genera el WOD del día para este atleta. Asegúrate de que sea único, variado, y diferente a entrenamientos típicos.';

  if (sessionNotes) {
    prompt += `\n\nNOTA DE SESIÓN del atleta (consideración adicional para HOY): "${sessionNotes}"`;
  }

  return prompt;
}

// --- API Route ---

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Error de configuración del servidor: falta la clave de API.' },
      { status: 500 }
    );
  }

  // Authenticate user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'No autorizado. Inicia sesión para generar un WOD.' },
      { status: 401 }
    );
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'No se encontró tu perfil. Completa el onboarding primero.' },
      { status: 400 }
    );
  }

  // Parse optional session notes
  let sessionNotes = '';
  try {
    const body = await request.json();
    sessionNotes = body.sessionNotes?.trim() ?? '';
  } catch {
    // Empty body is fine
  }

  // Load 28 days of feedback + WODs for periodization analysis
  const twentyEightDaysAgo = new Date();
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

  // Load program for current month
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [feedbackResult, wodsResult, programResult, prResult] = await Promise.all([
    supabase
      .from('workout_feedback')
      .select('difficulty_rating, total_time_minutes, rx_or_scaled, notes, wod_snapshot, created_at')
      .eq('user_id', user.id)
      .gte('created_at', twentyEightDaysAgo.toISOString())
      .order('created_at', { ascending: false }),
    supabase
      .from('wods')
      .select('id, wod, created_at')
      .eq('user_id', user.id)
      .gte('created_at', twentyEightDaysAgo.toISOString())
      .order('created_at', { ascending: false }),
    supabase
      .from('training_programs')
      .select('structure')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single(),
    supabase
      .from('personal_records')
      .select('movement_name, record_type, value, unit')
      .eq('user_id', user.id)
      .eq('record_type', '1RM')
      .order('date_achieved', { ascending: false }),
  ]);

  const allFeedback = (feedbackResult.data ?? []) as FeedbackRecord[];
  const allWods = (wodsResult.data ?? []) as WodRecord[];

  // Deduplicate PRs: keep only most recent 1RM per movement
  const prSeen = new Set<string>();
  const bestPRs: PRRecord[] = [];
  for (const pr of (prResult.data ?? []) as PRRecord[]) {
    if (!prSeen.has(pr.movement_name)) {
      prSeen.add(pr.movement_name);
      bestPRs.push(pr);
    }
  }

  // Existing feedback context (last 5 for backward compatibility)
  const feedbackContext = buildFeedbackContext(allFeedback.slice(0, 5));

  // Periodization context from full 28-day window
  const periodizationAnalysis = buildPeriodizationAnalysis(
    allWods as WodRecord[],
    allFeedback as unknown as PeriodizationFeedbackRecord[]
  );
  const periodizationContext = buildPeriodizationContext(periodizationAnalysis);

  // Program context (if active program exists)
  let programContext = '';
  if (programResult.data?.structure) {
    const weeks = programResult.data.structure as ProgramWeek[];
    const weekNumber = Math.min(Math.ceil(now.getDate() / 7), 4);

    // Count WODs generated this week to determine current session
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const wodsThisWeek = allWods.filter(
      (w) => new Date(w.created_at) >= weekStart
    ).length;

    const currentWeek = weeks.find((w) => w.number === weekNumber);
    if (currentWeek) {
      const sessionIndex = Math.min(wodsThisWeek, currentWeek.sessions.length - 1);
      programContext = buildProgramContext(weeks, weekNumber, sessionIndex);
    }
  }

  // Build prompt
  const typedProfile = profile as Profile;
  const prContext = buildPRContext(bestPRs);
  const systemInstruction = buildSystemInstruction(typedProfile, feedbackContext, periodizationContext, programContext, prContext);
  const userPrompt = buildUserPrompt(sessionNotes);

  // Gemini schema (same structure as before)
  const wodSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Un nombre temático y pegadizo para todo el WOD, ej. 'La Forja', 'Furia de Titanes'." },
      warmUp: {
        type: Type.OBJECT,
        description: 'Una rutina de calentamiento completa.',
        properties: {
          title: { type: Type.STRING, description: "Debe ser 'Calentamiento'" },
          duration: { type: Type.STRING, description: "Duración estimada, ej. '10-15 minutos'." },
          parts: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Lista de movimientos y ejercicios de calentamiento.' },
        },
        required: ['title', 'duration', 'parts'],
      },
      strengthSkill: {
        type: Type.OBJECT,
        description: 'Una parte de desarrollo de fuerza o habilidad.',
        properties: {
          title: { type: Type.STRING, description: "Título para esta sección, ej. 'Fuerza: Back Squat' o 'Habilidad: Práctica de Handstand Walk'." },
          details: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Series, repeticiones y porcentajes específicos, ej. '5x5 Back Squat @ 75% 1RM'." },
        },
        required: ['title', 'details'],
      },
      metcon: {
        type: Type.OBJECT,
        description: 'El entrenamiento principal de acondicionamiento metabólico.',
        properties: {
          title: { type: Type.STRING, description: "Debe ser 'Metcon'" },
          type: { type: Type.STRING, description: "Tipo de entrenamiento: 'AMRAP', 'For Time', 'EMOM', 'Tabata', etc." },
          description: { type: Type.STRING, description: "Una descripción concisa de la estructura del metcon, ej. '21-15-9 reps de:' o 'AMRAP en 20 minutos:'." },
          movements: { type: Type.ARRAY, items: { type: Type.STRING }, description: `Lista de movimientos con repeticiones/pesos, ej. ${typedProfile.weight_unit === 'kg' ? "'Peso Muerto (102/70 kg)'" : "'Peso Muerto (225/155 lbs)'"}, 'Burpee Box Jump Overs (60/50 cm)'.` },
          notes: { type: Type.STRING, description: 'Notas opcionales, opciones de escalado o límites de tiempo.' },
        },
        required: ['title', 'type', 'description', 'movements'],
      },
      coolDown: {
        type: Type.OBJECT,
        description: 'Una rutina de enfriamiento y movilidad.',
        properties: {
          title: { type: Type.STRING, description: "Debe ser 'Enfriamiento'" },
          duration: { type: Type.STRING, description: "Duración estimada, ej. '5-10 minutos'." },
          parts: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Lista de estiramientos y ejercicios de movilidad.' },
        },
        required: ['title', 'duration', 'parts'],
      },
    },
    required: ['title', 'warmUp', 'strengthSkill', 'metcon', 'coolDown'],
  };

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: wodSchema,
      },
    });

    let jsonString = response.text!.trim();

    const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }

    const wodData = JSON.parse(jsonString);
    return NextResponse.json(wodData);
  } catch (error) {
    console.error('Error al generar el WOD:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return NextResponse.json(
      { error: `No se pudo generar el WOD: ${errorMessage}` },
      { status: 500 }
    );
  }
}
