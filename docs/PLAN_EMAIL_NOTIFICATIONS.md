# Sistema de Notificaciones por Email

## Estado Actual

**Implementado:**
- `src/lib/email.ts` — Helper de envío SMTP vía Amazon SES
- `src/lib/admin.ts` — Admin guard (verificación por email)
- `scripts/send-notification.ts` — Script CLI para envío masivo
- Sistema de roles (`role` column en profiles)

**Pendiente (futuro):**
- API route `POST /api/admin/send-notification` para envío desde la app
- UI de admin para enviar notificaciones desde el navegador
- Emails automáticos (bienvenida, resumen semanal)

---

## Configuracion Requerida

### Variables de entorno (`.env.local`)

```env
# Amazon SES SMTP (credenciales de SES → SMTP settings)
SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SES_SMTP_PORT=587
SES_SMTP_USER=AKIA...
SES_SMTP_PASS=...
EMAIL_FROM=Forgia <hola@forgia.fit>

# Admin
ADMIN_EMAILS=israel.castro@gmail.com

# Supabase service role (Dashboard → Settings → API → service_role)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Uso del Script de Envio

### Sintaxis

```bash
npx tsx scripts/send-notification.ts [opciones]
```

### Opciones

| Flag | Descripcion | Valores | Default |
|------|-------------|---------|---------|
| `--target` | Grupo de destinatarios (se ignora si se usa `--csv`) | `all`, `onboarded`, `not_onboarded` | `all` |
| `--csv` | Ruta a archivo CSV con emails filtrados | Ruta relativa | — |
| `--subject` | Asunto del email | Texto entre comillas | *requerido* |
| `--html` | Ruta al archivo HTML del email | Ruta relativa | *requerido* (excepto dry-run) |
| `--dry-run` | Solo muestra destinatarios, no envia | — | `false` |
| `--exclude` | Emails a excluir, separados por coma | `email1,email2` | — |

### Dos modos de uso

**Modo 1: Por grupo predefinido (`--target`)**
Consulta la base de datos directamente y filtra por estado de onboarding.

**Modo 2: Por CSV (`--csv`)**
Lee una lista de emails de un archivo CSV. Ideal para filtros avanzados: ejecutas una query SQL, exportas a CSV, y pasas ese archivo al script. Si usas `--csv`, el flag `--target` se ignora.

El CSV debe tener al menos una columna `email`. La columna `display_name` es opcional:
```csv
email,display_name
juanparedescuero@gmail.com,Juan
dianavictoria1180@gmail.com,Diana
mauglez@hotmail.com,
```

### Ejemplos

```bash
# === Modo --target (consulta directa a Supabase) ===

# Ver todos los destinatarios sin enviar nada
npx tsx scripts/send-notification.ts --target all --subject "Test" --dry-run

# Enviar a TODOS los usuarios
npx tsx scripts/send-notification.ts --target all --subject "Novedades en Forgia" --html emails/notification.html

# Solo a quienes NO completaron onboarding (re-engagement)
npx tsx scripts/send-notification.ts --target not_onboarded --subject "Ya puedes acceder a Forgia" --html emails/reengagement.html

# Solo a quienes SI completaron onboarding (update de features)
npx tsx scripts/send-notification.ts --target onboarded --subject "Nuevas funcionalidades" --html emails/features.html

# Enviar a todos excepto tu propio email
npx tsx scripts/send-notification.ts --target all --subject "Update" --html emails/update.html --exclude israel.castro@gmail.com

# Excluir cuentas de prueba
npx tsx scripts/send-notification.ts --target all --subject "Update" --html emails/update.html --exclude yomero@yomero.com,test@test.com

# === Modo --csv (lista filtrada desde SQL) ===

# Verificar destinatarios del CSV sin enviar
npx tsx scripts/send-notification.ts --csv emails/novatos_gym.csv --subject "Test" --dry-run

# Enviar a lista filtrada
npx tsx scripts/send-notification.ts --csv emails/novatos_gym.csv --subject "Tu primer WOD te espera" --html emails/novatos.html

# CSV + excluir emails especificos
npx tsx scripts/send-notification.ts --csv emails/hyrox_users.csv --subject "Nuevo contenido HYROX" --html emails/hyrox.html --exclude test@test.com
```

### Flujo completo con CSV (ejemplo practico)

```bash
# 1. Ejecuta una query SQL en Supabase SQL Editor o SQLTools
#    Ejemplo: novatos de gimnasio tradicional que no han generado WOD
#    (ver seccion "Consultas SQL" mas abajo)

# 2. Exporta el resultado a CSV (boton "Export" en Supabase, o COPY en psql)
#    Guarda como: emails/novatos_gym.csv

# 3. Verifica los destinatarios
npx tsx scripts/send-notification.ts --csv emails/novatos_gym.csv --subject "Test" --dry-run

# 4. Envia
npx tsx scripts/send-notification.ts --csv emails/novatos_gym.csv --subject "Tu primer WOD te espera" --html emails/novatos.html
```

### Template HTML

El archivo HTML soporta el placeholder `{{nombre}}` que se reemplaza automáticamente con el `display_name` de cada usuario (o "Atleta" si no tiene nombre).

Ejemplo minimo (`emails/notification.html`):

```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #EF4444; font-size: 28px; margin: 0;">Forgia</h1>
  </div>

  <p>Hola <strong>{{nombre}}</strong>,</p>

  <p><!-- Tu contenido aqui --></p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="https://forgia.fit" style="background: #EF4444; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Entrar a Forgia</a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
  <p style="color: #737373; font-size: 13px; text-align: center;">
    ¿Dudas? Responde a este correo. — El equipo de Forgia
  </p>
</div>
```

### Output del script

**Con `--target`:**
```
📋 Destinatarios (target: all): 15
────────────────────────────────────────────────────────────────
  📧 Carlos — cv1212712@gmail.com
  📧 Israel — israel.castro@gmail.com
  📧 juanparedescuero — juanparedescuero@gmail.com
  ...
────────────────────────────────────────────────────────────────

📧 Enviando "Novedades en Forgia" a 15 destinatarios...
   From: Forgia <hola@forgia.fit>

📊 Resultado:
   ✅ Enviados: 15
   ❌ Fallidos: 0
```

**Con `--csv`:**
```
📋 Destinatarios (csv: emails/novatos_gym.csv): 3
────────────────────────────────────────────────────────────────
  📧 Juan — juanparedescuero@gmail.com
  📧 Diana — dianavictoria1180@gmail.com
  📧 (sin nombre) — mauglez@hotmail.com
────────────────────────────────────────────────────────────────
```

**Con `--dry-run`:**
```
🔍 Modo dry-run: no se enviaron emails.
   Total: 3 destinatarios
```

---

## Consultas SQL para Segmentar Usuarios

Estas queries se pueden ejecutar desde **SQLTools en VS Code**, **Supabase SQL Editor**, o **psql** para obtener listas de emails segmentadas.

### Conexion a la base de datos

**Desde VS Code (SQLTools):**
1. Instalar extensiones: SQLTools + SQLTools PostgreSQL Driver
2. Cmd+Shift+P → "SQLTools: Add New Connection" → PostgreSQL
3. Pegar URI de conexion: Supabase Dashboard → Settings → Database → Connection string (URI)

**Desde terminal (psql):**
```bash
psql "postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

### Todos los usuarios

```sql
SELECT email, display_name, experience_level, equipment_level, onboarding_completed, created_at
FROM profiles
ORDER BY created_at;
```

### Por estado de onboarding

```sql
-- No completaron onboarding (abandonaron el registro)
SELECT email, display_name, created_at
FROM profiles
WHERE onboarding_completed = false
ORDER BY created_at;

-- Si completaron onboarding (usuarios activos)
SELECT email, display_name, experience_level, equipment_level
FROM profiles
WHERE onboarding_completed = true
ORDER BY created_at;
```

### Por nivel de experiencia

```sql
-- Novatos (nunca han hecho CrossFit)
SELECT email, display_name
FROM profiles
WHERE experience_level = 'Novato' AND onboarding_completed = true;

-- Principiantes
SELECT email, display_name
FROM profiles
WHERE experience_level = 'Principiante' AND onboarding_completed = true;

-- Intermedios
SELECT email, display_name
FROM profiles
WHERE experience_level = 'Intermedio' AND onboarding_completed = true;

-- Avanzados
SELECT email, display_name
FROM profiles
WHERE experience_level = 'Avanzado' AND onboarding_completed = true;
```

### Por equipamiento

```sql
-- Usuarios de gimnasio tradicional
SELECT email, display_name
FROM profiles
WHERE equipment_level = 'Gimnasio tradicional' AND onboarding_completed = true;

-- Usuarios de box completo
SELECT email, display_name
FROM profiles
WHERE equipment_level = 'Box completo' AND onboarding_completed = true;

-- Usuarios sin equipamiento especializado (peso corporal)
SELECT email, display_name
FROM profiles
WHERE equipment_level = 'Peso corporal + equipamiento mínimo' AND onboarding_completed = true;
```

### Por objetivo de entrenamiento

```sql
-- Usuarios preparando HYROX
SELECT email, display_name
FROM profiles
WHERE 'Preparación HYROX' = ANY(objectives) AND onboarding_completed = true;

-- Usuarios que quieren perder peso
SELECT email, display_name
FROM profiles
WHERE 'Perder peso' = ANY(objectives) AND onboarding_completed = true;

-- Usuarios enfocados en fuerza
SELECT email, display_name
FROM profiles
WHERE 'Ganar fuerza' = ANY(objectives) AND onboarding_completed = true;

-- Usuarios enfocados en competencia
SELECT email, display_name
FROM profiles
WHERE 'Preparación para competencia' = ANY(objectives) AND onboarding_completed = true;
```

### Por frecuencia de entrenamiento

```sql
-- Usuarios que entrenan 5+ dias (alto compromiso)
SELECT email, display_name, training_frequency
FROM profiles
WHERE training_frequency >= 5 AND onboarding_completed = true;

-- Usuarios que entrenan 2-3 dias (casuales)
SELECT email, display_name, training_frequency
FROM profiles
WHERE training_frequency <= 3 AND onboarding_completed = true;
```

### Por edad

```sql
-- Usuarios mayores de 40 (comunicacion sobre movilidad, cuidado articular)
SELECT email, display_name, age
FROM profiles
WHERE age >= 40 AND onboarding_completed = true;

-- Usuarios jovenes menores de 25
SELECT email, display_name, age
FROM profiles
WHERE age < 25 AND onboarding_completed = true;
```

### Por rol

```sql
-- Solo admins
SELECT email, display_name, role
FROM profiles
WHERE role = 'admin';

-- Solo usuarios normales
SELECT email, display_name
FROM profiles
WHERE role = 'user' AND onboarding_completed = true;
```

### Por actividad (usuarios con WODs generados)

```sql
-- Usuarios que han generado al menos un WOD (activos)
SELECT p.email, p.display_name, COUNT(w.id) as total_wods
FROM profiles p
JOIN wods w ON w.user_id = p.id
GROUP BY p.email, p.display_name
ORDER BY total_wods DESC;

-- Usuarios que completaron onboarding pero NUNCA generaron un WOD (inactivos)
SELECT p.email, p.display_name, p.created_at
FROM profiles p
LEFT JOIN wods w ON w.user_id = p.id
WHERE p.onboarding_completed = true AND w.id IS NULL;

-- Usuarios que no han generado WOD en los ultimos 14 dias (dormidos)
SELECT p.email, p.display_name, MAX(w.created_at) as ultimo_wod
FROM profiles p
JOIN wods w ON w.user_id = p.id
GROUP BY p.email, p.display_name
HAVING MAX(w.created_at) < NOW() - INTERVAL '14 days';

-- Usuarios activos en la ultima semana
SELECT p.email, p.display_name, COUNT(w.id) as wods_esta_semana
FROM profiles p
JOIN wods w ON w.user_id = p.id
WHERE w.created_at >= NOW() - INTERVAL '7 days'
GROUP BY p.email, p.display_name
ORDER BY wods_esta_semana DESC;
```

### Por feedback de entrenamientos

```sql
-- Usuarios que reportan WODs muy dificiles (promedio > 8/10)
SELECT p.email, p.display_name, AVG(f.difficulty_rating) as dificultad_promedio
FROM profiles p
JOIN workout_feedback f ON f.user_id = p.id
GROUP BY p.email, p.display_name
HAVING AVG(f.difficulty_rating) > 8;

-- Usuarios que siempre escalan (posibles candidatos a ajustar nivel)
SELECT p.email, p.display_name, p.experience_level,
       COUNT(*) FILTER (WHERE f.rx_or_scaled = 'Scaled') as scaled_count,
       COUNT(*) as total_feedback
FROM profiles p
JOIN workout_feedback f ON f.user_id = p.id
GROUP BY p.email, p.display_name, p.experience_level
HAVING COUNT(*) FILTER (WHERE f.rx_or_scaled = 'Scaled') > COUNT(*) / 2;
```

### Combinaciones utiles

```sql
-- Novatos de gimnasio tradicional que no han generado WOD (necesitan push)
SELECT p.email, p.display_name
FROM profiles p
LEFT JOIN wods w ON w.user_id = p.id
WHERE p.experience_level = 'Novato'
  AND p.equipment_level = 'Gimnasio tradicional'
  AND p.onboarding_completed = true
  AND w.id IS NULL;

-- Usuarios HYROX activos (para enviarles contenido especifico)
SELECT p.email, p.display_name, COUNT(w.id) as total_wods
FROM profiles p
JOIN wods w ON w.user_id = p.id
WHERE 'Preparación HYROX' = ANY(p.objectives)
GROUP BY p.email, p.display_name;

-- Resumen completo de cada usuario (dashboard manual)
SELECT
  email,
  display_name,
  experience_level,
  equipment_level,
  objectives,
  training_frequency,
  age,
  role,
  onboarding_completed,
  created_at
FROM profiles
ORDER BY created_at DESC;
```

### Exportar a CSV

Desde psql puedes exportar cualquier query a CSV:

```bash
psql "postgresql://..." -c "COPY (SELECT email, display_name FROM profiles WHERE onboarding_completed = false) TO STDOUT WITH CSV HEADER" > no_onboarded.csv
```

Desde Supabase SQL Editor: ejecuta la query y usa el boton "Export" → CSV.

---

## Casos de Uso por Tipo de Campaña

| Campaña | Modo | Comando |
|---------|------|---------|
| Bug fix / disculpa | `--target all` | `npx tsx scripts/send-notification.ts --target all --subject "..." --html emails/disculpa.html` |
| Nuevas features | `--target onboarded` | `npx tsx scripts/send-notification.ts --target onboarded --subject "..." --html emails/features.html` |
| Re-engagement | `--target not_onboarded` | `npx tsx scripts/send-notification.ts --target not_onboarded --subject "..." --html emails/reengagement.html` |
| Feature especifico (HYROX) | `--csv` | Query por objetivo → exportar CSV → `--csv hyrox_users.csv` |
| Novatos en gym tradicional | `--csv` | Query por nivel + equipo → exportar CSV → `--csv novatos_gym.csv` |
| Usuarios inactivos (14+ dias) | `--csv` | Query de "dormidos" → exportar CSV → `--csv dormidos.csv` |
| Usuarios que siempre escalan | `--csv` | Query de feedback → exportar CSV → `--csv escalan_siempre.csv` |
| Contenido por edad (40+) | `--csv` | Query por edad → exportar CSV → `--csv mayores_40.csv` |

**Flujo para campañas con `--target` (rapido):**
1. Crear el HTML del email en `emails/`
2. `npx tsx scripts/send-notification.ts --target [grupo] --subject "..." --html emails/[template].html`

**Flujo para campañas con `--csv` (filtro avanzado):**
1. Ejecutar la query SQL en Supabase SQL Editor o SQLTools
2. Exportar resultado a CSV (boton "Export" o `COPY ... TO STDOUT WITH CSV HEADER`)
3. Guardar CSV en `emails/` (ej: `emails/novatos_gym.csv`)
4. Crear el HTML del email en `emails/`
5. Verificar: `npx tsx scripts/send-notification.ts --csv emails/novatos_gym.csv --subject "..." --dry-run`
6. Enviar: `npx tsx scripts/send-notification.ts --csv emails/novatos_gym.csv --subject "..." --html emails/[template].html`

---

## Futuro: API Route para Envio desde la App

Documentado en detalle arriba (seccion "Esquema: API Route"). Se implementara cuando se necesite enviar notificaciones sin acceso a la terminal.

## Futuro: Emails Automaticos

| Email | Trigger | Prioridad |
|-------|---------|-----------|
| Bienvenida post-onboarding | Completar onboarding wizard | Media |
| Resumen semanal | Cron cada lunes 8am | Baja |
| Re-engagement automatico | 14 dias sin actividad | Baja |
| Recordatorio de evaluacion de nivel | 4+ semanas en mismo nivel | Baja |
