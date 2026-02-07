import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  buildPeriodizationAnalysis,
  type WodRecord,
  type FeedbackRecord,
  type PeriodizationAnalysis,
} from '@/lib/periodization';

export interface TrainingIntelligenceResponse {
  hasEnoughData: boolean;
  totalWods: number;
  summary: {
    weekPhase: string | null;
    sessionsThisWeek: number;
    avgDifficultyThisWeek: number | null;
    daysSinceLastSession: number;
    dominantDomain: string | null;
    underrepresentedDomain: string | null;
    strengthSuggestion: string | null;
    deloadWarning: boolean;
    avgSessionsPerWeek: number;
  } | null;
}

function buildResponse(analysis: PeriodizationAnalysis, totalWods: number): TrainingIntelligenceResponse {
  if (!analysis.hasEnoughData) {
    return { hasEnoughData: false, totalWods, summary: null };
  }

  const db = analysis.domainBalance;
  let dominantDomain: string | null = null;
  let underrepresentedDomain: string | null = null;

  if (db) {
    const total = db.weightlifting + db.gymnastics + db.monostructural;
    if (total > 0) {
      const domains = [
        { name: 'Halterofilia', count: db.weightlifting },
        { name: 'Gimnásticos', count: db.gymnastics },
        { name: 'Cardio', count: db.monostructural },
      ].sort((a, b) => b.count - a.count);
      dominantDomain = domains[0].name;
    }
    if (db.underrepresented.length > 0) {
      underrepresentedDomain = db.underrepresented[0] === 'Monostructural' ? 'Cardio' : db.underrepresented[0];
    }
  }

  return {
    hasEnoughData: true,
    totalWods,
    summary: {
      weekPhase: analysis.deload?.weekPhase ?? null,
      sessionsThisWeek: analysis.weeklyLoad?.currentWeek.sessions ?? 0,
      avgDifficultyThisWeek: analysis.weeklyLoad?.currentWeek.avgDifficulty ?? null,
      daysSinceLastSession: analysis.trainingPattern?.daysSinceLastSession ?? 0,
      dominantDomain,
      underrepresentedDomain,
      strengthSuggestion: analysis.strengthRotation?.suggested?.[0] ?? null,
      deloadWarning: analysis.deload?.needsDeload ?? false,
      avgSessionsPerWeek: analysis.trainingPattern?.avgSessionsPerWeek ?? 0,
    },
  };
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const twentyEightDaysAgo = new Date();
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

  const [feedbackResult, wodsResult] = await Promise.all([
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
  ]);

  const allFeedback = (feedbackResult.data ?? []) as FeedbackRecord[];
  const allWods = (wodsResult.data ?? []) as WodRecord[];

  const analysis = buildPeriodizationAnalysis(allWods, allFeedback);
  const response = buildResponse(analysis, allWods.length);

  return NextResponse.json(response);
}
