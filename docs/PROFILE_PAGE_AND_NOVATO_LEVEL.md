# Página de Perfil + Nivel "Novato"

> Documento de implementación — Febrero 2026

---

## Resumen

Se implementaron dos funcionalidades principales:

1. **Página de Perfil** (`/app/perfil`): Permite al usuario ver su información de cuenta y modificar toda la configuración de entrenamiento sin volver a pasar por el onboarding.

2. **Nivel "Novato"**: Nuevo nivel de experiencia para personas que nunca han hecho CrossFit ni entrenamiento funcional. Se ubica antes de "Principiante" en la escala.

---

## Migración SQL — Supabase

**Ejecutar ANTES de desplegar los cambios de código.**

```sql
-- 1. Encontrar el nombre exacto del constraint actual
SELECT conname
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%experience_level%';

-- 2. Eliminar el constraint existente (usar el nombre obtenido en paso 1)
ALTER TABLE profiles DROP CONSTRAINT chk_experience_level;

-- 3. Recrear con 'Novato' incluido
ALTER TABLE profiles ADD CONSTRAINT chk_experience_level
  CHECK (experience_level IS NULL OR experience_level IN ('Novato', 'Principiante', 'Intermedio', 'Avanzado'));
```

**Nota:** El nombre del constraint puede variar (`chk_experience_level`, `profiles_experience_level_check`, etc.). Usar el paso 1 para verificar.

---

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/lib/training-constants.ts` | Constantes compartidas entre onboarding y perfil (niveles, objetivos, incompatibilidades, tipos de entrenamiento, opciones de equipamiento) |
| `src/lib/profiles.ts` | Función `updateProfile()` para actualizar el perfil del usuario en Supabase |
| `src/app/app/perfil/page.tsx` | Página de perfil con secciones de cuenta y configuración de entrenamiento |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/types/profile.ts` | Agregado `'Novato'` al tipo `ExperienceLevel` |
| `src/app/api/generate-wod/route.ts` | Agregado caso `'Novato'` en `buildLevelDirectives()` |
| `src/components/AppHeader.tsx` | Agregado link "Perfil" en navegación + nombre de usuario es link clickeable |
| `src/components/onboarding/Step1BasicInfo.tsx` | Refactorizado para importar `EXPERIENCE_LEVELS` de constantes compartidas |
| `src/components/onboarding/Step2Objectives.tsx` | Refactorizado para importar `OBJECTIVES` e `INCOMPATIBLE_OBJECTIVES` |
| `src/components/onboarding/Step3TrainingType.tsx` | Refactorizado para importar `TRAINING_OPTIONS` |
| `src/components/onboarding/Step4Equipment.tsx` | Refactorizado para importar opciones de equipamiento |

---

## Nivel "Novato" — Detalle

### Descripción
"Nunca he hecho CrossFit ni entrenamiento funcional"

### Diferencia con Principiante

| Aspecto | Novato | Principiante |
|---------|--------|-------------|
| Movimientos | Solo peso corporal universalmente conocidos | Fundamentales con equipamiento básico |
| Terminología | Sin jerga de CrossFit; explica cada movimiento | Asume familiaridad con términos básicos |
| Equipamiento | Cero peso externo | Mancuernas/kettlebells ligeras |
| Duración metcon | 5-8 min | 8-15 min |
| Repeticiones | 5-8 por movimiento | 8-12 por movimiento |
| Descanso | 30-60s entre ejercicios | No especificado explícitamente |
| Descripción de movimientos | Obligatoria para cada movimiento | No requerida |

### Directivas para Gemini

El prompt de Novato instruye a Gemini a:
- Usar SOLO movimientos que cualquier persona conoce (sentadillas, lagartijas, zancadas, plancha, jumping jacks)
- Incluir descripción de ejecución correcta para cada movimiento
- No usar terminología CrossFit sin explicarla
- Priorizar la confianza del atleta
- Calentamiento especialmente detallado y gradual

---

## Página de Perfil — Estructura

### Sección A: Información de Cuenta
- Email (solo lectura)
- Nombre (editable)
- Miembro desde (solo lectura, fecha formateada)
- Términos aceptados (solo lectura, fecha formateada)

### Sección B: Configuración de Entrenamiento
- Edad (13-120)
- Nivel de experiencia (4 niveles: Novato → Principiante → Intermedio → Avanzado)
- Historial de lesiones (opcional)
- Objetivos (1-2, con lógica de incompatibilidad)
- Tipo de entrenamiento (CrossFit/Calistenia)
- Equipamiento (dinámico según tipo de entrenamiento)

### Sección C: Zona de Peligro
- Placeholder para futuras acciones destructivas (eliminar cuenta)

### Comportamiento
- Pre-llena todos los campos desde el perfil actual
- Detecta cambios (dirty checking) para habilitar/deshabilitar el botón de guardar
- Resetea equipamiento al cambiar tipo de entrenamiento
- Muestra mensaje de éxito por 3 segundos después de guardar
- Llama `refreshProfile()` para actualizar el contexto de auth tras guardar
