# Forgia

**Tu entrenador de CrossFit con IA personalizada** — [forgia.fit](https://forgia.fit)

Forgia genera entrenamientos (WODs) personalizados usando inteligencia artificial. No es un generador aleatorio: analiza tu historial de entrenamiento, nivel, equipamiento, lesiones y records personales para diseñar sesiones inteligentes con periodización real.

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Lenguaje | TypeScript 5 |
| UI | React 19 + [Tailwind CSS 4](https://tailwindcss.com/) |
| Base de datos | [Supabase](https://supabase.com/) (PostgreSQL) |
| Autenticación | Supabase Auth (email/password) |
| IA | [Google Gemini](https://ai.google.dev/) via `@google/genai` |
| Analytics | Google Analytics 4 |
| Package manager | pnpm |

Sin dependencias pesadas de estado (no Redux, no Zustand). Solo React Context para auth y tema.

---

## Funcionalidades

### Generación de WODs con IA

El core de la app. Cada WOD se genera con un prompt que incluye:

- **Perfil del usuario**: nivel (Novato → Avanzado), edad, objetivos, equipamiento, lesiones
- **Periodización** (últimos 28 días): balance de dominios (halterofilia / gimnásticos / monostructural), rotación de fuerza, detección de sobreentrenamiento
- **Feedback reciente**: dificultad promedio de las últimas 5 sesiones para auto-escalar intensidad
- **Programa activo**: si hay un mesociclo de 4 semanas, el WOD se ajusta al tipo de sesión, intensidad y foco de la semana
- **Records personales**: prescribe cargas como porcentajes de tu 1RM real
- **Notas de sesión**: el usuario puede escribir instrucciones libres ("hoy enfócate en gimnásticos, tengo 45 min")

La respuesta de Gemini es JSON estructurado: calentamiento, fuerza/skill, metcon y vuelta a la calma.

### Modo en vivo

Timer full-screen para ejecutar el WOD con:

- Modos automáticos según tipo de metcon: AMRAP (cuenta regresiva), EMOM (rondas por minuto), Tabata (work/rest), For Time (cronómetro)
- Cuenta regresiva 3-2-1 GO antes de iniciar
- Audio cues en transiciones y últimos segundos
- Wake lock para mantener la pantalla encendida
- Recuperación de sesión automática (guarda estado en sessionStorage cada 5s)
- Resumen final con tiempos por sección

### Programa mensual

Genera un mesociclo de 4 semanas con sesiones progresivas. Cada sesión define tipo (fuerza, hipertrofia, potencia, etc.), intensidad y foco técnico. Los WODs generados se alinean al programa activo.

### Records personales

Registro de PRs por movimiento con soporte para 1RM, 3RM, 5RM, max reps y tiempo. Incluye calculadora de 1RM estimado a partir de series submáximas. Se integra con la generación de WODs para prescribir cargas reales.

### Biblioteca de templates

Colección de WODs clásicos de CrossFit (Girls, Heroes, Benchmarks) con tracking de mejores resultados por template.

### Historial

Vista de lista y calendario con todos los WODs guardados y su feedback (dificultad, Rx/Scaled, tiempo, notas).

### Sistema de periodización

Motor de análisis que corre sobre los últimos 28 días:

- **Balance de dominios**: detecta si se sobreutiliza un dominio (>40%) o se descuida otro (<15%)
- **Carga semanal**: compara volumen e intensidad semana vs semana, detecta tendencias
- **Rotación de fuerza**: evita repetir el mismo movimiento 3+ veces en 14 días
- **Detección de deload**: señala si hay 3+ sesiones consecutivas con dificultad 8+/10

Todo se convierte en directivas de texto natural que se inyectan al prompt de Gemini.

---

## Arquitectura

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (server-side, aquí vive la lógica de Gemini)
│   │   ├── generate-wod/       # Generación de WOD con todo el contexto
│   │   ├── generate-program/   # Generación de programa mensual
│   │   ├── weekly-analysis/    # Análisis semanal
│   │   └── training-intelligence/  # Insights de rendimiento
│   ├── app/                # Rutas protegidas (requieren auth)
│   │   ├── biblioteca/         # Templates clásicos
│   │   ├── historia/           # Historial de WODs
│   │   ├── onboarding/         # Wizard de configuración inicial
│   │   ├── perfil/             # Edición de perfil
│   │   ├── programa/           # Programa mensual
│   │   ├── records/            # Records personales
│   │   └── cuenta/             # Configuración de cuenta
│   ├── login/              # Auth (login + registro)
│   └── auth/callback/      # OAuth redirect
├── components/
│   ├── live/               # Timer y overlay del modo en vivo
│   ├── onboarding/         # Wizard multi-step
│   ├── templates/          # Cards y forms de la biblioteca
│   └── ui/                 # Componentes reutilizables
├── contexts/               # AuthContext + ThemeContext
├── hooks/                  # useTimer, useAudioCues, useWakeLock
├── lib/
│   ├── supabase/           # Clientes browser y server
│   ├── gemini.ts           # Wrappers de fetch a los API routes
│   ├── periodization.ts    # Análisis de 28 días + clasificación de movimientos
│   ├── personal-records.ts # CRUD de records
│   ├── rm-calculator.ts    # Fórmulas de estimación de 1RM
│   └── analytics.ts        # Eventos custom de GA4
├── types/                  # Interfaces TypeScript
└── middleware.ts           # Protección de rutas /app/*
```

**Flujo de datos**: componentes cliente → fetch a `/api/*` → API routes usan Supabase server client + Gemini → respuesta JSON. La API key de Gemini nunca se expone al cliente.

**Auth**: middleware protege `/app/*` (redirige a `/login` sin sesión). `OnboardingGuard` redirige usuarios nuevos al wizard.

---

## Desarrollo local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

Variables requeridas en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
GEMINI_API_KEY=tu-api-key
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # opcional
```

```bash
# 3. Iniciar servidor de desarrollo
pnpm dev
```

La app corre en [http://localhost:3000](http://localhost:3000).

### Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm lint` | ESLint |

---

## Decisiones de diseño

- **Sin ORM**: queries directas con el cliente de Supabase (`select`, `insert`, `upsert`). Suficiente para la complejidad actual.
- **Sin state management externo**: React Context para auth y tema, `useState` local para lo demás. La app es principalmente server-driven.
- **Tailwind CSS 4**: configuración basada en CSS (`globals.css`), no en `tailwind.config`.
- **PWA**: installable en móvil via `manifest.json` y service worker.
- **Idioma**: todo el UI en español. Terminología de CrossFit se mantiene en inglés donde es estándar (WOD, AMRAP, EMOM, Rx, Metcon, 1RM).
