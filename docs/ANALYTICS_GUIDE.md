# Forgia — Analytics Guide

Google Analytics 4 (GA4) con eventos custom para medir engagement, retención y conversión.

## Setup

La propiedad de GA4 se configura con la variable de entorno `NEXT_PUBLIC_GA_ID`. Sin esta variable, el script de GA no se carga (zero overhead en desarrollo).

```env
NEXT_PUBLIC_GA_ID=G-Q9GFWE720C
```

El código de tracking vive en `src/lib/analytics.ts`. Cada función exporta un evento nombrado con parámetros opcionales. Si `window.gtag` no existe (SSR, ad blockers), las llamadas se ignoran silenciosamente.

---

## Eventos Custom

### Tier 1 — Negocio / Conversión

| Evento | Parámetros | Disparado en | Significado |
|--------|-----------|--------------|-------------|
| `signup_complete` | — | OnboardingWizard (al completar onboarding) | Usuario completó registro + onboarding |
| `wod_generated` | `experience_level` | /app (al generar WOD) | Core action — generación de WOD |
| `wod_saved` | — | /app (al guardar WOD) | Usuario valoró el WOD lo suficiente para guardarlo |
| `feedback_submitted` | `difficulty_rating`, `rx_or_scaled` | WorkoutFeedbackForm | Usuario registró resultado post-WOD |
| `workout_started` | — | /app (botón "Iniciar Entrenamiento") | Usuario entró al modo en vivo |
| `workout_completed` | `total_minutes` | LiveWorkoutOverlay (al finalizar) | Usuario completó entrenamiento en modo en vivo |
| `profile_updated` | — | /app/perfil (al guardar cambios) | Usuario editó su perfil |

### Tier 2 — Engagement

| Evento | Parámetros | Disparado en | Significado |
|--------|-----------|--------------|-------------|
| `onboarding_step` | `step_number` | OnboardingWizard (avance de paso) | Progreso en onboarding (detectar dropoff) |
| `wod_copied` | — | CopyWodButton | Usuario copió WOD al clipboard |
| `wod_printed` | — | PrintWodButton | Usuario imprimió WOD |

---

## Marcar Conversiones en GA4

Para que GA4 las trate como conversiones (métricas destacadas, funnels, atribución):

1. Ir a **Admin → Events** en GA4
2. Encontrar el evento (esperar a que aparezca tras el primer disparo)
3. Activar el toggle **"Mark as conversion"** para estos eventos:
   - `signup_complete`
   - `wod_generated`
   - `feedback_submitted`
   - `workout_completed`

---

## Reportes Mensuales

### 1. Funnel de Conversión

> ¿Cuántos usuarios pasan de registrarse a generar un WOD? ¿Cuántos registran resultado?

**Ruta:** Explorar → Funnel Exploration → Crear nuevo

**Steps:**
1. `signup_complete`
2. `wod_generated`
3. `wod_saved`
4. `workout_started`
5. `feedback_submitted`

**Qué buscar:**
- Drop-off entre `signup_complete` y `wod_generated` = problema de onboarding
- Drop-off entre `wod_generated` y `wod_saved` = WODs no enganchan
- Drop-off entre `wod_saved` y `workout_started` = fricción en modo live
- Tasa `feedback_submitted / workout_completed` = adopción de feedback loop

### 2. Uso de Features

> ¿Qué features usa la gente realmente?

**Ruta:** Reports → Events

**Métricas clave:**
- **Ratio live mode**: `workout_started / wod_generated` — ¿usan el modo live o solo leen?
- **Ratio feedback**: `feedback_submitted / workout_completed` — ¿registran resultados?
- **Copy vs Print**: `wod_copied` vs `wod_printed` — ¿llevan al gym digital o papel?

### 3. Retención

> ¿Vuelven los usuarios?

**Ruta:** Reports → Retention

**Métricas:**
- **D1**: Abre la app al día siguiente
- **D7**: Sigue usando después de una semana
- **D30**: Retención a un mes

**Target sano para app de fitness:** D1 > 30%, D7 > 15%, D30 > 8%

### 4. Distribución de Dificultad

> ¿Los WODs son demasiado fáciles o difíciles?

**Ruta:** Explorar → Free Form → Dimensión: `difficulty_rating` (del evento `feedback_submitted`)

**Qué buscar:**
- Concentración en 8-10 → WODs demasiado duros, ajustar Gemini prompt
- Concentración en 1-3 → WODs demasiado fáciles
- Distribución en 4-7 → sweet spot

### 5. Rx vs Scaled

> ¿Los usuarios están haciendo Rx o escalando?

**Ruta:** Explorar → Free Form → Dimensión: `rx_or_scaled` (del evento `feedback_submitted`)

**Qué buscar:**
- >70% Scaled → revisar si nivel de experiencia es correcto o si Gemini exagera
- >70% Rx → posiblemente los WODs son conservadores

---

## Checklist de Reporte Mensual

- [ ] **MAU** (Monthly Active Users): Reports → Overview
- [ ] **WODs por usuario**: Total `wod_generated` / MAU
- [ ] **Tasa de guardado**: `wod_saved` / `wod_generated`
- [ ] **Tasa de feedback**: `feedback_submitted` / `wod_generated`
- [ ] **Adopción live mode**: `workout_started` / `wod_generated`
- [ ] **Completitud live**: `workout_completed` / `workout_started`
- [ ] **Retención D1/D7/D30**: Reports → Retention
- [ ] **Distribución dificultad**: ver sección 4
- [ ] **Rx vs Scaled**: ver sección 5
- [ ] **Funnel de onboarding**: `onboarding_step` step 1→2→3→4 → signup_complete
- [ ] **Copy vs Print**: comparar volúmenes

---

## Agregar Nuevos Eventos

1. Agregar función exportada en `src/lib/analytics.ts`
2. Importar y llamar en el componente relevante
3. Documentar en esta guía (tabla de eventos + sección de reporte si aplica)
4. Esperar ~24h para que GA4 reconozca el evento
5. Marcar como conversión si es un evento de negocio
