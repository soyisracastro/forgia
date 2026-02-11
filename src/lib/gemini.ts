import type { Wod, GenerateWodRequest } from '@/types/wod';
import type { MonthlyProgram } from '@/types/program';
import type { WeeklyAnalysisResponse } from '@/types/weekly-analysis';
import type { TrainingIntelligenceResponse } from '@/app/api/training-intelligence/route';
import type { LevelAssessment, AssessmentSelfReport } from '@/types/assessment';

export async function generateProgram(): Promise<MonthlyProgram> {
  const response = await fetch('/api/generate-program', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Error del servidor (estado ${response.status})` }));
    throw new Error(errorData.error || `La solicitud falló con el estado ${response.status}`);
  }

  return response.json();
}

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

export async function fetchWeeklyAnalysis(): Promise<WeeklyAnalysisResponse> {
  const response = await fetch('/api/weekly-analysis');
  if (!response.ok) {
    throw new Error('Error al cargar el análisis semanal');
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

export async function startAssessment(benchmarkId: string): Promise<LevelAssessment> {
  const response = await fetch('/api/assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ benchmarkId }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error al iniciar evaluación' }));
    throw new Error(errorData.error || 'Error al iniciar evaluación');
  }
  return response.json();
}

export async function completeAssessment(
  id: string,
  selfReport: AssessmentSelfReport
): Promise<{ assessment: LevelAssessment; levelChanged: boolean }> {
  const response = await fetch(`/api/assessments/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selfReport }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error al completar evaluación' }));
    throw new Error(errorData.error || 'Error al completar evaluación');
  }
  return response.json();
}
