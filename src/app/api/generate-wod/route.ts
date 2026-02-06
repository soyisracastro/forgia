import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/profile';

// --- Prompt builders ---

function buildSystemInstruction(profile: Profile): string {
  const trainingLabel = profile.training_type === 'Calistenia'
    ? 'Calistenia (calisthenics / bodyweight training)'
    : 'CrossFit';

  const sections = [
    `Eres un coach de ${trainingLabel} certificado de nivel elite con más de 15 años de experiencia. Tu especialidad es crear entrenamientos personalizados que se adaptan al perfil único de cada atleta.

REGLAS ESTRICTAS:
- Todo el contenido DEBE estar en español.
- Los pesos se expresan en kilogramos (kg), las distancias en metros (m).
- Cada WOD debe ser único, variado, y no repetir patrones obvios.
- El WOD debe ser realista y ejecutable en una sesión de 45-60 minutos.
- Siempre incluir opciones de escalado en las notas cuando sea apropiado.
- Los nombres de ejercicios pueden estar en inglés cuando son términos técnicos universales (Clean & Jerk, Snatch, Muscle-up, etc.), pero las instrucciones y descripciones deben estar en español.

PERFIL DEL ATLETA:
- Nombre: ${profile.display_name || 'Atleta'}
- Edad: ${profile.age ? `${profile.age} años` : 'No especificada'}
- Nivel de experiencia: ${profile.experience_level || 'Intermedio'}
- Tipo de entrenamiento preferido: ${trainingLabel}
- Equipamiento disponible: ${profile.equipment_level || 'No especificado'}
- Objetivos: ${profile.objectives?.length ? profile.objectives.join(', ') : 'General fitness'}
- Historial de lesiones o limitaciones: ${profile.injury_history?.trim() || 'Ninguno reportado'}`,

    buildLevelDirectives(profile),
    buildEquipmentDirectives(profile),
    buildObjectiveDirectives(profile),
    buildInjuryDirectives(profile),
    buildAgeDirectives(profile),
  ];

  return sections.filter(Boolean).join('\n\n');
}

function buildLevelDirectives(profile: Profile): string {
  switch (profile.experience_level) {
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
    case 'Superficies para ejercicios':
      return `EQUIPAMIENTO - CALISTENIA BÁSICA:
- Solo suelo y barra de dominadas (pull-up bar).
- Ejercicios: pull-ups, chin-ups, dips (en paralelas o banco), push-ups y variantes, squats con peso corporal, L-sits, hollow holds, planchas.
- NO incluir ningún peso externo.`;
    case 'Equipamiento complementario':
      return `EQUIPAMIENTO - CALISTENIA EQUIPADA:
- Barra de dominadas, paralelas/paralettes, anillas, bandas elásticas, TRX/suspension trainer.
- Incluir progresiones avanzadas de calistenia.
- Puede incluir: ring dips, ring rows, ring muscle-ups, front lever drills, planche progressions.`;
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

  // Build prompt
  const typedProfile = profile as Profile;
  const systemInstruction = buildSystemInstruction(typedProfile);
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
          movements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de movimientos con repeticiones/pesos, ej. 'Peso Muerto (102/70 kg)', 'Burpee Box Jump Overs (60/50 cm)'." },
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
