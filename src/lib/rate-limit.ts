import { createClient } from '@/lib/supabase/server';

type RateLimitedAction = 'generate_wod' | 'generate_program' | 'weekly_analysis' | 'chat';

const DAILY_LIMITS: Record<RateLimitedAction, number> = {
  generate_wod: 5,
  generate_program: 2,
  weekly_analysis: 5,
  chat: 20,
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

export async function checkRateLimit(
  userId: string,
  action: RateLimitedAction
): Promise<RateLimitResult> {
  const limit = DAILY_LIMITS[action];
  const supabase = await createClient();

  // Admin bypass: unlimited usage
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profile?.role === 'admin') {
    return { allowed: true, remaining: 999, limit };
  }

  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const { count, error } = await supabase
    .from('usage_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', twentyFourHoursAgo.toISOString());

  if (error) {
    console.error('Rate limit check failed:', error);
    // Fail open: allow the request if the check fails
    return { allowed: true, remaining: limit, limit };
  }

  const used = count ?? 0;
  const remaining = Math.max(0, limit - used);

  return {
    allowed: used < limit,
    remaining,
    limit,
  };
}

export async function trackUsage(
  userId: string,
  action: RateLimitedAction
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('usage_tracking')
    .insert({ user_id: userId, action });

  if (error) {
    console.error('Failed to track usage:', error);
  }
}
