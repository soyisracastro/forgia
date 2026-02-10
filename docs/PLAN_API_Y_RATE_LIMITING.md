# Forgia — Plan de Trabajo: Optimización de API de IA y Rate Limiting

> Documento generado el 9 de febrero de 2026.
> Contexto: El free tier de Gemini fue recortado drásticamente en diciembre 2025, causando errores 429 frecuentes para los usuarios de Forgia.

---

## 1. Diagnóstico del Problema

### Situación actual
- **Modelo**: `gemini-3-flash-preview` via `@google/genai` SDK
- **Tier**: Free (sin billing habilitado)
- **Endpoints que consumen IA**: 2 de 3 rutas API
  - `POST /api/generate-wod` — generación de WOD (el más pesado)
  - `POST /api/analyze-feedback` — análisis de feedback post-entrenamiento
  - `GET /api/training-intelligence` — **NO usa Gemini** (análisis local en `periodization.ts`)

### Consumo estimado por request

| Endpoint | Input tokens | Output tokens | Total |
|----------|-------------|---------------|-------|
| generate-wod | ~3,000-4,500 | ~800-1,200 | ~4,500-5,700 |
| analyze-feedback | ~800-1,200 | ~400-600 | ~1,200-1,800 |

El prompt de `generate-wod` es el más pesado porque incluye: system instruction con persona del coach (~800 tokens), perfil del atleta (~200), directivas por nivel/equipamiento/objetivos/lesiones/edad (~600), contexto de feedback (~300), contexto de periodización (~500-1000), y el JSON schema (~500).

### Por qué se agotan los límites
Google recortó los límites del free tier en diciembre 2025 sin previo aviso:
- Gemini Flash pasó de ~250 RPD a ~20-50 RPD
- Gemini 3 Flash Preview (modelo actual): límites aún más restrictivos por ser preview
- Los límites se aplican **por proyecto de Google Cloud**, no por API key
- Con 5-10 usuarios activos generando 2-3 WODs/día + análisis, se superan fácilmente los 20-50 requests diarios

---

## 2. Comparativa de Modelos y Precios (febrero 2026)

### Modelos relevantes para Forgia (ordenados por costo)

| Modelo | Input/1M tok | Output/1M tok | Context | Free tier | Notas |
|--------|-------------|---------------|---------|-----------|-------|
| **GPT-5 Nano** | $0.05 | $0.40 | 400K | $5 créditos iniciales | El más barato, pero limitado a tareas simples |
| **Gemini 2.5 Flash-Lite** | $0.10 | $0.40 | 1M | 1,000 RPD (el más generoso) | Más económico en Gemini, calidad menor |
| **GPT-4o-mini** | $0.15 | $0.60 | 128K | $5 créditos iniciales | Excelente calidad/precio, buen JSON mode |
| **Gemini 2.5 Flash** | $0.30 | $2.50 | 1M | 250 RPD | Buen balance, estable (no preview) |
| **Gemini 3 Flash Preview** ⬅️ actual | $0.50 | $3.00 | 1M | ~20-50 RPD (inestable) | Preview, límites pueden cambiar |
| **GPT-4.1-mini** | $0.40 | $1.60 | 1M | No | Contexto 1M, buena calidad |
| **GPT-5** | $1.25 | $10.00 | 400K | $5 créditos iniciales | Flagship de OpenAI, premium |
| **Gemini 2.5 Pro** | $1.25 | $10.00 | 1M | 100 RPD | Razonamiento avanzado |

### Costo mensual estimado por escenario

**Supuesto**: Cada usuario genera 3 WODs/día + 1 análisis/día.

| Modelo | 10 usuarios | 25 usuarios | 50 usuarios |
|--------|------------|------------|------------|
| GPT-5 Nano | ~$0.70 | ~$1.75 | ~$3.50 |
| Gemini 2.5 Flash-Lite | ~$0.90 | ~$2.25 | ~$4.50 |
| GPT-4o-mini | ~$1.35 | ~$3.40 | ~$6.75 |
| Gemini 2.5 Flash | ~$4.30 | ~$10.75 | ~$21.50 |
| **Gemini 3 Flash (actual)** | **~$5.70** | **~$14.25** | **~$28.50** |

> **Nota**: Estos costos son extremadamente bajos. El problema NO es el precio por token, sino los límites de requests del free tier. Habilitar billing (Tier 1) en Google Cloud es la solución más inmediata — el costo real sería de unos pocos dólares al mes.

---

## 3. Recomendación de API

### Opción A: Quedarse con Gemini + habilitar billing (RECOMENDADA)

**Acción**: Habilitar Cloud Billing en el proyecto de Google Cloud para subir a Tier 1.

**Ventajas**:
- **Cero cambios de código** — el modelo `gemini-3-flash-preview` sigue funcionando igual
- El RPM sube de 5-10 a 150-300, el RPD prácticamente desaparece como límite
- El costo será de ~$5-6 USD/mes para 10 usuarios activos
- Puedes usar **Context Caching** para reducir costos hasta 75% en el system instruction (que es mayormente estático por usuario)

**Consideración**: Si `gemini-3-flash-preview` se depreca (es preview), migrar a `gemini-2.5-flash` o al modelo estable que lo reemplace es un cambio de una línea.

**Cambio de modelo sugerido**: Considerar cambiar de `gemini-3-flash-preview` a `gemini-2.5-flash` para tener un modelo estable, no preview. El costo es ligeramente menor ($0.30/$2.50 vs $0.50/$3.00) y la calidad es suficiente para generación de WODs con el prompt engineering tan detallado que ya tienes.

### Opción B: Migrar a OpenAI GPT-4o-mini

**Cuándo considerar**: Si Google sigue degradando la experiencia de Gemini o si la calidad del output no es satisfactoria.

**Ventajas**:
- Precio excelente ($0.15/$0.60 por M tokens)
- JSON mode nativo y robusto
- Ecosistema maduro y estable
- Sin sorpresas en rate limits con billing activo

**Desventajas**:
- Requiere cambiar el SDK (`@google/genai` → `openai`)
- El contexto de 128K tokens es suficiente para Forgia pero menor que el 1M de Gemini
- Requiere reescribir las 2 API routes que usan Gemini

### Opción C: Modelo dual (free tier maximizado)

**Cuándo considerar**: Si quieres minimizar costos al máximo y no quieres habilitar billing.

**Estrategia**: Usar `gemini-2.5-flash-lite` (1,000 RPD en free tier) como modelo principal, y fallback a otro proveedor si se agota.

**Desventajas**:
- Flash-Lite es menos capaz — la calidad de los WODs podría bajar
- Complejidad adicional para manejar fallback
- Dependencia de free tiers que pueden cambiar sin aviso

---

## 4. Plan de Rate Limiting por Usuario

Independientemente del modelo elegido, implementar rate limiting protege contra:
- Abuso de la API (un usuario generando decenas de WODs)
- Costos inesperados al escalar
- Preparación para el modelo freemium futuro (descrito en el roadmap)

### 4.1 Límites propuestos

| Acción | Límite diario (free) | Límite diario (futuro premium) |
|--------|---------------------|-------------------------------|
| Generación de WOD | 3 por día | 10+ o ilimitado |
| Análisis de feedback | 2 por día | 5+ o ilimitado |

### 4.2 Implementación técnica

#### Tabla nueva en Supabase: `usage_tracking`

```sql
CREATE TABLE usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('generate_wod', 'analyze_feedback')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para consultas rápidas por usuario y día
CREATE INDEX idx_usage_tracking_user_day
  ON usage_tracking (user_id, action_type, created_at DESC);

-- RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage"
  ON usage_tracking FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Lógica de verificación (en cada API route)

```typescript
// src/lib/rateLimit.ts

const DAILY_LIMITS = {
  generate_wod: 3,
  analyze_feedback: 2,
} as const;

type ActionType = keyof typeof DAILY_LIMITS;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  action: ActionType
): Promise<RateLimitResult> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('usage_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', action)
    .gte('created_at', todayStart.toISOString());

  const used = count ?? 0;
  const limit = DAILY_LIMITS[action];

  return {
    allowed: used < limit,
    remaining: Math.max(0, limit - used),
    limit,
  };
}

export async function trackUsage(
  supabase: SupabaseClient,
  userId: string,
  action: ActionType
): Promise<void> {
  await supabase
    .from('usage_tracking')
    .insert({ user_id: userId, action_type: action });
}
```

#### Integración en API routes

En `generate-wod/route.ts` y `analyze-feedback/route.ts`, agregar antes de la llamada a Gemini:

```typescript
import { checkRateLimit, trackUsage } from '@/lib/rateLimit';

// Después de autenticación, antes de llamar a Gemini:
const rateCheck = await checkRateLimit(supabase, user.id, 'generate_wod');
if (!rateCheck.allowed) {
  return NextResponse.json(
    {
      error: `Has alcanzado el límite diario de generación de WODs (${rateCheck.limit}/día). Intenta de nuevo mañana.`,
      rateLimited: true,
      remaining: 0,
      limit: rateCheck.limit,
    },
    { status: 429 }
  );
}

// ... llamada a Gemini ...

// Después de la respuesta exitosa de Gemini:
await trackUsage(supabase, user.id, 'generate_wod');
```

#### UX en el cliente

- Mostrar el número de requests restantes en el dashboard (ej: "2/3 WODs restantes hoy")
- Al agotar el límite, deshabilitar el botón "Generar WOD" con mensaje informativo
- En el futuro, este será el punto de venta para el tier premium

### 4.3 Esquema de la respuesta del API con info de rate limit

Incluir headers o campos en la respuesta para que el cliente sepa el estado:

```typescript
// En la respuesta exitosa, incluir:
return NextResponse.json(wodData, {
  headers: {
    'X-RateLimit-Limit': String(rateCheck.limit),
    'X-RateLimit-Remaining': String(rateCheck.remaining - 1),
  },
});
```

---

## 5. Optimización adicional: Context Caching de Gemini

Si te quedas con Gemini (Opción A), puedes reducir costos significativamente con **Context Caching**:

- El system instruction de `generate-wod` es ~2000-3000 tokens que son mayormente estáticos por usuario (perfil, nivel, equipo, lesiones)
- Solo cambia: contexto de periodización y feedback (que se actualiza cada sesión)
- Con caching, los tokens cacheados cuestan **10% del precio de input** ($0.05/M en vez de $0.50/M para Gemini 3 Flash)
- El storage del cache cuesta $1-4.50/M tokens por hora
- Para el patrón de uso de Forgia (pocos usuarios, requests espaciados), el ahorro neto es significativo

**Implementación**: Usar `cachedContent` del SDK `@google/genai` para cachear el system instruction por usuario con TTL de 1 hora.

---

## 6. Resumen del Plan de Acción

### Fase 1 — Inmediata (1-2 días)
1. **Habilitar billing en Google Cloud** para subir a Tier 1 de la API de Gemini
2. (Opcional) Cambiar modelo de `gemini-3-flash-preview` a `gemini-2.5-flash` para estabilidad

### Fase 2 — Rate Limiting (2-3 días)
3. Crear tabla `usage_tracking` en Supabase con RLS
4. Crear módulo `src/lib/rateLimit.ts` con funciones `checkRateLimit` y `trackUsage`
5. Integrar rate limiting en `POST /api/generate-wod` (límite: 3/día)
6. Integrar rate limiting en `POST /api/analyze-feedback` (límite: 2/día)
7. Actualizar UI del dashboard para mostrar requests restantes
8. Manejar estado 429 en el cliente con mensaje user-friendly

### Fase 3 — Optimización (opcional, 1-2 días)
9. Implementar Context Caching de Gemini para el system instruction
10. Agregar monitoreo básico de consumo de tokens (logging en API routes)

### Fase 4 — Futuro (cuando haya más usuarios)
11. Implementar tier premium con límites expandidos (campo `tier` en `profiles`)
12. Evaluar migración a modelo alternativo si los costos escalan significativamente
13. Considerar OpenAI GPT-4o-mini como alternativa si Gemini no cumple expectativas

---

## 7. Decisión sobre Migración de Proveedor

**Veredicto**: NO es necesario migrar de proveedor en este momento.

El costo de la API de Gemini con billing habilitado es extremadamente bajo (~$5-6/mes para 10 usuarios). La calidad del modelo es buena y el prompt engineering existente está optimizado para Gemini. Migrar a otro proveedor implicaría:
- Cambiar SDK y reescribir 2 rutas de API
- Re-testear calidad del output con los prompts existentes
- Posible degradación de la experiencia si el nuevo modelo no sigue las instrucciones en español tan bien

La inversión de tiempo no se justifica con el ahorro marginal ($5 vs $1-2/mes). **La prioridad es habilitar billing + implementar rate limiting.**

Si en el futuro (50-100+ usuarios) los costos escalan, GPT-4o-mini sería la alternativa más interesante por su excelente relación calidad/precio y ecosistema maduro.
