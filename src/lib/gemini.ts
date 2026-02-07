import type { Wod, GenerateWodRequest, GeminiAnalysis, AnalyzeFeedbackRequest } from '@/types/wod';
import type { TrainingIntelligenceResponse } from '@/app/api/training-intelligence/route';

export async function generateWod(request?: GenerateWodRequest): Promise<Wod> {
  const response = await fetch('/api/generate-wod', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request ?? {}),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Error del servidor (estado ${response.status})` }));
    throw new Error(errorData.error || `La solicitud falló con el estado ${response.status}`);
  }

  return response.json();
}

export async function analyzeFeedback(request: AnalyzeFeedbackRequest): Promise<GeminiAnalysis> {
  const response = await fetch('/api/analyze-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Error del servidor (estado ${response.status})` }));
    throw new Error(errorData.error || `La solicitud falló con el estado ${response.status}`);
  }

  return response.json();
}

export async function fetchTrainingIntelligence(): Promise<TrainingIntelligenceResponse> {
  const response = await fetch('/api/training-intelligence');
  if (!response.ok) {
    throw new Error('Error al cargar inteligencia de entrenamiento');
  }
  return response.json();
}
