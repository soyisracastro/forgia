import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBenchmarkForLevel } from '@/lib/assessment-benchmarks';
import type { ExperienceLevel } from '@/types/profile';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('level_assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const body = await request.json();
  const benchmarkId = body.benchmarkId as string;

  if (!benchmarkId) {
    return NextResponse.json({ error: 'Falta benchmarkId.' }, { status: 400 });
  }

  // Get user's current level
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('experience_level')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'No se encontró tu perfil.' }, { status: 400 });
  }

  const currentLevel = profile.experience_level as ExperienceLevel;
  const benchmark = getBenchmarkForLevel(currentLevel);

  if (!benchmark || benchmark.id !== benchmarkId) {
    return NextResponse.json({ error: 'Benchmark no válido para tu nivel actual.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('level_assessments')
    .insert({
      user_id: user.id,
      from_level: benchmark.fromLevel,
      to_level: benchmark.toLevel,
      benchmark_id: benchmarkId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: `Error al crear evaluación: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json(data);
}
