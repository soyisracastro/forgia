# Generador de WOD con IA 🏋️‍♂️🔥

¡Bienvenido al **Generador de WOD del Día**! Esta aplicación está diseñada para los entusiastas del fitness y atletas de CrossFit que buscan un entrenamiento desafiante, variado y totalmente personalizado cada día.

Ya no tienes que pasar tiempo pensando qué hacer en el gimnasio o en casa. Nuestra inteligencia artificial se encarga de diseñar una rutina completa para ti en segundos.

### 🤖 El cerebro detrás del proyecto

Este generador utiliza el modelo **Gemini 2.0 Flash** de Google (configurado como `gemini-3-flash-preview` en el backend) para actuar como un coach experto de CrossFit (Nivel 4). La IA comprende la ciencia detrás de la programación de entrenamientos, asegurando que cada sesión sea equilibrada, segura y efectiva.

### ✨ Características principales

- **Personalización Total:** Filtra tus entrenamientos por ubicación (Box o Casa), equipamiento disponible (Cualquiera o Peso Corporal) y nivel de habilidad (Principiante, Intermedio, Avanzado).
- **Adaptación por Lesiones:** ¿Tienes alguna molestia o lesión? Solo indícalo y la IA adaptará los movimientos para que puedas entrenar de forma segura.
- **Estructura Profesional:** Cada WOD incluye Calentamiento, Fuerza/Habilidad, Metcon (AMRAP, For Time, EMOM, etc.) y Enfriamiento/Movilidad.
- **Historial Local:** Guarda tus WODs favoritos y consulta tu historial de entrenamientos generados.
- **Modo Oscuro/Claro:** Interfaz moderna y minimalista que se adapta a tus preferencias visuales.

---

## 🛠️ Detalles Técnicos

Este es un proyecto construido con las tecnologías más modernas de desarrollo web:

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS 4.0](https://tailwindcss.com/)
- **IA:** [Google Generative AI SDK](https://github.com/google/generative-ai-js)
- **Base de Datos/Auth:** Preparado para [Supabase](https://supabase.com/)
- **Iconos:** Lucide-react (o SVG components personalizados)

### 🚀 Configuración para Desarrollo

Sigue estos pasos para ejecutar el proyecto localmente:

1. **Clonar el repositorio:**

   ```bash
   git clone <url-del-repositorio>
   cd wod-generator-next
   ```

2. **Instalar dependencias:**

   ```bash
   pnpm install
   # o npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto y añade tu API Key de Google Gemini:

   ```env
   GEMINI_API_KEY=tu_api_key_aqui
   ```

4. **Ejecutar el servidor de desarrollo:**

   ```bash
   pnpm dev
   # o npm run dev
   ```

5. **Abrir la aplicación:**
   Navega a [http://localhost:3000](http://localhost:3000) en tu navegador.

### 📦 Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Crea la versión de producción de la aplicación.
- `npm run start`: Inicia el servidor de producción.
- `npm run lint`: Ejecuta el linter para encontrar errores en el código.

---

**Disclaimer:** Recuerda siempre calentar adecuadamente y escalar los movimientos según tu capacidad física. Este generador es una herramienta de apoyo y no sustituye el consejo de un profesional de la salud o un coach presencial.
