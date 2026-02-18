---
name: updating-message
description: Genera mensajes de actualización para redes sociales y email cuando hay nuevas funcionalidades en Forgia. Usa este skill después de implementar features importantes.
---

# Generador de Mensajes de Actualización — Forgia

Generas mensajes de comunicación profesionales y atractivos para anunciar nuevas funcionalidades de **Forgia** (app de entrenamiento CrossFit con IA).

## Contexto del Producto

- **App**: Forgia (forgia.fit)
- **Audiencia**: Atletas de CrossFit de todos los niveles (Novato a Avanzado)
- **Idioma**: Todo en español
- **Tono**: Motivacional, directo, cercano pero profesional
- **URL principal**: forgia.fit
- **URL app**: forgia.fit/app

## Pasos

1. Lee `docs/UPDATE_MESSAGE_FEB_10.md` y `docs/UPDATE_MESSAGE_FEB_11.md` como referencia de formato y tono
2. Busca los cambios recientes con `git log` o lee los archivos relevantes para entender qué se implementó
3. Si `$ARGUMENTS` tiene descripción, úsala como base. Si no, investiga los cambios recientes en el código
4. Genera TODOS los formatos de mensaje listados abajo
5. Guarda el resultado en `docs/UPDATE_MESSAGE_[FECHA].md` (formato: `FEB_11`, `MAR_05`, etc.)

## Formatos Requeridos

### 1. 📱 Mensaje Corto (Instagram/Twitter)

- Máximo 280 caracteres para Twitter
- Emojis como acentos visuales (no excesivos)
- Hashtags: #Forgia #CrossFit #TrainingAI
- CTA: "Pruébalo → forgia.fit"

### 2. 📧 Email a Usuarios Registrados

- **Asunto**: < 60 caracteres, gancho claro
- **Cuerpo**:
  - Saludo personalizado con `[Nombre]`
  - Cada feature con emoji + título en bold + 3-4 bullets de beneficio
  - Separador `---` antes del CTA
  - CTA con link directo a la sección relevante
  - Cierre motivacional
  - Firma: "El equipo de Forgia"

### 3. 🗣️ Mensaje para WhatsApp/Telegram

- Formato con asteriscos para bold (`*texto*`)
- Lista con ✅ para cada feature
- Tono casual, como hablando con el equipo del box
- CTA: "Pruébenlo → forgia.fit"

### 4. 📊 Mensaje para LinkedIn

- Tono profesional y técnico (sin ser aburrido)
- Enfoque en decisiones de producto y diseño
- Sin emojis excesivos, usar 🔹 para bullets
- Hashtags profesionales: #ProductDevelopment #CrossFit #AI #Fitness

### 5. 🎯 Puntos Clave

- **LO QUE LES IMPORTA**: 4-6 puntos desde la perspectiva del usuario
- **LO QUE NO LES IMPORTA**: Lo técnico que NO hay que mencionar (migrations, APIs, componentes internos, etc.)

### 6. 📅 Timing Sugerido

- Orden de publicación recomendado por canal

### 7. 🎨 Assets Recomendados

- Screenshots o GIFs sugeridos para acompañar los posts

## Reglas de Tono

**SÍ:**

- Beneficios concretos ("ahora puedes X")
- Lenguaje de acción ("pruébalo", "entra", "configura")
- Emojis con propósito (🔥 para algo nuevo, ✅ para features, 💪 para motivación)
- Referencias al mundo CrossFit (box, WOD, benchmark, Rx)

**NO:**

- Jerga técnica (API, base de datos, componentes, migrations)
- Superlativos vacíos ("increíble", "revolucionario")
- Mencionar herramientas internas (Gemini, Supabase, Next.js)
- Más de 3-4 emojis seguidos
