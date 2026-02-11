export interface WeeklyAnalysisData {
  resumen_semanal: string;
  logros: string[];
  tendencias: string[];
  areas_atencion: string[];
  recomendaciones_proxima_semana: string[];
  carga_percibida: 'baja' | 'moderada' | 'alta' | 'excesiva';
  nota_motivacional: string;
}

export interface WeeklyAnalysisResponse {
  feedbackCount: number;
  analysis: WeeklyAnalysisData | null;
}
