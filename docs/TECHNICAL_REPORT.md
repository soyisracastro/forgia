# Forgia — Informe Técnico Completo

> Documento generado el 6 de febrero de 2026.
> Versión del producto: MVP v1.0 (8 fases completadas)
> Repositorio: `soyisracastro/forgia`

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Base de Datos](#5-base-de-datos)
6. [API Routes (Backend)](#6-api-routes-backend)
7. [Sistema de Periodización](#7-sistema-de-periodización)
8. [Interfaz de Usuario](#8-interfaz-de-usuario)
9. [Seguridad y Autenticación](#9-seguridad-y-autenticación)
10. [Rendimiento y UX](#10-rendimiento-y-ux)
11. [Historial de Desarrollo](#11-historial-de-desarrollo-fases-1-8)
12. [Roadmap Futuro](#12-roadmap-futuro--propuestas-de-mejora)
13. [Consideraciones Legales y de Privacidad](#13-consideraciones-legales-y-de-privacidad)
14. [Identidad de Marca](#14-identidad-de-marca)
15. [Milestones de Comercialización](#15-milestones-de-comercialización)

---

## 1. Resumen Ejecutivo

### Qué es Forgia

Forgia es una aplicación web que genera entrenamientos diarios (WODs — Workout of the Day) personalizados para practicantes de CrossFit y calistenia, utilizando inteligencia artificial. La aplicación adapta cada entrenamiento al perfil del atleta — su nivel de experiencia, objetivos, equipamiento disponible, historial de lesiones y edad — y aprende de sus resultados anteriores para mejorar progresivamente la calidad de las recomendaciones.

### Para quién

- Practicantes de CrossFit que entrenan por su cuenta o quieren variedad en su programación
- Practicantes de calistenia que buscan estructura en sus sesiones
- Potencialmente: coaches que necesitan herramientas de programación para sus clases

### Qué problema resuelve

Programar entrenamientos de CrossFit requiere conocimiento de periodización, variedad de movimientos, escalamiento por nivel, y equilibrio entre dominios (halterofilia, gimnásticos, cardio). Forgia automatiza este proceso con IA, adaptándose al perfil individual y al historial de entrenamiento del usuario.

### Estado actual

El MVP está completo con 8 fases implementadas:

| Fase | Feature | Estado |
|------|---------|--------|
| 1 | Autenticación + Landing page | Completado |
| 2 | Onboarding (perfil de atleta) | Completado |
| 3 | Generación de WOD personalizada + almacenamiento | Completado |
| 4 | Display visual mejorado + copiar/imprimir | Completado |
| 5 | Feedback post-entrenamiento + análisis IA | Completado |
| 6 | Vista de calendario en historial | Completado |
| 7 | Periodización + inteligencia de entrenamiento | Completado |
| 8 | Live Workout Mode (timer en vivo) | Completado |

### Métricas del codebase

- **40+ archivos** de código fuente en `src/`
- **~4,500 líneas** de TypeScript/TSX
- **27 componentes** React
- **3 hooks** personalizados
- **3 API routes**
- **2 contextos** (Auth, Theme)
- **3 tablas** en Supabase
- **0 dependencias de UI** externas (todo Tailwind CSS nativo)

---

## 2. Stack Tecnológico

### Framework: Next.js 16.1.6

- **App Router** con soporte para Server Components y Client Components
- **Turbopack** como bundler (significativamente más rápido que Webpack)
- **API Routes** en `src/app/api/` para lógica server-side (llamadas a Gemini)
- **Middleware** para protección de rutas (`src/middleware.ts`)
- Se eligió Next.js por su capacidad de combinar frontend y backend en un solo proyecto, SSR para SEO en la landing, y el ecosistema de Vercel para deployment

### UI: React 19

- Hooks modernos (`useState`, `useEffect`, `useCallback`, `useRef`, `useMemo`)
- Client Components (`'use client'`) para interactividad
- Server Components para páginas estáticas (landing, layouts)
- Se aprovecha React 19 por estabilidad y compatibilidad con Next.js 16

### Lenguaje: TypeScript (strict mode)

- Interfaces y tipos definidos en `src/types/` (wod.ts, profile.ts)
- Path alias `@/*` → `./src/*` para imports limpios
- Tipos estrictos en toda la aplicación (sin `any` implícitos)

### Estilos: Tailwind CSS v4

- Utility-first CSS sin dependencias de componentes de UI
- **Custom variant** para dark mode: `@custom-variant dark (&:where(.dark, .dark *))`
- **`@theme inline`** para definir animaciones personalizadas
- Variables CSS para colores (`:root` y `.dark`)
- Print styles en `@media print` para exportación limpia
- PostCSS con plugin `@tailwindcss/postcss`

### Base de datos y Auth: Supabase

- **Supabase Auth**: email/password con confirmación por email (flujo PKCE)
- **PostgreSQL**: 3 tablas con Row Level Security (RLS)
- **`@supabase/ssr`**: Integración SSR con manejo de cookies en Next.js
- **`@supabase/supabase-js`**: Cliente JavaScript para operaciones CRUD
- Se eligió Supabase por ser open-source, ofrecer auth + DB en un solo servicio, y tener un tier gratuito generoso

### IA: Google Gemini API

- **Modelo**: `gemini-3-flash-preview`
- **SDK**: `@google/genai` v1.39.0
- **Modo**: JSON schema (structured output) para respuestas tipadas
- Se eligió Gemini Flash por su velocidad, costo bajo, y calidad suficiente para generación de WODs

### Package Manager: pnpm

- Instalación rápida con symlinks
- Ahorro de espacio en disco
- Lockfile determinístico

### Resumen de dependencias

```
Producción (6):
  @google/genai      ^1.39.0   — SDK de Gemini
  @supabase/ssr      ^0.8.0    — Supabase SSR
  @supabase/supabase-js ^2.94.0 — Cliente Supabase
  next               16.1.6    — Framework
  react              19.2.3    — UI
  react-dom          19.2.3    — React DOM

Desarrollo (7):
  @tailwindcss/postcss ^4      — PostCSS plugin
  @types/node, react, react-dom — TypeScript types
  eslint + eslint-config-next  — Linting
  tailwindcss         ^4       — CSS framework
  typescript          ^5       — Compilador
```

---

## 3. Arquitectura del Sistema

### Diagrama general

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
│                                                              │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Landing  │  │   Login   │  │   App    │  │  Historia  │ │
│  │ (public) │  │  (public) │  │(protect) │  │ (protect)  │ │
│  └──────────┘  └───────────┘  └────┬─────┘  └─────┬──────┘ │
│                                     │              │         │
│  ┌──────────────────────────────────┴──────────────┴───────┐ │
│  │              React Context Layer                         │ │
│  │  AuthContext (user, profile)  │  ThemeContext (dark mode)│ │
│  └──────────────────────────────────────────────────────────┘ │
│                          │                                    │
│  ┌──────────────────────┴───────────────────────────────────┐│
│  │              Client-side API Layer (src/lib/gemini.ts)    ││
│  │  generateWod()  │  analyzeFeedback()  │  fetchIntel()    ││
│  └──────────────────────────────────────────────────────────┘│
│                          │ fetch()                            │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                     SERVIDOR (Next.js)                        │
│                          │                                    │
│  ┌───────────────────────┴──────────────────────────────────┐│
│  │                    Middleware                              ││
│  │  Protección de rutas: /app/* requiere auth                ││
│  │  Refresh de session cookies en cada request               ││
│  └───────────────────────┬──────────────────────────────────┘│
│                          │                                    │
│  ┌───────────────────────┴──────────────────────────────────┐│
│  │                   API Routes                              ││
│  │                                                           ││
│  │  POST /api/generate-wod                                   ││
│  │    ├─ Auth check (Supabase getUser)                       ││
│  │    ├─ Fetch profile + 28d history + feedback              ││
│  │    ├─ Build system instruction + periodization context     ││
│  │    └─ Call Gemini → return Wod JSON                       ││
│  │                                                           ││
│  │  POST /api/analyze-feedback                               ││
│  │    ├─ Auth check                                          ││
│  │    ├─ Fetch feedback + profile                            ││
│  │    ├─ Call Gemini → return GeminiAnalysis JSON            ││
│  │    └─ Save analysis to DB                                 ││
│  │                                                           ││
│  │  GET /api/training-intelligence                           ││
│  │    ├─ Auth check                                          ││
│  │    ├─ Fetch 28d WODs + feedback                           ││
│  │    └─ Run periodization analysis → return summary         ││
│  └───────────────────────────────────────────────────────────┘│
│                          │                                    │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                   SERVICIOS EXTERNOS                          │
│                          │                                    │
│  ┌───────────┐    ┌──────┴──────┐                            │
│  │  Supabase │    │ Google      │                            │
│  │           │    │ Gemini API  │                            │
│  │  - Auth   │    │             │                            │
│  │  - DB     │    │ gemini-3-   │                            │
│  │  - RLS    │    │ flash-      │                            │
│  │           │    │ preview     │                            │
│  └───────────┘    └─────────────┘                            │
└──────────────────────────────────────────────────────────────┘
```

### Flujo de autenticación

```
1. Usuario visita /login
2. Ingresa email + contraseña
3. Supabase Auth procesa:
   - Login: valida credenciales → devuelve session
   - Signup: crea usuario → envía email de confirmación
4. Email de confirmación tiene link a /auth/callback?code=XXX
5. /auth/callback intercambia code por session (PKCE flow)
6. Session se almacena en cookies HttpOnly
7. Middleware valida cookies en cada request a /app/*
8. Si no hay session → redirect a /login
9. Si hay session → continúa a la ruta solicitada
10. AuthContext en cliente carga user + profile
11. OnboardingGuard verifica onboarding_completed
12. Si false → redirect a /app/onboarding
```

### Flujo de generación de WOD

```
1. Usuario hace clic en "Generar WOD"
2. Cliente llama POST /api/generate-wod con sessionNotes opcionales
3. API Route:
   a. Autentifica usuario via Supabase
   b. Carga perfil del usuario (nivel, edad, equipamiento, objetivos, lesiones)
   c. Carga últimos 28 días de WODs (para periodización)
   d. Carga últimos 28 días de feedback (para ajuste de intensidad)
   e. Ejecuta análisis de periodización:
      - Balance de dominios (halterofilia/gimnásticos/cardio)
      - Carga semanal (tendencia de dificultad)
      - Rotación de fuerza (movimientos recientes)
      - Necesidad de deload (sesiones de alta intensidad consecutivas)
      - Patrones de entrenamiento (días preferidos, frecuencia)
   f. Construye system instruction con:
      - Persona de coach experto (15+ años)
      - Directivas por nivel (Principiante/Intermedio/Avanzado)
      - Directivas por equipamiento (5 niveles)
      - Directivas por objetivo (fuerza/hipertrofia/peso/resistencia/movilidad/competencia)
      - Consideraciones por edad (<18, >50)
      - Advertencias de lesiones
      - Contexto de periodización
      - Resumen de últimos entrenamientos
   g. Envía prompt a Gemini con schema JSON
   h. Parsea respuesta → devuelve Wod object
4. Cliente recibe WOD → renderiza con WodDisplay
5. Usuario puede: copiar, imprimir, guardar, iniciar entrenamiento, o registrar resultado
```

### Flujo de feedback y análisis

```
1. Usuario completa entrenamiento
2. Abre formulario de feedback:
   - Dificultad percibida (1-10)
   - Tiempo total (minutos)
   - Modalidad (Rx o Scaled)
   - Notas opcionales
3. Guarda en tabla workout_feedback (con snapshot del WOD)
4. Opcionalmente, solicita análisis IA:
   a. Cliente llama POST /api/analyze-feedback con feedbackId
   b. API carga feedback + perfil
   c. Gemini genera análisis estructurado:
      - Resumen
      - Fortalezas observadas
      - Áreas de mejora
      - Recomendaciones concretas
      - Progresión sugerida
   d. Análisis se guarda en campo gemini_analysis del feedback
   e. Se muestra en 4 tarjetas de colores
5. Este feedback influye en la generación del PRÓXIMO WOD:
   - Si avg dificultad < 4 → aumentar intensidad
   - Si avg dificultad > 8 → reducir complejidad
   - Si >50% Scaled → diseños más accesibles
   - Movimientos recientes → evitar repetición
```

---

## 4. Estructura del Proyecto

```
wod-generator-next/
├── .env.local                    # Variables de entorno (Supabase + Gemini keys)
├── .gitignore
├── eslint.config.mjs             # ESLint con Next.js + TypeScript
├── next.config.ts                # Configuración Next.js (minimal)
├── package.json                  # Dependencias y scripts
├── pnpm-lock.yaml                # Lockfile
├── postcss.config.mjs            # PostCSS con Tailwind v4
├── tsconfig.json                 # TypeScript strict mode
├── public/                       # Assets estáticos
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
└── src/
    ├── middleware.ts              # Protección de rutas + refresh de session
    │
    ├── app/                      # Next.js App Router
    │   ├── layout.tsx            # Root layout (ThemeProvider, fuentes Geist)
    │   ├── page.tsx              # Landing page pública
    │   ├── globals.css           # Estilos globales, animaciones, print styles
    │   │
    │   ├── login/
    │   │   └── page.tsx          # Formulario login/signup
    │   │
    │   ├── auth/
    │   │   └── callback/
    │   │       └── route.ts      # OAuth callback (PKCE code exchange)
    │   │
    │   ├── api/
    │   │   ├── generate-wod/
    │   │   │   └── route.ts      # POST: Generación de WOD con Gemini (393 líneas)
    │   │   ├── analyze-feedback/
    │   │   │   └── route.ts      # POST: Análisis de feedback con Gemini (183 líneas)
    │   │   └── training-intelligence/
    │   │       └── route.ts      # GET: Resumen de periodización (101 líneas)
    │   │
    │   └── app/                  # Rutas protegidas (requieren auth)
    │       ├── layout.tsx        # Layout con AuthProvider + OnboardingGuard
    │       ├── page.tsx          # Dashboard principal (generador de WOD)
    │       ├── historia/
    │       │   └── page.tsx      # Historial de entrenamientos
    │       └── onboarding/
    │           └── page.tsx      # Wizard de configuración de perfil
    │
    ├── components/
    │   ├── AppHeader.tsx         # Header de navegación (WOD | Historia | perfil)
    │   ├── AppFooter.tsx         # Footer con copyright
    │   ├── ThemeToggle.tsx       # Toggle dark/light mode
    │   ├── Spinner.tsx           # Indicador de carga SVG
    │   ├── ErrorDisplay.tsx      # Mensajes de error
    │   │
    │   ├── WodDisplay.tsx        # Renderizado completo del WOD (grid 4 secciones)
    │   ├── WodSectionCard.tsx    # Tarjeta individual por sección (warmUp/metcon/etc)
    │   ├── CopyWodButton.tsx     # Copiar WOD como texto plano al clipboard
    │   ├── PrintWodButton.tsx    # Imprimir WOD (window.print)
    │   │
    │   ├── WodListView.tsx       # Vista lista del historial
    │   ├── CalendarView.tsx      # Vista calendario del historial (grid 7 columnas)
    │   │
    │   ├── WorkoutFeedbackForm.tsx    # Formulario de resultado post-workout
    │   ├── WorkoutAnalysis.tsx        # Display del análisis de Gemini (4 tarjetas)
    │   ├── TrainingIntelligenceCard.tsx # Resumen de periodización en dashboard
    │   │
    │   ├── ui/
    │   │   └── SegmentedButton.tsx    # Control segmentado reutilizable (tabs)
    │   │
    │   ├── live/
    │   │   ├── LiveWorkoutOverlay.tsx  # Orquestador full-screen del workout en vivo
    │   │   ├── LiveTimerDisplay.tsx    # Display de dígitos del timer
    │   │   ├── LiveSectionView.tsx     # Vista de sección actual durante workout
    │   │   └── LiveWorkoutSummary.tsx  # Resumen post-workout con breakdown
    │   │
    │   └── onboarding/
    │       ├── OnboardingWizard.tsx    # Wizard de 4 pasos
    │       ├── OnboardingGuard.tsx     # Guard que redirige si no completó onboarding
    │       ├── StepIndicator.tsx       # Indicador de progreso visual
    │       ├── Step1BasicInfo.tsx      # Nombre, edad, nivel, lesiones
    │       ├── Step2Objectives.tsx     # Objetivos (multi-select, 1-2)
    │       ├── Step3TrainingType.tsx   # CrossFit vs Calistenia
    │       └── Step4Equipment.tsx      # Nivel de equipamiento
    │
    ├── contexts/
    │   ├── AuthContext.tsx        # Provider de auth (user, profile, signOut)
    │   └── ThemeContext.tsx       # Provider de tema (dark/light, localStorage)
    │
    ├── hooks/
    │   ├── useTimer.ts           # Timer engine (4 modos: countdown/stopwatch/emom/tabata)
    │   ├── useAudioCues.ts       # Beeps sintetizados via Web Audio API
    │   └── useWakeLock.ts        # Screen Wake Lock API
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts         # Cliente Supabase para browser (con lock bypass)
    │   │   └── server.ts         # Cliente Supabase para server (SSR con cookies)
    │   ├── wods.ts               # CRUD de WODs y feedback (Supabase queries)
    │   ├── gemini.ts             # Wrappers fetch para API routes
    │   ├── periodization.ts      # Motor de análisis de periodización (605 líneas)
    │   ├── formatWodAsText.ts    # Formateo de WOD como texto plano (con emojis)
    │   └── dateUtils.ts          # Utilidades de fecha para el calendario
    │
    └── types/
        ├── wod.ts                # Wod, WodSection, SavedWod, WorkoutFeedback, GeminiAnalysis
        └── profile.ts            # Profile, ExperienceLevel, Objective, TrainingType, etc.
```

### Convenciones

- **Componentes**: PascalCase, un componente por archivo (`.tsx`)
- **Hooks**: camelCase con prefijo `use` (`.ts`)
- **Tipos**: PascalCase para interfaces, archivos en `src/types/`
- **API Routes**: `route.ts` dentro de carpetas descriptivas
- **Organización**: Híbrido feature/type — componentes generales en raíz, features específicas en subcarpetas (`live/`, `onboarding/`, `ui/`)

---

## 5. Base de Datos

### Proveedor: Supabase (PostgreSQL)

URL del proyecto: `lcwedijsqofctpqebtig.supabase.co`

### Tabla: `profiles`

Creada automáticamente via trigger cuando un usuario se registra en `auth.users`.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | No | gen_random_uuid() | PK |
| `email` | TEXT | No | — | Email del usuario |
| `display_name` | TEXT | Sí | NULL | Nombre para mostrar |
| `age` | INTEGER | Sí | NULL | Edad del atleta |
| `experience_level` | TEXT | Sí | NULL | Principiante/Intermedio/Avanzado |
| `injury_history` | TEXT | Sí | NULL | Historial de lesiones (texto libre) |
| `objectives` | TEXT[] | Sí | NULL | Array de objetivos (máx. 2) |
| `training_type` | TEXT | Sí | NULL | CrossFit/Calistenia |
| `equipment_level` | TEXT | Sí | NULL | Nivel de equipamiento |
| `onboarding_completed` | BOOLEAN | No | false | Si completó el wizard |
| `created_at` | TIMESTAMPTZ | No | now() | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | No | now() | Última actualización |

**CHECK constraints**:
- `experience_level` IN ('Principiante', 'Intermedio', 'Avanzado')
- `training_type` IN ('CrossFit', 'Calistenia')
- `equipment_level` IN ('Box completo', 'Box equipado básico', 'Peso corporal + equipamiento mínimo', 'Superficies para ejercicios', 'Equipamiento complementario')
- `age` BETWEEN 13 AND 120
- `array_length(objectives, 1)` BETWEEN 1 AND 2

**Trigger**: `on_auth_user_created` → crea fila en `profiles` con `id` y `email` del nuevo usuario

### Tabla: `wods`

Almacena los WODs generados y guardados por el usuario.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | No | gen_random_uuid() | PK |
| `user_id` | UUID | No | — | FK → auth.users.id |
| `wod` | JSONB | No | — | Objeto Wod completo |
| `created_at` | TIMESTAMPTZ | No | now() | Fecha de guardado |

**Índice**: `(user_id, created_at DESC)` para consultas eficientes de historial

**RLS Policies**:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

### Tabla: `workout_feedback`

Almacena feedback post-entrenamiento y análisis de Gemini.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | No | gen_random_uuid() | PK |
| `user_id` | UUID | No | — | FK → auth.users.id |
| `wod_id` | UUID | Sí | NULL | FK → wods.id (nullable si WOD no guardado) |
| `wod_snapshot` | JSONB | No | — | Copia del WOD al momento del feedback |
| `difficulty_rating` | INTEGER | No | — | 1-10, dificultad percibida |
| `total_time_minutes` | INTEGER | Sí | NULL | Tiempo total en minutos |
| `rx_or_scaled` | TEXT | No | — | 'Rx' o 'Scaled' |
| `notes` | TEXT | Sí | NULL | Notas del atleta |
| `gemini_analysis` | JSONB | Sí | NULL | Análisis generado por Gemini |
| `created_at` | TIMESTAMPTZ | No | now() | Fecha del registro |

**Índice**: `(user_id, created_at DESC)` para consultas eficientes

**RLS Policies**:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

### Relaciones

```
auth.users (Supabase internal)
  │
  ├──1:1──→ profiles (auto-created via trigger)
  │
  ├──1:N──→ wods
  │           │
  │           └──1:1──→ workout_feedback (via wod_id, nullable)
  │
  └──1:N──→ workout_feedback (via user_id)
```

---

## 6. API Routes (Backend)

### POST `/api/generate-wod`

**Archivo**: `src/app/api/generate-wod/route.ts` (393 líneas)

**Autenticación**: Requerida (Supabase server client → getUser)

**Request**:
```typescript
{
  sessionNotes?: string  // Notas opcionales para la sesión
}
```

**Response** (200):
```typescript
{
  title: string;           // Nombre temático del WOD
  warmUp: {
    title: string;         // "Calentamiento"
    duration: string;      // "10-15 minutos"
    parts: string[];       // Lista de movimientos
  };
  strengthSkill: {
    title: string;         // "Fuerza: Back Squat" o "Skill: Muscle-Up"
    details: string[];     // "5x5 @ 75% 1RM", etc.
  };
  metcon: {
    title: string;         // "Metcon: Fran" o similar
    type: string;          // "AMRAP 20", "For Time", "EMOM 15", "Tabata"
    description: string;   // "21-15-9 reps de:" o descripción
    movements: string[];   // Movimientos con pesos/reps
    notes: string;         // Opciones de escalamiento
  };
  coolDown: {
    title: string;         // "Vuelta a la Calma"
    duration: string;      // "5-10 minutos"
    parts: string[];       // Estiramientos
  };
}
```

**Errors**: 401 (no auth), 400 (no profile), 500 (Gemini error)

**Prompt Engineering — System Instruction**:

El sistema construye una instrucción detallada para Gemini que incluye múltiples secciones:

1. **Persona**: "Eres un coach de CrossFit de élite con más de 15 años de experiencia..."
2. **Perfil del atleta**: edad, nivel, objetivos, equipamiento, lesiones
3. **Directivas por nivel**:
   - Principiante: movimientos fundamentales, peso corporal, técnica
   - Intermedio: combinaciones, cargas moderadas, skills intermedios
   - Avanzado: movimientos complejos, cargas pesadas, alta intensidad
4. **Directivas por equipamiento**:
   - Box completo: barras olímpicas, rigs, rowers, assault bikes, etc.
   - Box básico: barras, pesas, kettlebells, pull-up bar
   - Mínimo: peso corporal, bandas, mancuernas ligeras
   - Calistenia: barra, paralelas, anillas
5. **Directivas por objetivo**: ajustes específicos de volumen/intensidad
6. **Consideraciones de edad**: <18 enfoque en técnica, >50 bajo impacto
7. **Lesiones**: "NUNCA incluyas movimientos que afecten [zona lesionada]"
8. **Contexto de feedback**: promedio de dificultad, tendencia, últimos movimientos
9. **Contexto de periodización**: balance de dominios, carga semanal, rotación de fuerza, alertas de deload

### POST `/api/analyze-feedback`

**Archivo**: `src/app/api/analyze-feedback/route.ts` (183 líneas)

**Request**:
```typescript
{ feedbackId: string }
```

**Response** (200):
```typescript
{
  resumen: string;              // Resumen de 2-3 oraciones
  fortalezas: string[];         // 2-4 fortalezas observadas
  areas_mejora: string[];       // 2-4 áreas de mejora
  recomendaciones: string[];    // 2-4 recomendaciones concretas
  progresion_sugerida: string;  // Sugerencia de progresión para próximas semanas
}
```

**Proceso**: Carga el feedback + perfil → construye prompt con detalle del WOD realizado + resultado del atleta → Gemini genera análisis → se guarda en `workout_feedback.gemini_analysis`

### GET `/api/training-intelligence`

**Archivo**: `src/app/api/training-intelligence/route.ts` (101 líneas)

**Response** (200):
```typescript
{
  hasEnoughData: boolean;    // true si hay ≥3 WODs
  totalWods: number;
  summary: {
    weekPhase: 'build' | 'peak' | 'deload' | 'recovery' | null;
    sessionsThisWeek: number;
    avgDifficultyThisWeek: number | null;
    daysSinceLastSession: number;
    dominantDomain: string | null;        // "Halterofilia", "Gimnásticos", "Cardio"
    underrepresentedDomain: string | null;
    strengthSuggestion: string | null;    // Movimiento sugerido
    deloadWarning: boolean;
    avgSessionsPerWeek: number;
  } | null;
}
```

---

## 7. Sistema de Periodización

### Archivo: `src/lib/periodization.ts` (605 líneas)

El sistema de periodización es el motor de inteligencia de Forgia. Analiza 28 días de historial de entrenamiento para generar recomendaciones que se inyectan directamente en el prompt de Gemini.

### Clasificación de movimientos

El sistema clasifica movimientos en dos dimensiones:

**Dominios** (clasificación CrossFit estándar):
- **Monostructural** (Cardio): correr, remar, bicicleta, saltar cuerda, nadar
- **Gimnásticos**: pull-ups, muscle-ups, handstand, toes-to-bar, burpees, box jumps
- **Halterofilia**: clean, snatch, deadlift, squat, press, thruster, wall balls

**Patrones de movimiento**:
- **Push**: press, push-up, jerk, HSPU, dips
- **Pull**: pull-up, row, clean, snatch, deadlift
- **Squat**: squat, thruster, wall ball, pistol
- **Hinge**: deadlift, clean, snatch, KB swing, GHD
- **Core**: sit-up, toes-to-bar, L-sit, plank

La clasificación usa **arrays de regex bilingües** (español e inglés) para matchear nombres de movimientos que aparecen en los WODs generados.

### Las 5 funciones de análisis

#### 1. `analyzeMovementDomains(wods)` → `DomainBalance`

Requiere ≥5 WODs para activarse.

- Extrae todos los movimientos de los WODs (warmUp, strengthSkill, metcon, coolDown)
- Clasifica cada uno en su dominio
- Calcula porcentaje por dominio
- Marca como **sobrerepresentado** si > 40%
- Marca como **subrepresentado** si < 15%
- También cuenta patrones (push/pull/squat/hinge/core)

#### 2. `analyzeWeeklyLoad(wods, feedback)` → `WeeklyLoad`

- Cuenta sesiones de la semana actual vs. semana anterior
- Calcula promedio de dificultad de la semana actual
- Cuenta días de alta intensidad (dificultad ≥ 8)
- Determina tendencia: `increasing` / `stable` / `decreasing`
- Genera recomendación: `push` / `maintain` / `recover`

#### 3. `analyzeStrengthRotation(wods)` → `StrengthRotation`

- Parsea títulos de la sección `strengthSkill` para extraer el movimiento principal
- Cuenta ocurrencias en los últimos 14 días
- Marca como **sobreutilizado** si aparece ≥ 3 veces en 14 días
- Sugiere movimientos del pool común que no se han trabajado recientemente

Pool de movimientos comunes:
```
Back Squat, Front Squat, Overhead Squat, Deadlift,
Bench Press, Strict Press, Push Press, Push Jerk,
Power Clean, Squat Clean, Power Snatch, Squat Snatch
```

#### 4. `analyzeDeloadNeed(feedback)` → `DeloadAssessment`

- Cuenta sesiones consecutivas con dificultad ≥ 8
- Analiza carga por semana (últimas 4 semanas)
- Determina fase:
  - `build`: carga creciente, intensidad moderada
  - `peak`: alta intensidad sostenida
  - `deload`: detecta necesidad de reducir (3+ sesiones de alta intensidad consecutivas)
  - `recovery`: carga baja
- Genera advertencia de deload si es necesario

#### 5. `analyzeTrainingPattern(wods)` → `TrainingPattern`

- Cuenta WODs por día de la semana (lunes=0, domingo=6)
- Identifica días preferidos de entrenamiento (los más frecuentes)
- Calcula promedio de sesiones por semana
- Calcula días desde la última sesión
- Determina si hoy es un día típico de entrenamiento

### Orquestadores

**`buildPeriodizationAnalysis(wods, feedback)`**: Ejecuta las 5 funciones y devuelve un objeto `PeriodizationAnalysis` completo.

**`buildPeriodizationContext(analysis)`**: Convierte el análisis en texto en español para inyectar en el system instruction de Gemini. Ejemplo de output:

```
=== CONTEXTO DE PERIODIZACIÓN (28 días) ===

BALANCE DE DOMINIOS:
- Halterofilia: 45% (sobrerepresentado — reducir esta semana)
- Gimnásticos: 35%
- Monostructural: 20%
Recomendación: Incluir más cardio monostructural.

CARGA SEMANAL:
- Esta semana: 3 sesiones, dificultad promedio 7.2
- Tendencia: creciente
- Directiva: MANTENER intensidad, el atleta está progresando bien.

ROTACIÓN DE FUERZA:
- Movimientos recientes: Back Squat (3x), Deadlift (2x)
- Sobreutilizado: Back Squat — NO incluir esta sesión
- Sugerido: Front Squat, Power Clean, Push Press

EVALUACIÓN DE DELOAD:
- Fase actual: BUILD
- Sin necesidad de deload.

PATRONES DE ENTRENAMIENTO:
- Promedio: 3.5 sesiones/semana
- Días preferidos: lunes, miércoles, viernes
- Última sesión: hace 1 día
```

---

## 8. Interfaz de Usuario

### Páginas y rutas

| Ruta | Tipo | Componente | Descripción |
|------|------|------------|-------------|
| `/` | Pública | `src/app/page.tsx` | Landing page con hero, features, CTAs |
| `/login` | Pública | `src/app/login/page.tsx` | Login/signup con toggle |
| `/auth/callback` | Pública | `src/app/auth/callback/route.ts` | Callback PKCE para email confirm |
| `/app` | Protegida | `src/app/app/page.tsx` | Dashboard: generador de WOD |
| `/app/historia` | Protegida | `src/app/app/historia/page.tsx` | Historial (lista/calendario) |
| `/app/onboarding` | Protegida | `src/app/app/onboarding/page.tsx` | Wizard de perfil (4 pasos) |

### Sistema de diseño

**Paleta de colores**:
- **Primario**: `red-500` (#ef4444) — CTAs, botones principales, acentos
- **Fondos light**: `#ffffff` (root), `neutral-50/100` (tarjetas)
- **Fondos dark**: `#0a0a0a` (root), `neutral-800/900` (tarjetas)
- **Texto light**: `#171717` (foreground), `neutral-500/600` (secundario)
- **Texto dark**: `#ededed` (foreground), `neutral-400/500` (secundario)
- **Secciones del WOD** (sistema de color por sección):
  - Calentamiento: `amber-400/500` (dorado cálido)
  - Fuerza/Skill: `blue-400/500` (azul)
  - Metcon: `red-500` (rojo, sección héroe)
  - Vuelta a la calma: `emerald-400/500` (verde)

**Tipografía**:
- **Sans**: Geist Sans (variable, de Vercel)
- **Mono**: Geist Mono (variable, para timers y datos numéricos)
- **Tamaños**: De `text-xs` (12px) a `text-9xl` (128px, timer en live mode)

**Espaciado y layout**:
- Container principal: `max-w-4xl mx-auto px-4 sm:px-6`
- Grid responsive para WOD: 2 columnas en desktop, 1 en mobile
- Full-screen overlay para live workout: `fixed inset-0 z-50`

**Dark mode**:
- Implementado con clase CSS `.dark` en `<html>`
- Toggle manual con persistencia en `localStorage`
- Detección de preferencia del sistema como fallback
- Todas las interfaces tienen variantes `dark:` completas

**Animaciones**:
- `fade-in-up`: Entrada suave (opacity 0→1, translateY 12→0), 0.4s ease-out
- `timer-pulse`: Pulsación para últimos 10 segundos del timer (opacity 1→0.6→1), 1s infinite
- Delays escalonados en secciones del WOD (0ms, 75ms, 150ms, 225ms)

### Componentes clave

**WodDisplay + WodSectionCard**: Renderiza el WOD completo en grid con 4 tarjetas color-coded. Cada tarjeta tiene borde izquierdo de 4px con el color de la sección, ícono, título, duración, descripción, lista de movimientos, y notas. La sección metcon recibe tratamiento hero (sombra, fondo diferente).

**WorkoutFeedbackForm**: Formulario inline con slider de dificultad (1-10 con labels semánticos), input numérico de tiempo, SegmentedButton para Rx/Scaled, textarea para notas. Acepta `initialTotalTime` para pre-llenado desde live mode.

**TrainingIntelligenceCard**: Tarjeta colapsable en el dashboard que muestra fase de entrenamiento (BUILD/PEAK/DELOAD/RECOVERY), sesiones de la semana, dominio subrepresentado, sugerencia de fuerza, y alerta de deload. Requiere ≥5 WODs para activarse.

**CalendarView**: Grid CSS de 7 columnas (lunes a domingo) con navegación por mes. Cada día con WODs muestra un punto rojo (WOD) y punto verde (feedback). Al hacer clic en un día, se expande un panel con los WODs de ese día.

**LiveWorkoutOverlay**: Overlay full-screen (bg-neutral-950) con state machine que recorre las 4 secciones del WOD. Incluye timer adaptativo (detecta tipo de metcon automáticamente), controles de pausa/skip/finish, audio cues, wake lock, y recovery via sessionStorage.

### Sistema de onboarding

4 pasos secuenciales:

1. **Info básica**: Nombre (requerido), edad (13-120), nivel de experiencia (SegmentedButton), historial de lesiones (textarea opcional)
2. **Objetivos**: 7 opciones con iconos y descripciones. Selección de 1-2 con lógica de compatibilidad (ej: "Ganar masa muscular" y "Perder peso" son mutuamente excluyentes). Tarjetas seleccionables con borde rojo.
3. **Tipo de entrenamiento**: CrossFit o Calistenia. Botones grandes con descripciones.
4. **Equipamiento**: Opciones dinámicas según tipo de entrenamiento. CrossFit: 3 niveles. Calistenia: 2 niveles.

Validación en cada paso antes de permitir avanzar. Al completar → guarda en `profiles` con `onboarding_completed: true` → redirect a `/app`.

### Live Workout Mode

**Timer engine** (`useTimer`):
- Basado en `Date.now()` + `requestAnimationFrame` para precisión wall-clock
- Sobrevive tabs inactivos (al volver, calcula el elapsed real)
- 4 modos:
  - `countdown`: cuenta regresiva (AMRAP)
  - `stopwatch`: cuenta progresiva (For Time, warmup, cooldown)
  - `emom`: intervalos de 60s con contador de rondas
  - `tabata`: ciclos 20s trabajo / 10s descanso × 8 rondas

**Audio cues** (`useAudioCues`):
- Sintetizados via Web Audio API (sin archivos de audio)
- 3 tipos: tick (880Hz, 80ms), transition (660Hz × 2), finish (440Hz → 880Hz)
- AudioContext creado lazy en primera interacción del usuario
- Mute toggle persistido en `localStorage`

**Wake Lock** (`useWakeLock`):
- Screen Wake Lock API para mantener pantalla encendida
- Re-adquiere al volver al tab (el spec la libera al backgroundear)
- No-op silencioso en navegadores sin soporte

**Session recovery**:
- Guarda estado en `sessionStorage` cada 5s
- Al recargar, si hay estado del mismo WOD con < 30 min de antigüedad, ofrece reanudar
- Se limpia al terminar o cancelar

---

## 9. Seguridad y Autenticación

### Flujo de autenticación

```
Signup:
  1. Usuario ingresa email + password en /login
  2. supabase.auth.signUp({ email, password, emailRedirectTo })
  3. Supabase envía email de confirmación con link
  4. Link apunta a /auth/callback?code=XXX
  5. Route handler intercambia code por session (PKCE)
  6. Session se almacena en cookies HttpOnly
  7. Redirect a /app

Login:
  1. Usuario ingresa email + password
  2. supabase.auth.signInWithPassword({ email, password })
  3. Session se almacena en cookies
  4. window.location.href = '/app' (full page reload para limpiar state)
```

### Protección de rutas

**Middleware** (`src/middleware.ts`):
- Se ejecuta en CADA request a `/app/*` y `/login`
- Crea cliente Supabase server con cookies del request
- Llama `supabase.auth.getUser()` (verifica token con Supabase, no solo decodifica JWT)
- Si no hay usuario y la ruta es `/app/*` → redirect a `/login`
- Si hay usuario y la ruta es `/login` → redirect a `/app`
- Refresca cookies de session en cada request

**OnboardingGuard** (client-side):
- Componente wrapper en el layout de `/app`
- Verifica `profile.onboarding_completed`
- Si `false` → redirect a `/app/onboarding`
- Se decidió hacer client-side (no middleware) para evitar queries adicionales a DB en cada request

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Las políticas aseguran que cada usuario solo puede ver y modificar SUS propios datos:

- `profiles`: usuario puede leer y actualizar su propio perfil
- `wods`: usuario puede CRUD solo sus propios WODs
- `workout_feedback`: usuario puede CRUD solo su propio feedback

### Variables de entorno

| Variable | Tipo | Sensibilidad | Descripción |
|----------|------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Baja | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Media | Clave anónima (limitada por RLS) |
| `GEMINI_API_KEY` | Server-only | **Alta** | API key de Google Gemini |

La `GEMINI_API_KEY` nunca se expone al cliente — solo se usa en API routes (server-side).

### Consideraciones de seguridad actuales

- Autenticación email/password con confirmación por email
- Tokens JWT en cookies HttpOnly (no expuestos a JavaScript)
- RLS en todas las tablas de Supabase
- API key de Gemini solo en server-side
- Validación de autenticación en cada API route
- Sin SQL directo — todo via Supabase client (previene SQL injection)
- Sin innerHTML o dangerouslySetInnerHTML (previene XSS)

---

## 10. Rendimiento y UX

### Loading states

- **Spinner global**: SVG animado con `animate-spin`, color `red-500`
- **Loading del WOD más reciente**: Spinner al montar `/app` mientras se carga de Supabase
- **Generación de WOD**: Mensaje "Personalizando tu infierno diario..." + Spinner
- **Guardado**: Botones cambian a "Guardado!" por 2 segundos
- **Análisis**: "Analizando..." con spinner inline

### Lazy loading

- **Feedback en historial**: Se carga solo al expandir un WOD específico (no preloaded)
- **TrainingIntelligenceCard**: Fetch independiente al montar, no bloquea el render del dashboard
- **Componentes live**: Solo se importan cuando se activa el modo en vivo

### Almacenamiento local

| Key | Storage | Propósito |
|-----|---------|-----------|
| `theme` | localStorage | Preferencia de dark/light mode |
| `live-workout-muted` | localStorage | Estado de mute del audio |
| `training-intel-collapsed` | localStorage | Estado colapsado de la tarjeta de inteligencia |
| `live-workout-state` | sessionStorage | Recovery del workout en vivo ante crash |
| `savedWods` | localStorage | (Legacy) Migrado a Supabase en primer login |
| `lastWod` | localStorage | (Legacy) Migrado a Supabase en primer login |

### Print styles

Estilos de impresión optimizados en `globals.css`:
- Fuerza tema claro independientemente del modo actual
- Oculta header, footer, navegación, botones (`[data-print-hide]`)
- Tarjetas con `break-inside: avoid` para no cortarse entre páginas
- Márgenes de página: 1.5cm
- Texto normalizado a colores oscuros
- Animaciones y transiciones deshabilitadas

### Wake Lock

La Screen Wake Lock API (`useWakeLock`) mantiene la pantalla encendida durante entrenamientos en vivo. Se re-adquiere automáticamente cuando el tab vuelve al frente. Fallback silencioso en navegadores sin soporte (Firefox).

---

## 11. Historial de Desarrollo (Fases 1-8)

### Fase 1: Autenticación + Landing (PR #1)

**Commit**: `312cb90` → Merge `abacadc`

- Landing page con hero section, 4 feature cards, CTAs
- Formulario de login/signup con toggle
- Supabase Auth (email/password + confirmación)
- Middleware de protección de rutas
- ThemeContext + ThemeToggle (dark/light mode)
- Root layout con fuentes Geist

### Fase 2: Onboarding (PR #2)

**Commit**: `7bdfc3c` → Merge `6f03b27`

- Wizard de 4 pasos para configurar perfil de atleta
- Step1: nombre, edad, nivel, lesiones
- Step2: objetivos (multi-select con compatibilidad)
- Step3: tipo de entrenamiento (CrossFit/Calistenia)
- Step4: equipamiento (dinámico según tipo)
- OnboardingGuard para redirección automática
- StepIndicator con progreso visual
- SegmentedButton como componente reutilizable

### Fase 3: Generación de WOD + Storage (PR #3)

**Commit**: `8a843ff` → Merge `1cefff0`

- API route `/api/generate-wod` con prompt engineering completo
- System instruction con directivas por nivel/equipo/objetivos/lesiones/edad
- Tabla `wods` en Supabase con RLS
- Guardado manual de WODs
- Migración one-time de localStorage a Supabase
- Notas de sesión opcionales
- Formato JSON schema para Gemini

### Fase 4: Display Visual + Acciones (Commit `e2253d9`)

- WodSectionCard con colores por sección (amber/blue/red/emerald)
- Borde izquierdo de 4px con accent color
- Tratamiento hero para metcon (sombra, fondo diferente)
- CopyWodButton con `formatWodAsText()` (texto plano con emojis)
- PrintWodButton con `window.print()`
- Print styles en globals.css
- Animación fade-in-up con delays escalonados

### Fase 5: Feedback + Análisis IA (PR #4)

**Commit**: `6724da1` → Merge `aefc6d8`

- Tabla `workout_feedback` en Supabase
- WorkoutFeedbackForm (dificultad, tiempo, Rx/Scaled, notas)
- API route `/api/analyze-feedback`
- WorkoutAnalysis con 4 tarjetas de colores
- Feedback influye en generación del próximo WOD
- `buildFeedbackContext()` con promedios y directivas
- Historia: lazy-load de feedback, indicador verde

### Fase 6: Vista de Calendario (PR #5)

**Commit**: `bdb9499` → Merge `de11f82`

- CalendarView con grid CSS de 7 columnas (lunes a domingo)
- Navegación por mes (anterior/siguiente)
- Dots de color por WOD (rojo) y feedback (verde)
- Panel expandible al hacer clic en un día
- Toggle Lista/Calendario con SegmentedButton
- dateUtils.ts para funciones puras de fecha
- WodListView extraído como componente independiente

### Fase 7: Periodización + Inteligencia (PR #6)

**Commit**: `66c85d5` → Merge `5a28d50`

- periodization.ts (605 líneas): 5 funciones de análisis + 2 orquestadores
- Clasificación de movimientos con regex bilingüe (ES/EN)
- Balance de dominios, carga semanal, rotación de fuerza, deload, patrones
- API route `/api/training-intelligence`
- TrainingIntelligenceCard (colapsable, persiste estado)
- Contexto de periodización inyectado en generación de WOD
- Query expandida a 28 días de historial

### Fase 8: Live Workout Mode (PR #7)

**Commit**: `997115f` → Merge `cf87a0c`

- useTimer hook: 4 modos (countdown, stopwatch, EMOM, Tabata)
- useAudioCues hook: beeps sintetizados via Web Audio API
- useWakeLock hook: Screen Wake Lock API
- LiveWorkoutOverlay: state machine full-screen
- LiveTimerDisplay: dígitos grandes con pulse en últimos 10s
- LiveSectionView: movimientos scrollable con colores por sección
- LiveWorkoutSummary: breakdown post-workout
- Detección automática de tipo de metcon
- Recovery via sessionStorage (30 min timeout)
- Integración con feedback form (initialTotalTime pre-fill)
- Auto-save del WOD al terminar

---

## 12. Roadmap Futuro — Propuestas de Mejora

### 12.1 Mejoras técnicas inmediatas (baja fricción)

Estas mejoras no requieren nuevas features pero mejoran la calidad del producto:

**Migrar `middleware.ts` → `proxy.ts`**
Next.js 16 deprecó el archivo `middleware.ts` en favor de `proxy.ts`. Actualmente funciona pero muestra un warning en cada build. La migración es directa y elimina el warning.

**Mejorar copies / UX writing**
Varios textos pueden mejorar para ser más claros:
- "Genera y registra más entrenamientos para activar la inteligencia de periodización" → más descriptivo
- Labels de la tarjeta de inteligencia de entrenamiento
- Mensajes de estado vacío

**Tests unitarios para `periodization.ts`**
Es el módulo con más lógica de negocio (605 líneas). Tests para:
- Clasificación de movimientos (regex)
- Cálculo de balance de dominios
- Detección de deload
- Edge cases: 0 WODs, 1 WOD, WODs sin movimientos

**Error boundaries**
Componentes clave como WodDisplay, LiveWorkoutOverlay y WorkoutAnalysis deberían tener error boundaries para evitar que un error en un componente hijo crashee toda la página.

**PWA (Progressive Web App)**
Agregar `manifest.json` y service worker básico para:
- Instalación en home screen (mobile)
- Icono personalizado
- Splash screen
- (Futuro) Modo offline para ver historial

**Optimistic UI en guardado**
Actualmente el botón "Guardar WOD" espera a la respuesta de Supabase. Podría actualizarse optimísticamente y revertir en caso de error.

### 12.2 Perfiles de Coach

**Idea del usuario**: Permitir que coaches utilicen la plataforma para generar programaciones para sus clases, no solo para entrenamiento personal.

**Análisis de viabilidad**:

El flujo de un coach es fundamentalmente diferente al de un atleta individual:

| Aspecto | Atleta (actual) | Coach (futuro) |
|---------|-----------------|----------------|
| **Genera para** | Sí mismo | Una clase de N atletas |
| **Perfil** | Personal (nivel, lesiones) | Perfil de clase (nivel promedio) |
| **Objetivo** | Progresión personal | Programación semanal coherente |
| **Feedback** | Individual | Agregado de la clase |
| **WODs** | 1 por día | Programación semanal completa |

**Modelo de datos propuesto**:
- Nueva tabla `coach_profiles` con campos específicos (box, capacidad, especialidad)
- Relación `coach → athletes` (1:N) para coaches que quieran trackear atletas individuales
- Tabla `class_templates` para programación semanal

**UI diferenciada**:
- Dashboard de clase (vs. dashboard personal)
- Vista de programación semanal (no solo WOD del día)
- Biblioteca de WODs favoritos/reutilizables
- Opciones de escalamiento predefinidas por nivel

**Recomendación**: Validar demanda antes de implementar. Medir cuántos usuarios del primer batch son coaches. Si >20% de los registros iniciales son coaches, priorizar este feature.

### 12.3 Tiers de IA / Modelo de monetización

**Idea del usuario**: Ofrecer diferentes niveles de servicio con modelos de IA de diferente capacidad.

**Propuesta de tiers**:

| Feature | Free (Gemini Flash) | Premium (Claude) |
|---------|-------------------|------------------|
| **Generación de WOD** | Gemini 3 Flash | Claude Sonnet 4.5 |
| **Análisis de feedback** | Análisis básico | Análisis profundo con progresión |
| **Periodización** | Dashboard simple | Programación periodizada semanal |
| **Límite diario** | 3 WODs/día | Ilimitado |
| **Historial** | 30 días | Ilimitado |
| **Live mode** | Incluido | Incluido |
| **Precio** | $0 | ~$99-199 MXN/mes |

**Implementación técnica**:
1. **Feature flags**: Campo `tier` en `profiles` ('free' | 'premium')
2. **Middleware de tier**: Verificar tier antes de llamar APIs premium
3. **Pagos**: Integración con Stripe o MercadoPago (más relevante para México)
4. **Switching de modelo**: Lógica en API route para elegir Gemini vs. Claude según tier
5. **Rate limiting**: Implementar en API routes para tier free

**Consideraciones de costos**:
- Gemini Flash: ~$0.001-0.003 por request (muy bajo)
- Claude Sonnet 4.5: ~$0.01-0.05 por request (10-50x más caro)
- Con 1000 usuarios premium generando 2 WODs/día: ~$600-3000 USD/mes en API costs
- El pricing del tier premium debe cubrir costos de API + margen

### 12.4 Módulo de Nutrición

**Idea del usuario**: Agregar funcionalidad relacionada con nutrición, pero con un enfoque responsable.

**Enfoque recomendado — conservador y ético**:

La nutrición deportiva requiere supervisión profesional. Forgia NO debe dar recomendaciones nutricionales directas por razones legales y de seguridad.

**Opciones viables (de menor a mayor complejidad)**:

1. **Tips generales de recuperación**: Contenido educativo genérico sobre hidratación, timing de comidas pre/post workout, importancia del sueño. Sin prescripciones específicas. Disclaimer claro.

2. **Directorio de nutriólogos deportivos**: Base de datos de profesionales de nutrición deportiva con:
   - Nombre, especialidad, ubicación, contacto
   - Filtro por ciudad/estado
   - Enlace a redes/sitio web del profesional
   - Modelo: el nutriólogo paga por visibilidad (lead gen)

3. **Integración con plataformas existentes**: Enlazar con apps de nutrición establecidas (MyFitnessPal, Cronometer) sin reinventar la rueda.

**Riesgos a considerar**:
- Responsabilidad legal por recomendaciones nutricionales
- Regulaciones de salud en México (COFEPRIS)
- Diferencia entre "información educativa" y "prescripción nutricional"
- Necesidad de disclaimer visible y claro

### 12.5 Social Sharing

**Compartir WOD como imagen**:
- Usar HTML Canvas para renderizar el WOD como PNG con branding de Forgia
- Incluir: título, secciones, logo, fecha
- Botón "Compartir en Instagram/WhatsApp"
- Tamaño optimizado para Instagram Stories (1080×1920)

**Open Graph meta tags**:
- Agregar `<meta og:*>` dinámicos para que los links compartidos tengan preview
- Imagen, título, descripción del WOD

**Leaderboards** (opcional, futuro):
- Rankings anónimos por WOD (tiempos, reps)
- Opt-in, nunca obligatorio
- Comparación entre amigos (invitaciones)

### 12.6 Otras mejoras potenciales

- **Notificaciones push**: Recordatorio diario de entrenamiento (Web Push API)
- **Integración con wearables**: Apple Health / Google Fit para importar datos de frecuencia cardíaca, calorías
- **Exportación de datos**: CSV/PDF del historial completo
- **Multi-idioma**: Inglés como segundo idioma (i18n con next-intl)
- **Benchmark tracking**: Registro de PRs personales (1RM squat, tiempo en Fran, etc.)
- **Templates de WOD**: WODs populares pre-hechos (Fran, Murph, Grace) para comparar resultados
- **Modo offline**: Service worker para ver historial sin conexión
- **Analytics**: Integrar Vercel Analytics o Plausible para entender el uso

---

## 13. Consideraciones Legales y de Privacidad

### Datos que se recolectan

| Dato | Sensibilidad | Almacenamiento | Uso |
|------|-------------|----------------|-----|
| Email | Media | Supabase Auth | Autenticación |
| Nombre | Baja | Supabase DB | Display en UI |
| Edad | Media | Supabase DB | Personalización de WODs |
| Lesiones | **Alta** | Supabase DB | Evitar movimientos peligrosos |
| Objetivos | Baja | Supabase DB | Personalización |
| WODs generados | Baja | Supabase DB | Historial + periodización |
| Feedback (dificultad, notas) | Media | Supabase DB | Mejora de recomendaciones |

### Datos enviados a terceros

**Google Gemini API** recibe en cada request de generación:
- Perfil del usuario (edad, nivel, equipamiento, objetivos, lesiones)
- Últimos 5 registros de feedback (dificultad, tiempo, notas)
- Resumen de últimos 28 días de entrenamiento (movimientos, patrones)

**Supabase** (infraestructura):
- Todos los datos de usuario (almacenamiento)
- Región del servidor: verificar en dashboard de Supabase

### Marco legal aplicable

**En México — LFPDPPP** (Ley Federal de Protección de Datos Personales en Posesión de Particulares):

Obligaciones como "responsable" de datos personales:
1. **Aviso de privacidad**: Obligatorio. Debe informar qué datos se recolectan, para qué, cómo se protegen, derechos ARCO del titular.
2. **Consentimiento**: El usuario debe consentir explícitamente el tratamiento de sus datos.
3. **Derechos ARCO**: Acceso, Rectificación, Cancelación, Oposición. Debe existir un mecanismo para que el usuario los ejerza.
4. **Datos sensibles**: El historial de lesiones califica como dato sensible de salud. Requiere consentimiento expreso.
5. **Transferencia a terceros**: Se envían datos a Google (Gemini). Debe informarse en el aviso de privacidad.

**Si hay usuarios europeos — GDPR**:
- Consentimiento explícito e informado
- Derecho al olvido (eliminación de datos)
- Portabilidad de datos
- Base legal para el procesamiento
- DPO (Data Protection Officer) si escala

### Documentos legales necesarios

1. **Aviso de Privacidad** (obligatorio en México):
   - Identidad del responsable
   - Datos personales que se recaban
   - Finalidades del tratamiento
   - Transferencias a terceros (Google Gemini)
   - Mecanismo para derechos ARCO
   - Uso de cookies

2. **Términos y Condiciones de Uso**:
   - Naturaleza del servicio
   - Responsabilidades del usuario
   - Limitaciones de responsabilidad
   - **Disclaimer de salud**: "Los entrenamientos generados por Forgia son sugerencias basadas en inteligencia artificial y NO sustituyen el consejo de un profesional de salud, entrenador certificado o médico deportivo. Consulta a un profesional antes de iniciar cualquier programa de ejercicios."
   - Propiedad intelectual
   - Política de cancelación/modificación

3. **Disclaimer de salud** (visible en la app):
   - Recomendación de consultar médico antes de entrenar
   - La app no diagnostica ni prescribe
   - El usuario es responsable de evaluar su capacidad física

### Recomendaciones de implementación

**Antes de la difusión pública**:
- [ ] Redactar y publicar Aviso de Privacidad (página /privacidad)
- [ ] Redactar y publicar Términos y Condiciones (página /terminos)
- [ ] Agregar checkbox de aceptación en el signup
- [ ] Agregar disclaimer de salud visible en el onboarding
- [ ] Verificar región del servidor de Supabase

**Antes de monetizar**:
- [ ] Consultar con abogado especializado en tech/privacidad
- [ ] Implementar mecanismo de derechos ARCO
- [ ] Política de retención y eliminación de datos
- [ ] Facturación electrónica (si es en México)
- [ ] Términos de suscripción

---

## 14. Identidad de Marca

### Estado actual

- **Nombre**: Forgia (del repositorio `forgia`)
- **Dominio**: Por definir
- **Slogan implícito**: "Tu entrenador de CrossFit potenciado por IA" (usado en landing)
- **Tono**: Motivacional pero técnico, accesible, en español

### Paleta de colores de marca

| Uso | Color | Hex | Tailwind |
|-----|-------|-----|----------|
| Primario / CTAs | Rojo | #ef4444 | `red-500` |
| Fondo claro | Blanco | #ffffff | `white` |
| Fondo oscuro | Negro profundo | #0a0a0a | `neutral-950` |
| Texto principal | Casi negro | #171717 | `neutral-900` |
| Texto secundario | Gris medio | #737373 | `neutral-500` |
| Calentamiento | Ámbar | #f59e0b | `amber-500` |
| Fuerza | Azul | #3b82f6 | `blue-500` |
| Metcon | Rojo | #ef4444 | `red-500` |
| Recovery | Esmeralda | #10b981 | `emerald-500` |

### Tipografía

- **Principal**: Geist Sans (moderna, limpia, variable weight)
- **Monoespaciada**: Geist Mono (para timers, datos numéricos)
- Ambas de Vercel, optimizadas para web

### Elementos de marca por crear

1. **Logo**: Isotipo + logotipo. El nombre "Forgia" (del italiano "forjar") evoca transformación, fuerza, creación. Conceptos visuales: yunque, fuego, movimiento, forma geométrica fuerte.

2. **Favicon**: Versión simplificada del isotipo, legible a 16×16px.

3. **App icon**: Para instalación PWA en móvil. 192×192 y 512×512.

4. **OG Image**: Imagen para previews en redes sociales. 1200×630px con logo, slogan, y visual de la app.

5. **Social sharing template**: Plantilla para compartir WODs como imagen en Instagram Stories (1080×1920).

### Tono de comunicación

- **Motivacional pero no exagerado**: Inspirar sin caer en clichés fitness
- **Técnico pero accesible**: Usar terminología de CrossFit correcta pero explicar cuando es necesario
- **Directo**: Mensajes cortos y claros, sin relleno
- **Inclusivo**: Para todos los niveles (principiante a avanzado)
- **Idioma**: Español como idioma principal, con terminología CrossFit en inglés donde es estándar (WOD, AMRAP, EMOM, Rx/Scaled)

---

## 15. Milestones de Comercialización

### Fase Alpha (actual → primeras semanas)

**Objetivo**: Validar el producto con usuarios reales cercanos.

- Compartir con amigos y comunidad CrossFit cercana
- Recopilar feedback cualitativo (conversaciones, no encuestas)
- Priorizar bugs y UX issues que aparezcan
- Medir:
  - ¿Cuántos se registran?
  - ¿Cuántos completan el onboarding?
  - ¿Cuántos generan más de 1 WOD?
  - ¿Cuántos regresan al día siguiente?

**Entregables antes de compartir**:
- [x] Aviso de privacidad (mínimo viable)
- [x] Disclaimer de salud
- [x] Dominio propio (forgia.fit, getforgia.com — revisar disponibilidad)
- [x] Deploy en Vercel con dominio personalizado Deploy en Vercel con dominio personalizado

### Fase Beta (50-100 usuarios)

**Objetivo**: Validar product-market fit y entender segmentos de usuario.

- Agregar analytics básico (Vercel Analytics, Plausible, o PostHog)
- Implementar canal de feedback in-app (botón "Enviar sugerencia")
- Identificar patrones:
  - ¿Más atletas individuales o coaches?
  - ¿Qué nivel de experiencia predomina?
  - ¿Qué features usan más? ¿Cuáles ignoran?
  - ¿Cuál es la retención a 7 días? ¿Y a 30?
- Iterar basado en datos, no suposiciones

**Métricas clave**:
- Tasa de conversión signup → onboarding completado
- WODs generados por usuario por semana
- Tasa de feedback (% de WODs con resultado registrado)
- Retención D1, D7, D30 (porcentaje de usuarios que regresan)

### Lanzamiento Público

**Objetivo**: Adquisición de usuarios a escala.

- Landing page mejorada con testimonios y screenshots
- SEO básico (meta tags, contenido, sitemap)
- Presencia en redes sociales (Instagram, TikTok para fitness)
- Product Hunt launch (opcional, para audiencia tech)
- Colaboraciones con influencers/boxes de CrossFit locales

### Monetización

**Trigger sugerido**: Cuando haya ~500 usuarios activos semanales con buena retención (>30% D30).

No monetizar demasiado temprano — primero lograr que el producto sea indispensable para los usuarios. La monetización prematura mata más startups que la falta de monetización.

**Modelo recomendado**: Freemium
- Free: funcionalidad actual con Gemini Flash, con límites razonables
- Premium: modelos de IA superiores, límites expandidos, features exclusivas

**Métricas para saber que estás listo**:
- ≥500 usuarios activos semanales
- ≥30% retención a 30 días
- Usuarios piden features que justifican un tier premium
- El costo de Gemini API es significativo → justifica ingresos

---

## Apéndice: Variables de Entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

# Google Gemini
GEMINI_API_KEY=[api-key]
```

---

*Este documento fue generado a partir de un análisis exhaustivo del codebase del proyecto Forgia. Toda la información técnica refleja el estado real del código al 6 de febrero de 2026.*
