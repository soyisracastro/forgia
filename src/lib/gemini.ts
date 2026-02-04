import type { Wod, GenerateWodParams } from '@/types/wod';

export async function generateWod(params: GenerateWodParams): Promise<Wod> {
  const response = await fetch('/api/generate-wod', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Error del servidor (estado ${response.status})` }));
    throw new Error(errorData.error || `La solicitud falló con el estado ${response.status}`);
  }

  return response.json();
}
