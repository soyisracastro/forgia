import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient as createCookieClient } from '@/lib/supabase/server';
import { checkRateLimit, type RateLimitedAction, type RateLimitResult } from '@/lib/rate-limit';

const RATE_LIMIT_MESSAGES: Record<RateLimitedAction, string> = {
  generate_wod: 'Has alcanzado el límite diario de generación de WODs. Intenta de nuevo mañana.',
  generate_program: 'Has alcanzado el límite diario de generación de programas. Intenta de nuevo mañana.',
  weekly_analysis: 'Has alcanzado el límite diario de análisis. Intenta de nuevo mañana.',
  chat: 'Has alcanzado el límite diario de mensajes del Coach IA. Intenta de nuevo mañana.',
  assessment: 'Has alcanzado el límite diario de evaluaciones. Intenta de nuevo mañana.',
};

export interface AuthContext {
  user: User;
  supabase: SupabaseClient;
  rateLimit: RateLimitResult | null;
}

export type AuthResult =
  | ({ ok: true } & AuthContext)
  | { ok: false; response: NextResponse };

interface RequireUserOptions {
  rateLimit?: RateLimitedAction;
  authMessage?: string;
}

/**
 * Autentica la petición vía cookie de sesión (web) o header
 * `Authorization: Bearer <jwt>` (clientes nativos), y opcionalmente
 * aplica el rate limit diario de la acción indicada.
 */
export async function requireUser(
  request: Request,
  options: RequireUserOptions = {}
): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  let supabase: SupabaseClient;
  let user: User | null = null;

  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );
    const { data, error } = await supabase.auth.getUser(token);
    if (!error) user = data.user;
  } else {
    supabase = await createCookieClient();
    const { data, error } = await supabase.auth.getUser();
    if (!error) user = data.user;
  }

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: options.authMessage ?? 'No autorizado. Inicia sesión para continuar.' },
        { status: 401 }
      ),
    };
  }

  let rateLimit: RateLimitResult | null = null;
  if (options.rateLimit) {
    rateLimit = await checkRateLimit(supabase, user.id, options.rateLimit);
    if (!rateLimit.allowed) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: RATE_LIMIT_MESSAGES[options.rateLimit], remaining: 0, limit: rateLimit.limit },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': String(rateLimit.limit),
              'X-RateLimit-Remaining': '0',
            },
          }
        ),
      };
    }
  }

  return { ok: true, user, supabase, rateLimit };
}
