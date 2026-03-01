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
  const selfReport = body.selfReport;

  if (
    !selfReport ||
    typeof selfReport.completed !== 'boolean' ||
    !['Rx', 'Scaled'].includes(selfReport.rx_or_scaled)
  ) {
    return NextResponse.json({ error: 'Datos de reporte inválidos.' }, { status: 400 });
  }

  const validatedReport: AssessmentSelfReport = {
    completed: selfReport.completed,
    total_time_minutes: typeof selfReport.total_time_minutes === 'number' ? selfReport.total_time_minutes : null,
    rounds_or_reps: typeof selfReport.rounds_or_reps === 'string' ? selfReport.rounds_or_reps.slice(0, 100) : null,
    rx_or_scaled: selfReport.rx_or_scaled,
    notes: typeof selfReport.notes === 'string' ? selfReport.notes.slice(0, 500) : null,
  };

  const passed = evaluateResult(assessment.benchmark_id, validatedReport);
  const status = passed ? 'passed' : 'failed';

  // Update assessment
  const { data: updated, error: updateError } = await supabase
    .from('level_assessments')
    .update({
      status,
      self_report: validatedReport,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Error al actualizar evaluación:', updateError.message);
    return NextResponse.json({ error: 'Error al actualizar evaluación. Intenta de nuevo.' }, { status: 500 });
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
