import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import type { GenerateWodParams } from '@/types/wod';

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("La variable de entorno GEMINI_API_KEY no está configurada");
    return NextResponse.json(
      { error: "Error de configuración del servidor: falta la clave de API." },
      { status: 500 }
    );
  }

  let params: GenerateWodParams;
  try {
    params = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de solicitud inválido.' },
      { status: 400 }
    );
  }

  const { location, equipment, level, injury } = params;

  if (!location || !equipment || !level) {
    return NextResponse.json(
      { error: 'Faltan parámetros requeridos: location, equipment, level.' },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const wodSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Un nombre temático y pegadizo para todo el WOD, ej. 'La Forja', 'Furia de Titanes'." },
        warmUp: {
          type: Type.OBJECT,
          description: "Una rutina de calentamiento completa.",
          properties: {
            title: { type: Type.STRING, description: "Debe ser 'Calentamiento'" },
            duration: { type: Type.STRING, description: "Duración estimada, ej. '10-15 minutos'." },
            parts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de movimientos y ejercicios de calentamiento." }
          },
          required: ['title', 'duration', 'parts']
        },
        strengthSkill: {
          type: Type.OBJECT,
          description: "Una parte de desarrollo de fuerza o habilidad.",
          properties: {
            title: { type: Type.STRING, description: "Título para esta sección, ej. 'Fuerza: Back Squat' o 'Habilidad: Práctica de Handstand Walk'." },
            details: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Series, repeticiones y porcentajes específicos, ej. '5x5 Back Squat @ 75% 1RM'." }
          },
          required: ['title', 'details']
        },
        metcon: {
          type: Type.OBJECT,
          description: "El entrenamiento principal de acondicionamiento metabólico.",
          properties: {
            title: { type: Type.STRING, description: "Debe ser 'Metcon'" },
            type: { type: Type.STRING, description: "Tipo de entrenamiento: 'AMRAP', 'For Time', 'EMOM', 'Tabata', etc." },
            description: { type: Type.STRING, description: "Una descripción concisa de la estructura del metcon, ej. '21-15-9 reps de:' o 'AMRAP en 20 minutos:'." },
            movements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de movimientos con repeticiones/pesos, ej. 'Peso Muerto (102/70 kg)', 'Burpee Box Jump Overs (60/50 cm)'." },
            notes: { type: Type.STRING, description: "Notas opcionales, opciones de escalado o límites de tiempo." }
          },
          required: ['title', 'type', 'description', 'movements']
        },
        coolDown: {
          type: Type.OBJECT,
          description: "Una rutina de enfriamiento y movilidad.",
          properties: {
            title: { type: Type.STRING, description: "Debe ser 'Enfriamiento'" },
            duration: { type: Type.STRING, description: "Duración estimada, ej. '5-10 minutos'." },
            parts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de estiramientos y ejercicios de movilidad." }
          },
          required: ['title', 'duration', 'parts']
        }
      },
      required: ['title', 'warmUp', 'strengthSkill', 'metcon', 'coolDown']
    };

    let prompt = `Actúa como un coach experto de CrossFit (Nivel 4). Tu tarea es crear un 'Workout of the Day' (WOD) completo, desafiante y bien estructurado en español, siguiendo los principios de variedad y equilibrio de CrossFit.

    Parámetros para el WOD:
    - Nivel de habilidad: ${level}
    - Ubicación: ${location} (${location === 'Casa' ? 'Diseñado para espacio limitado.' : 'Box de CrossFit con equipamiento completo.'})
    - Equipamiento disponible: ${equipment} (${equipment === 'Peso Corporal' ? 'Utilizar exclusivamente ejercicios de peso corporal.' : 'Utilizar equipamiento estándar de CrossFit.'})`;

    if (injury && injury.trim() !== '') {
      prompt += `
    - Lesión/Limitación a considerar (MUY IMPORTANTE): "${injury}". Adapta los ejercicios para evitar agravar esta condición. Ofrece alternativas seguras.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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
    console.error("Error al generar el WOD:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    return NextResponse.json(
      { error: `No se pudo generar el WOD: ${errorMessage}` },
      { status: 500 }
    );
  }
}
