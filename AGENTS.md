# AGENTS.md - Protocolo y Sistema de Trabajo de Agentes para "Promundo Sistema"

Este documento establece las reglas operativas y metodológicas obligatorias que todos los agentes y subagentes deben cumplir al interactuar y desarrollar en este proyecto.

---

## 📋 REGLAS OPERATIVAS OBLIGATORIAS

### 1. Servidor de Desarrollo Permanente
- **Regla:** Siempre debe haber un servidor de desarrollo levantado (`npm run dev`) mientras se trabaje en este proyecto.
- **Acción:** Antes de iniciar cualquier tarea o módulo, verificar si el servidor está activo. Si no lo está, levantarlo inmediatamente en segundo plano (daemon).

### 2. Registro Continuo de Acciones (Handoff, Memoria & Archivo Histórico)
- **Regla:** Mantener siempre actualizadas las **últimas 10 acciones tomadas** en el archivo `MEMORY.md` y acumular **todas las acciones históricas sin excepción** en `MEMORY_ARCHIVE.md`, categorizadas estrictamente por fecha (`YYYY-MM-DD`) y marca de tiempo (`HH:MM`).
- **Acción:** Al completar una acción significativa (creación de módulo, refactor, migración, pruebas), agregar la acción bajo la sección de la fecha correspondiente en `MEMORY_ARCHIVE.md` y actualizar la lista de `MEMORY.md` desplazando las más antiguas para mantener exactamente el historial reciente de 10 ítems.

### 3. Sección de Pendientes y Hoja de Ruta
- **Regla:** El archivo `MEMORY.md` debe contener una sección viva de **Pendientes y Estado de Módulos**, detallando qué está completado, qué está en progreso y qué falta por iniciar.
- **Acción:** Sincronizar los ítems de esta sección al finalizar cada hito o al recibir nuevas instrucciones del usuario.

### 4. Investigación Previa con Subagentes Especializados
- **Regla:** Antes de escribir o modificar código para cualquier funcionalidad, realizar una fase de investigación utilizando subagentes (`invoke_subagent`).
- **Aspectos a investigar obligatoriamente:**
  1. **Funcionalidad & Negocio:** Flujos operativos, reglas del sector inmobiliario de inversión y experiencia de usuario (UX de alta densidad).
  2. **Técnico & Arquitectura:** Validación de sintaxis, compatibilidad de librerías, tipado estricto en Drizzle/TypeScript y patrones de rendimiento en Next.js App Router y PostgreSQL/PostGIS.

---

## 🛠️ STACK Y PAUTAS TÉCNICAS DEL PROYECTO
- **Framework:** Next.js (App Router, TypeScript)
- **Estilos:** Tailwind CSS (filas compactas 32-36px, tipografía 12-13px, paleta neutra Slate/Bloomberg).
- **ORM & DB:** Drizzle ORM + Supabase PostgreSQL con extensión PostGIS (`EPSG:4326`).
- **Grids:** TanStack Table v8.
- **Mapas:** MapLibre GL JS / `react-map-gl`.
- **Exportación:** SheetJS (`xlsx`) y `@react-pdf/renderer`.
- **Idioma de Respuestas:** Español en todas las interacciones con el usuario.

---

## 🎨 PAUTAS DE DISEÑO & UI: PROHIBICIÓN ESTRICTA DE FONDOS OSCUROS
- **Regla Mandatoria:** Queda terminantemente prohibido el uso de temas oscuros o fondos oscuros (`bg-slate-900`, `bg-slate-950`, `bg-black`, `bg-zinc-900`, etc.) en cualquier componente, vista, tarjeta, tabla, encabezado, barra de herramientas o diálogo de la aplicación.
- **Estándar Light Theme Corporativo (Bloomberg / Enterprise Density):**
  - **Lienzo y contenedores base:** `bg-slate-50/70` o `bg-slate-100`.
  - **Tarjetas, tablas, paneles y modales:** `bg-white` con bordes nítidos `border-slate-200`.
  - **Cabeceras de tablas y toolbars:** `bg-slate-100` o `bg-slate-50` con bordes `border-slate-200`.
  - **Tipografía y lectura:** Textos principales en `text-slate-900` / `text-slate-800`, textos secundarios y metadatos en `text-slate-500` / `text-slate-600`.
  - **Semáforos e indicadores:** Acentos cromáticos sobre fondos pastel claros (`bg-emerald-50 text-emerald-700 border-emerald-200`, `bg-amber-50 text-amber-700 border-amber-200`, `bg-rose-50 text-rose-700 border-rose-200`, `bg-blue-50 text-blue-700 border-blue-200`).

