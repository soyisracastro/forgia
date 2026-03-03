# Forgia — Estrategia de Monetización: Coach IA y Features Premium

> Documento generado el 3 de marzo de 2026.
> Contexto: Se implementó el Coach IA (chat con contexto del WOD) y se necesita definir la estrategia de monetización antes de lanzar a producción.

---

## 1. Estado Actual

### Features que consumen IA (Gemini API)

| Feature | Modelo actual | Fallback | Límite free actual | Costo estimado/request |
|---------|--------------|----------|-------------------|----------------------|
| Generación de WOD | `gemini-3-flash-preview` | — | 5/día | ~$0.015-0.020 |
| Programa mensual (4 semanas) | `gemini-3-flash-preview` | — | 2/día | ~$0.010-0.015 |
| Análisis semanal | `gemini-3-flash-preview` | — | 5/día | ~$0.005-0.008 |
| **Coach IA (chat)** | `gemini-3-flash-preview` | `gemini-3.1-flash-lite-preview` | **20/día** | **~$0.005-0.010** |

### Costo mensual estimado por usuario activo

Supuesto: usuario genera 2 WODs/día, 1 programa/mes, 1 análisis/semana, 10 mensajes de chat/día.

| Concepto | Requests/mes | Costo/mes |
|----------|-------------|-----------|
| WODs | ~60 | ~$1.00 |
| Programa | ~1 | ~$0.015 |
| Análisis semanal | ~4 | ~$0.03 |
| Coach IA (chat) | ~300 | ~$2.00 |
| **Total por usuario** | **~365** | **~$3.05** |

> El Coach IA es el feature más costoso en volumen porque se usa conversacionalmente (múltiples mensajes por sesión). Sin embargo, el costo por mensaje es bajo.

### Infraestructura de rate limiting

- Ya implementada en `src/lib/rate-limit.ts`
- Tabla `usage_tracking` en Supabase con ventana de 24 horas
- Admin bypass (`role: 'admin'` en profiles)
- El campo `role: UserRole` ya existe (`'user' | 'admin'`)
- **Falta**: campo `tier` o `plan` en la tabla `profiles` para diferenciar free vs premium

---

## 2. Modelo Freemium Propuesto

### 2.1 Plan Gratuito

Objetivo: dar suficiente valor para que el usuario enganche, pero con fricción suficiente para motivar el upgrade.

| Feature | Límite Free |
|---------|-------------|
| Generación de WOD | 3/día |
| Programa mensual | 1/mes |
| Análisis semanal | 1/semana |
| **Coach IA** | **5 mensajes/día** |
| Live Workout Mode | Sin límite |
| Historial de WODs | Últimos 7 días |
| Personal Records | Sin límite |
| Feedback post-WOD | Sin límite |

**Razonamiento del límite de 5 mensajes/día (free)**:
- 5 mensajes = 2 intercambios completos (pregunta + respuesta) + 1 pregunta sin respuesta
- La tercera pregunta queda "colgada" intencionalmente: el usuario ya formuló su duda y se queda con las ganas de la respuesta — es el trigger de conversión más efectivo
- Un límite par (6) dejaría todo resuelto y eliminaría la fricción; un límite impar genera urgencia real
- Costo máximo: 5 msgs x 30 días x $0.008 = **~$1.20/mes por usuario free**

### 2.2 Plan Premium (Forgia Pro)

| Feature | Límite Pro |
|---------|-----------|
| Generación de WOD | 10/día |
| Programa mensual | Ilimitado |
| Análisis semanal | Ilimitado |
| **Coach IA** | **50 mensajes/día** |
| Live Workout Mode | Sin límite |
| Historial de WODs | Ilimitado |
| Personal Records | Sin límite |
| Feedback post-WOD | Sin límite |

**Razonamiento del límite de 50 mensajes/día (pro)**:
- 50 mensajes cubren ampliamente cualquier sesión de entrenamiento (~25 intercambios)
- Previene abuso (usuarios usando Forgia como ChatGPT genérico)
- Costo máximo: 50 msgs x 30 días x $0.008 = **~$12.00/mes por usuario pro**

---

## 3. Pricing

### 3.1 Análisis de costos

| Escenario | Costo IA/usuario/mes | Infraestructura | Total costo |
|-----------|---------------------|----------------|-------------|
| Usuario free activo | ~$1.50 | ~$0.50 | ~$2.00 |
| Usuario pro activo | ~$5.00 | ~$0.50 | ~$5.50 |
| Usuario pro power user | ~$12.00 | ~$0.50 | ~$12.50 |

### 3.2 Precios sugeridos

| Plan | Precio mensual | Precio anual | Margen mínimo |
|------|---------------|-------------|---------------|
| Free | $0 | $0 | Negativo (~-$2/usuario activo) |
| **Pro Mensual** | **$4.99 USD** | — | ~$0 (break-even en power users) |
| **Pro Anual** | — | **$39.99 USD** (~$3.33/mes) | Negativo en power users, positivo en promedio |

**Alternativa conservadora** (margen positivo garantizado):

| Plan | Precio mensual | Precio anual |
|------|---------------|-------------|
| **Pro Mensual** | **$7.99 USD** | — |
| **Pro Anual** | — | **$59.99 USD** (~$5.00/mes) |

### 3.3 Recomendación de pricing

**Ir con $7.99/mes o $59.99/año** por las siguientes razones:

1. **Margen positivo garantizado**: Incluso un power user ($12.50/mes de costo) solo supera el precio mensual en casos extremos. El usuario promedio costará ~$5.50/mes
2. **Percepción de valor**: $7.99 está en el rango de apps de fitness populares (Hevy $9.99, WODPROOF $7.99, Beyond the Whiteboard $7.99)
3. **Descuento anual atractivo**: $59.99/año = 37% de descuento vs mensual. Incentiva compromiso y reduce churn
4. **Espacio para crecer**: Si se agregan features premium adicionales (programación avanzada, análisis de video, integración con wearables), el precio ya lo soporta
5. **Mercado LATAM**: $7.99 USD ≈ $160 MXN/mes, que es accesible para el target (personas que ya pagan $800-2000 MXN/mes de membresía de box)

### 3.4 Comparativa con competidores

| App | Precio/mes | Coach IA | WOD Generator | Programación |
|-----|-----------|----------|---------------|-------------|
| WODPROOF | $7.99 | No | No | Manual |
| Beyond the Whiteboard | $7.99 | No | No | Manual |
| Hevy Pro | $9.99 | No | No | Templates |
| TrainHeroic (coach) | $25+ | No | No | Por coach |
| **Forgia Pro** | **$7.99** | **Si** | **Si (IA)** | **Si (IA)** |

> Forgia es la única app que ofrece generación de WODs por IA + Coach IA conversacional + periodización automática a ese precio. Es un diferenciador claro.

---

## 4. Implementación Técnica

### 4.1 Cambios en base de datos

```sql
-- Agregar campo de plan al perfil
ALTER TABLE profiles ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'pro'));

-- Agregar fecha de expiración de suscripción
ALTER TABLE profiles ADD COLUMN plan_expires_at TIMESTAMPTZ;

-- Índice para consultas de plan
CREATE INDEX idx_profiles_plan ON profiles (plan) WHERE plan != 'free';
```

### 4.2 Cambios en el tipo Profile

```typescript
// src/types/profile.ts
export type UserPlan = 'free' | 'pro';

export interface Profile {
  // ... campos existentes ...
  role: UserRole;
  plan: UserPlan;           // nuevo
  plan_expires_at?: string; // nuevo
}
```

### 4.3 Cambios en rate-limit.ts

```typescript
const DAILY_LIMITS: Record<UserPlan, Record<RateLimitedAction, number>> = {
  free: {
    generate_wod: 3,
    generate_program: 1,
    weekly_analysis: 1,
    chat: 5,
  },
  pro: {
    generate_wod: 10,
    generate_program: 999,
    weekly_analysis: 999,
    chat: 50,
  },
};

// En checkRateLimit, usar profile.plan para determinar límites
```

### 4.4 Procesador de pagos

**Recomendación: Stripe** (o Lemonsqueezy para simplificar impuestos en LATAM).

Flujo:
1. Usuario hace click en "Upgrade a Pro" en la página de cuenta
2. Redirect a Stripe Checkout con `price_id` del plan mensual o anual
3. Webhook de Stripe (`checkout.session.completed`) actualiza `profiles.plan = 'pro'` y `plan_expires_at`
4. Webhook de renovación (`invoice.paid`) extiende `plan_expires_at`
5. Webhook de cancelación (`customer.subscription.deleted`) marca `plan = 'free'` al expirar

### 4.5 UX del paywall

Cuando el usuario agota sus mensajes de chat (o WODs):

```
+------------------------------------------+
|  Se acabaron tus mensajes de hoy          |
|                                           |
|  Con Forgia Pro tienes 50 mensajes        |
|  diarios + WODs ilimitados + más.         |
|                                           |
|  [Upgrade a Pro — $7.99/mes]              |
|  [Ver planes]                             |
+------------------------------------------+
```

Puntos de venta (paywall triggers):
- Chat: al llegar a 5 mensajes (free)
- WOD: al llegar a 3 generaciones (free)
- Programa: al intentar generar el 2do programa del mes (free)
- Historial: al intentar ver WODs de más de 7 días (free)

---

## 5. Métricas Clave (KPIs)

### Pre-monetización (fase actual)

| Métrica | Cómo medir | Target |
|---------|-----------|--------|
| DAU (usuarios activos diarios) | GA4 `session_start` | Crecimiento constante |
| Chat adoption rate | `chat_opened` / DAU | >30% |
| Chat engagement depth | `chat_message_sent` promedio por sesión | >3 mensajes |
| WOD generation rate | `wod_generated` / DAU | >1.5 |
| Rate limit hits | 429 responses / total requests | <10% (no frustrar) |

### Post-monetización

| Métrica | Cómo medir | Target |
|---------|-----------|--------|
| Free → Pro conversion rate | Upgrades / usuarios free activos | >3-5% |
| Paywall view → conversion | Upgrades / paywall views | >10% |
| Monthly Recurring Revenue (MRR) | Stripe dashboard | Crecimiento mes a mes |
| Churn rate (mensual) | Cancelaciones / suscriptores activos | <8% |
| LTV (Lifetime Value) | MRR / churn rate | >$50 |
| Payback period | Costo adquisición / MRR por usuario | <2 meses |

---

## 6. Roadmap de Monetización

### Fase 1 — Preparación (actual)
- [x] Implementar rate limiting por usuario
- [x] Implementar Coach IA con límites
- [x] Admin bypass para testing
- [ ] Reducir límites free a los niveles propuestos (3 WODs, 5 chat)
- [ ] Agregar campo `plan` a profiles

### Fase 2 — Paywall UI
- [ ] Diseñar página de precios (`/precios`)
- [ ] Implementar paywall inline en puntos de conversión (chat agotado, WODs agotados)
- [ ] Agregar "badge Pro" en UI para usuarios premium
- [ ] Actualizar página de cuenta con info de suscripción

### Fase 3 — Pagos
- [ ] Integrar Stripe Checkout (o Lemonsqueezy)
- [ ] Implementar webhooks para gestión de suscripción
- [ ] Probar flujo completo: upgrade, renovación, cancelación, expiración
- [ ] Agregar facturación y recibos por email

### Fase 4 — Optimización
- [ ] A/B testing de precios ($4.99 vs $7.99 vs $9.99)
- [ ] Agregar trial de 7 días de Pro para nuevos usuarios
- [ ] Implementar Context Caching de Gemini para reducir costos
- [ ] Considerar modelo "pay-as-you-go" con paquetes de mensajes adicionales

---

## 7. Notas Importantes

### Sobre los límites free

Los límites del plan gratuito deben ser suficientes para que el usuario:
1. **Genere al menos 1 WOD** y lo complete con el Live Mode
2. **Pruebe el Coach IA** con 2-3 preguntas
3. **Entienda el valor** de las respuestas contextuales

Pero no tanto como para que nunca necesite el upgrade. La línea es delgada: si el free es demasiado restrictivo, el usuario se va sin probar; si es demasiado generoso, nunca paga.

### Sobre el Coach IA como driver de conversión

El Coach IA es el **feature con mayor potencial de conversión** porque:
- Es conversacional: el usuario siente la fricción inmediatamente cuando se acaban los mensajes
- Es contextual: no puede replicar la experiencia en ChatGPT/Gemini sin copiar todo el WOD
- Es recurrente: cada sesión de entrenamiento genera nuevas preguntas
- Es percibido como premium: "tener un coach personal" tiene alto valor percibido

### Sobre la competencia en precios

En el mercado de CrossFit/fitness funcional:
- Una clase drop-in cuesta $15-25 USD
- Una membresía mensual cuesta $100-200 USD
- Un coach personal cuesta $50-150 USD/sesión

$7.99/mes por un coach IA disponible 24/7 que conoce tu programa, tu nivel y tus limitaciones es percibido como extremadamente accesible.

### Sobre Gemini vs otros proveedores

Modelos actuales en uso (marzo 2026):
- **`gemini-3-flash-preview`** — modelo principal para todas las rutas (generación de WOD, programa, análisis, chat)
- **`gemini-3.1-flash-lite-preview`** — fallback automático para el Coach IA (chat) cuando el modelo principal retorna 503/429

Si el volumen de usuarios pro crece significativamente (100+ usuarios activos), considerar:
- **Gemini Flash-Lite** (versión estable cuando salga de preview) para mensajes de chat (más barato, suficiente para Q&A)
- **Gemini Flash** (versión estable) solo para generación de WODs y programas (requiere más calidad)
- **OpenAI GPT-4o-mini** como alternativa si Gemini degrada calidad o estabilidad
