---
name: audit
description: Auditoría técnica del codebase de Forgia. Detecta brechas de seguridad, regresiones de performance y violaciones de convenciones.
---

# Auditoría Técnica — Forgia

Ejecutas una auditoría completa del codebase de Forgia verificando 20 checks en 4 categorías. El objetivo es detectar regresiones, nuevas brechas y violaciones de las convenciones documentadas en `CLAUDE.md`.

## Instrucciones

Al ejecutar este skill, realiza **todos** los checks listados abajo en orden. Usa las herramientas Read, Grep y Glob para verificar cada punto. NO modifiques ningún archivo — solo reporta hallazgos.

Si el usuario pasa argumentos via `$ARGUMENTS`, interprétalos como filtro de categoría:
- `security` → solo checks de seguridad
- `performance` → solo checks de performance
- `quality` → solo checks de calidad de código
- `build` → solo checks de build/DX
- Sin argumentos → ejecutar todos los checks

## Checks

### Seguridad (6 checks)

**S1. Auth callback validado**
- Leer `src/app/auth/callback/route.ts`
- Verificar que existe función `getSafeRedirectPath` (o equivalente) que valida que el redirect empieza con `/app`
- Verificar que existe constante `VALID_OTP_TYPES` y se usa para validar el tipo antes de `verifyOtp`

**S2. Rate limiting en rutas AI**
- Buscar todos los archivos en `src/app/api/` que importen de `@google/genai` o llamen a Gemini
- Para cada uno, verificar que importa `checkRateLimit` de `@/lib/rate-limit` y lo llama antes de la lógica principal
- Rutas esperadas: `generate-wod`, `generate-program`, `weekly-analysis`, `training-intelligence`, `assessments/[id]/complete`

**S3. Sanitización de inputs en prompts AI**
- Buscar en `src/app/api/generate-wod/route.ts` que los sessionNotes se sanitizan con `.slice()` y `.replace(/[<>{}]/g, '')` antes de inyectarlos en el prompt
- Verificar que existe un delimitador (ej: `---INICIO NOTA---`) para encapsular el input del usuario

**S4. Security headers en next.config.ts**
- Leer `next.config.ts`
- Verificar presencia de estos 6 headers en la función `headers()`:
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`

**S5. Error messages no exponen detalles internos**
- Buscar en `src/app/api/` el patrón `error.message` dentro de `NextResponse.json()`
- Cada aparición es un hallazgo: la respuesta al cliente debe ser un mensaje genérico en español, no el error interno
- Excepción: `console.error(error.message)` está bien (log interno)

**S6. Email con TLS**
- Leer `src/lib/email.ts` (si existe)
- Verificar que el transporter incluye `requireTLS: true`

### Performance (4 checks)

**P1. Landing page es Server Component**
- Leer las primeras 5 líneas de `src/app/page.tsx`
- Si contiene `'use client'` → hallazgo

**P2. Componentes pesados usan dynamic import**
- Buscar en `src/app/app/page.tsx` los imports de `LiveWorkoutOverlay` y `WorkoutFeedbackForm`
- Verificar que usan `dynamic()` de `next/dynamic` con `{ ssr: false }`

**P3. Images fill sin sizes**
- Buscar en `src/` todos los `<Image` que tengan `fill` prop
- Para cada uno, verificar que también tiene `sizes` prop
- Ignorar imágenes con dimensiones fijas (width/height < 48) — son iconos/avatares

**P4. SVGs inline que deberían ser Lucide**
- Buscar el patrón `const \w+Icon\s*=\s*\(props` en `src/`
- Cada aparición es un hallazgo EXCEPTO `SectionIcon` en `WodSectionCard.tsx` (componente personalizado con 4 variantes SVG que no tienen equivalente Lucide directo)
- Reportar archivo, nombre del icono, y equivalente Lucide sugerido

### Calidad de Código (5 checks)

**Q1. Animaciones registradas en @theme**
- Leer `src/app/globals.css`
- Extraer todos los `@keyframes <name>` definidos
- Verificar que cada uno tiene un `--animate-<name>` correspondiente en el bloque `@theme inline`
- Verificar que no existen clases manuales `.animate-*` fuera de `@theme`

**Q2. Páginas protegidas exportan metadata**
- Listar todos los `page.tsx` bajo `src/app/app/*/`
- Para cada uno: si es `'use client'` → no puede exportar metadata directamente (no es hallazgo en sí, pero reportar que no tiene título propio)
- Si no es client component → verificar que exporta `metadata` con `title`

**Q3. Error message leak en generate-program**
- Leer `src/app/api/generate-program/route.ts`
- Buscar si algún `catch` block expone `error.message` o `error instanceof Error ? error.message` directamente en la respuesta JSON al cliente

**Q4. useState excesivos**
- Buscar archivos en `src/` con más de 5 llamadas `useState` en un solo componente
- Para cada hallazgo, sugerir si podrían consolidarse en un objeto

**Q5. useMemo innecesarios**
- Revisar `src/components/CalendarView.tsx` y contar useMemo calls
- Verificar que no hay memos con `[]` como dependency array (operación constante que no necesita memo)

### Build / DX (5 checks)

**B1. loading.tsx y error.tsx existen**
- Verificar que existen:
  - `src/app/app/loading.tsx`
  - `src/app/app/error.tsx`

**B2. Vulnerabilidades de dependencias**
- Ejecutar `pnpm audit --json 2>/dev/null | head -5` (o `pnpm audit`)
- Reportar el número de vulnerabilidades encontradas
- Si > 0, listar los paquetes afectados

**B3. Bundle analyzer configurado**
- Leer `next.config.ts`
- Verificar que importa `@next/bundle-analyzer` y lo aplica condicionalmente con `process.env.ANALYZE`
- Verificar que `package.json` tiene script `"analyze"`

**B4. Build exitoso**
- Ejecutar `pnpm build 2>&1 | tail -5`
- Reportar si compiló exitosamente o si hay errores

**B5. Cambios sin committear**
- Ejecutar `git status --short`
- Si hay archivos modificados/untracked, listarlos como recordatorio

## Formato del Reporte

Al terminar todos los checks, presentar el reporte con este formato exacto:

```
## Auditoría Forgia — [YYYY-MM-DD]

### Seguridad [X/6 OK]
[resultado de cada check con checkmark o X]

### Performance [X/4 OK]
[resultado de cada check]

### Calidad de Código [X/5 OK]
[resultado de cada check]

### Build / DX [X/5 OK]
[resultado de cada check]

---

### Resumen
- **Total**: X/20 checks pasados
- **Hallazgos críticos** (seguridad): N
- **Hallazgos medios** (performance/calidad): N
- **Info** (build/DX): N

### Acciones Sugeridas
[Lista priorizada de los hallazgos que requieren acción, ordenados por severidad]
```

## Reglas

**SI:**
- Ejecutar TODOS los checks de la categoría solicitada
- Usar herramientas Read/Grep/Glob — no adivinar
- Ser específico: reportar archivo, línea, y fragmento de código relevante
- Sugerir el fix concreto para cada hallazgo

**NO:**
- NO modificar archivos — esto es solo diagnóstico
- NO saltar checks aunque parezcan triviales
- NO reportar false positives — verificar antes de reportar
- NO ejecutar `pnpm build` si el usuario solo pidió `security` o `quality`
