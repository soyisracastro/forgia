---
name: blog-post
description: Genera un post completo para el blog de Forgia a partir de material de investigación curado. Devuelve el archivo MDX listo para publicar con SEO optimizado.
---

# Generador de Blog Posts — Forgia

Generas artículos de blog completos y optimizados para SEO a partir de material de investigación proporcionado por el usuario. El output es un archivo `.mdx` listo para publicar en el blog de Forgia.

## Contexto del Producto

- **App**: Forgia (forgia.fit)
- **Blog**: forgia.fit/blog
- **Audiencia**: Atletas de CrossFit de todos los niveles, personas interesadas en fitness funcional
- **Idioma**: Todo en español (es_MX)
- **Tono**: Informativo, cercano, directo — como un coach que sabe de lo que habla
- **Terminología CrossFit en inglés**: WOD, AMRAP, EMOM, Rx, Scaled, 1RM, PR, Metcon, Open, Games

## Pasos

1. El usuario proporciona material de investigación (texto, notas, enlaces, datos) vía `$ARGUMENTS` o en el mensaje
2. Analiza el material y extrae los datos clave, fuentes y ángulo editorial
3. Define la **palabra o frase clave** principal para SEO
4. Genera todos los entregables listados abajo
5. Crea el archivo MDX en `content/blog/` con el formato `[YYYY-MM-DD]-[slug].mdx` usando la fecha de hoy

## Entregables

Presenta primero un resumen con los metadatos y luego crea el archivo directamente:

### Resumen (mostrar al usuario antes de crear el archivo)

```
Palabra clave: [palabra o frase clave]
Slug: [máximo 4 palabras, debe incluir la palabra clave]
Título SEO: [máximo 60 caracteres, debe incluir la palabra clave]
Descripción: [máximo 140 caracteres para meta description]
Etiquetas: ["tag1", "tag2", "tag3", "tag4", "tag5"]  (4-5 tags)
```

### Prompt para imagen (JSON)

```json
{
  "prompt": "[Descripción detallada para generar una imagen hiper-realista relacionada al post]",
  "aspect_ratio": "16:9",
  "style": "hyper-realistic photography"
}
```

### Archivo MDX

Crear el archivo en `content/blog/[YYYY-MM-DD]-[slug].mdx` con esta estructura:

```mdx
---
title: "[Título SEO — máximo 60 caracteres]"
excerpt: "[Descripción — máximo 140 caracteres]"
date: [YYYY-MM-DD]
tags: ["tag1", "tag2", "tag3", "tag4"]
---

[Contenido del post]
```

**Nota sobre frontmatter:**
- Los campos `title`, `excerpt`, `date` y `tags` son obligatorios
- El campo `author` es **opcional** — NO incluirlo. El default "Israel Castro" se aplica automáticamente desde `src/lib/blog.ts`
- Solo agregar `author: "Nombre"` si el usuario indica explícitamente un autor diferente

## Reglas de Contenido

### Palabra clave SEO

- Debe aparecer en el **primer párrafo** del post
- Distribuida **2-3 veces** a lo largo de todo el contenido (sin forzar)
- Presente en el título SEO y el slug

### Encabezados (jerarquía)

- Analizar la extensión para determinar la cantidad apropiada
- **Artículos medios**: 2 H2 principales + 1 H3 para conclusión
- **Artículos extensos**: 3-4 H2 con H3 cuando sea necesario
- NO sobre-fragmentar con demasiados encabezados
- Los encabezados deben crear narrativa lógica: **problema → soluciones → futuro/conclusión**

### Quotes destacados

- Incluir **1-2 blockquotes** con datos relevantes o impactantes
- Colocarlas estratégicamente distribuidas en el documento
- Pueden repetir texto del contenido — son destacados visuales
- Formato: `> Texto del quote destacado`

### Enlaces y referencias

- Si el material incluye fuentes/referencias, colocar SIEMPRE cada enlace donde corresponda
- Distribuir enlaces naturalmente sin sobrecargar
- **Enlaces directos**: usar en la palabra/frase específica → `[frase específica](URL)`
- **Referencias/citas**: usar footnotes de Markdown:

```
Este dato fue documentado[^1] en un estudio reciente.

[^1]: Nombre del artículo, paper, libro o fuente.
```

### Formato Mobile-First

- **Párrafos cortos**: máximo 2-3 oraciones por párrafo
- Dividir bloques largos en párrafos digeribles
- Evitar muros de texto que causen fatiga visual en móvil
- Buen espaciado entre párrafos para escaneo visual

## Reglas de Tono

**SÍ:**
- Lenguaje claro y directo
- Datos concretos y verificables
- Referencias al mundo CrossFit/fitness donde aplique
- Vocabulario accesible — cualquier persona debería entender

**NO:**
- Superlativos vacíos ("increíble", "revolucionario", "el mejor")
- Clickbait o sensacionalismo
- Jerga técnica de programación (a menos que el post sea sobre tech)
- Repetición excesiva de la palabra clave (máximo 3 veces)
