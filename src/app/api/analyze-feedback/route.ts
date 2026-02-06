import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/profile';
import type { WorkoutFeedback } from '@/types/wod';

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
      { error: 'No autorizado. Inicia sesión para analizar tu rendimiento.' },
      { status: 401 }
    );
  }

  // Parse request body
  let feedbackId: string;
  try {
    const body = await request.json();
    feedbackId = body.feedbackId;
    if (!feedbackId) throw new Error('Missing feedbackId');
  } catch {
    return NextResponse.json(
      { error: 'feedbackId es requerido.' },
      { status: 400 }
    );
  }

  // Load feedback
  const { data: feedback, error: feedbackError } = await supabase
    .from('workout_feedback')
    .select('*')
    .eq('id', feedbackId)
    .eq('user_id', user.id)
    .single();

  if (feedbackError || !feedback) {
    return NextResponse.json(
      { error: 'No se encontró el feedback.' },
      { status: 404 }
    );
  }

  const typedFeedback = feedback as WorkoutFeedback;

  // Load profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'No se encontró tu perfil.' },
      { status: 400 }
    );
  }

  const typedProfile = profile as Profile;

  // Build prompts
  const systemInstruction = buildAnalysisSystemInstruction(typedProfile);
  const userPrompt = buildAnalysisUserPrompt(typedFeedback);

  const analysisSchema = {
    type: Type.OBJECT,
    properties: {
      resumen: { type: Type.STRING, description: 'Resumen general del rendimiento del atleta en este entrenamiento (2-3 oraciones).' },
      fortalezas: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Lista de fortalezas observadas (2-4 puntos).',
      },
      areas_mejora: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Lista de áreas donde puede mejorar (2-4 puntos).',
      },
      recomendaciones: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Recomendaciones concretas para las próximas sesiones (2-4 puntos).',
      },
      progresion_sugerida: { type: Type.STRING, description: 'Sugerencia de progresión para las próximas semanas (1-2 oraciones).' },
    },
    required: ['resumen', 'fortalezas', 'areas_mejora', 'recomendaciones', 'progresion_sugerida'],
  };

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    let jsonString = response.text!.trim();
    const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }

    const analysis = JSON.parse(jsonString);

    // Save analysis to feedback record
    await supabase
      .from('workout_feedback')
      .update({ gemini_analysis: analysis })
      .eq('id', feedbackId);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error al analizar feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return NextResponse.json(
      { error: `No se pudo analizar el rendimiento: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function buildAnalysisSystemInstruction(profile: Profile): string {
  return `Eres un coach de CrossFit/Calistenia certificado de nivel elite con más de 15 años de experiencia analizando el rendimiento de atletas.

Tu tarea es analizar los resultados de un entrenamiento y proporcionar retroalimentación constructiva, motivadora y personalizada.

REGLAS:
- Todo el contenido DEBE estar en español.
- Sé específico y constructivo, nunca genérico.
- Adapta el análisis al nivel del atleta.
- Las fortalezas y áreas de mejora deben ser concretas y accionables.
- Las recomendaciones deben ser prácticas para las próximas sesiones.

PERFIL DEL ATLETA:
- Nombre: ${profile.display_name || 'Atleta'}
- Edad: ${profile.age ? `${profile.age} años` : 'No especificada'}
- Nivel: ${profile.experience_level || 'Intermedio'}
- Objetivos: ${profile.objectives?.length ? profile.objectives.join(', ') : 'General fitness'}
- Lesiones: ${profile.injury_history?.trim() || 'Ninguna reportada'}`;
}

function buildAnalysisUserPrompt(feedback: WorkoutFeedback): string {
  const wod = feedback.wod_snapshot;
  const sections: string[] = [
    `ENTRENAMIENTO REALIZADO: "${wod.title}"`,
    `- Calentamiento: ${wod.warmUp.parts?.join(', ') || 'N/A'}`,
    `- Fuerza/Habilidad: ${wod.strengthSkill.title} — ${wod.strengthSkill.details?.join(', ') || 'N/A'}`,
    `- Metcon: ${wod.metcon.type} — ${wod.metcon.description} — Movimientos: ${wod.metcon.movements?.join(', ') || 'N/A'}`,
    `- Enfriamiento: ${wod.coolDown.parts?.join(', ') || 'N/A'}`,
    '',
    'RESULTADOS DEL ATLETA:',
    `- Dificultad percibida: ${feedback.difficulty_rating}/10`,
    `- Modalidad: ${feedback.rx_or_scaled}`,
  ];

  if (feedback.total_time_minutes) {
    sections.push(`- Tiempo total: ${feedback.total_time_minutes} minutos`);
  }

  if (feedback.notes?.trim()) {
    sections.push(`- Notas del atleta: "${feedback.notes}"`);
  }

  sections.push('', 'Analiza este entrenamiento y proporciona retroalimentación personalizada.');

  return sections.join('\n');
}
