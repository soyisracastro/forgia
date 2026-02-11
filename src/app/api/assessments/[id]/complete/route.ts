import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AssessmentSelfReport } from '@/types/assessment';

function evaluateResult(benchmarkId: string, report: AssessmentSelfReport): boolean {
  if (!report.completed) return false;

  switch (benchmarkId) {
    case 'novato-to-principiante':
      // Just needs to complete the WOD
      return true;

    case 'principiante-to-intermedio': {
      // Cindy: 12+ rounds
      if (!report.rounds_or_reps) return false;
      const roundsMatch = report.rounds_or_reps.match(/^(\d+)/);
      if (!roundsMatch) return false;
      return parseInt(roundsMatch[1], 10) >= 12;
    }

    case 'intermedio-to-avanzado':
      // Fran: Rx and under 6 minutes
      return report.rx_or_scaled === 'Rx' && report.total_time_minutes != null && report.total_time_minutes <= 6;

    default:
      return false;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { id } = await params;

  // Load the assessment
  const { data: assessment, error: loadError } = await supabase
    .from('level_assessments')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (loadError || !assessment) {
    return NextResponse.json({ error: 'Evaluación no encontrada.' }, { status: 404 });
  }

  if (assessment.status !== 'pending') {
    return NextResponse.json({ error: 'Esta evaluación ya fue completada.' }, { status: 400 });
  }

  const body = await request.json();
  const selfReport = body.selfReport as AssessmentSelfReport;

  if (!selfReport) {
    return NextResponse.json({ error: 'Falta selfReport.' }, { status: 400 });
  }

  const passed = evaluateResult(assessment.benchmark_id, selfReport);
  const status = passed ? 'passed' : 'failed';

  // Update assessment
  const { data: updated, error: updateError } = await supabase
    .from('level_assessments')
    .update({
      status,
      self_report: selfReport,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: `Error al actualizar: ${updateError.message}` }, { status: 500 });
  }

  // If passed, update profile level
  let levelChanged = false;
  if (passed) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        experience_level: assessment.to_level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    levelChanged = !profileError;
  }

  return NextResponse.json({ assessment: updated, levelChanged });
}
