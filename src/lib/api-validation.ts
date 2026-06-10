import { NextResponse } from 'next/server';
import type { z } from 'zod';

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

/**
 * Lee y valida el body JSON de la petición contra un schema Zod.
 * Un body ausente o malformado se valida como `{}`: si el schema
 * tiene campos requeridos, eso produce el 400 correspondiente.
 */
export async function parseJsonBody<S extends z.ZodType>(
  request: Request,
  schema: S
): Promise<ParseResult<z.infer<S>>> {
  let json: unknown = {};
  try {
    json = await request.json();
  } catch {
    // Body vacío o JSON inválido — el schema decide si es aceptable
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 }),
    };
  }

  return { ok: true, data: result.data };
}
