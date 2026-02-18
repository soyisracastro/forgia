# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Forgia** ("forjar" in Italian) is a CrossFit AI coaching app at forgia.fit. It generates personalized WODs (Workout of the Day) using Google Gemini, tracks performance, manages periodization, and provides training intelligence. All user-facing text is in **Spanish** (es_MX locale).

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server at localhost:3000
pnpm build            # Production build
pnpm lint             # ESLint check
```

No test framework is configured.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...                # Server-side only
NEXT_PUBLIC_GA_ID=...             # Optional, GA4
```

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** via PostCSS (no tailwind.config — uses CSS-based config in `globals.css`)
- **Supabase** for PostgreSQL database + auth (email/password)
- **Google Gemini** (`@google/genai`) for AI workout generation — server-side only
- **pnpm** as package manager
- Path alias: `@/*` maps to `./src/*`

## Architecture

### Routing & Auth

- `/app/*` routes are **protected** via `src/middleware.ts` (redirects to `/login` if unauthenticated)
- `/login` redirects to `/app` if already authenticated
- OAuth callback at `/auth/callback`
- `AuthContext` provides client-side user/profile state
- `OnboardingGuard` wraps protected pages, redirecting new users to `/app/onboarding`

### Data Flow

- **Client components** call `src/lib/gemini.ts` helper functions (thin fetch wrappers)
- These hit **API routes** at `src/app/api/*` which use the Supabase server client and Gemini
- Gemini API key is never exposed to the client — all AI calls happen server-side
- Supabase clients: `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (API routes/middleware)

### Key API Routes

| Route | Purpose |
|-------|---------|
| `POST /api/generate-wod` | Generate a personalized WOD with periodization context |
| `POST /api/generate-program` | Generate a 4-week training program |
| `GET /api/weekly-analysis` | Weekly performance summary |
| `GET /api/training-intelligence` | ML-driven training insights |
| `POST /api/assessments` | Start a benchmark level assessment |
| `POST /api/assessments/[id]/complete` | Complete an assessment |

### State Management

- **React Context** only: `AuthContext` (user/profile) and `ThemeContext` (dark/light with localStorage)
- No Redux, Zustand, or other state library — local `useState` for component state

### Database (Supabase)

Direct Supabase JS client queries (no ORM). Key tables: `profiles`, `wods`, `workout_feedback`, `training_programs`, `personal_records`, `level_assessments`, `template_results`. SQL migrations are gitignored.

### Key Business Logic

- `src/lib/periodization.ts` — 28-day rolling analysis to avoid repeating stimuli
- `src/lib/assessment-benchmarks.ts` — Benchmark definitions for level testing
- `src/lib/rm-calculator.ts` — 1RM estimation formulas
- `src/lib/wod-templates.ts` — Pre-built WOD template library
- `src/lib/analytics.ts` — GA4 custom event tracking

### Live Workout Mode

Components in `src/components/live/` provide a full-screen timer overlay with audio cues (`useAudioCues`), wake lock (`useWakeLock`), and section-by-section progression. Supports AMRAP, EMOM, For Time, and Tabata formats.

## Conventions

- **Spanish UI**: All user-facing strings, error messages, and Supabase auth error translations are in Spanish
- **CrossFit terminology** stays in English where standard (WOD, AMRAP, EMOM, Rx, Scaled, 1RM, PR, Metcon)
- **Brand color**: Red-500 `#EF4444` is the primary accent; gradient is `#EF4444 → #F97316`
- **WOD section colors**: warmUp=amber, strengthSkill=blue, metcon=red, coolDown=emerald
- **Fonts**: Geist Sans (UI) and Geist Mono (timers/numbers), loaded via `next/font/google`
- **Icons**: Lucide React exclusively
- Client components use `'use client'` directive
- Brand guidelines are in `docs/BRAND_GUIDELINES.md`
