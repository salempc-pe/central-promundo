# MEMORY.md - Memoria Operativa & Handoff de "Promundo Sistema"

Este archivo mantiene el estado vivo del proyecto, el historial rotativo de las últimas 10 acciones ejecutadas (con fecha y hora) y el mapa de pendientes según lo estipulado en `AGENTS.md`.

---

### 🕒 ÚLTIMAS 10 ACCIONES EJECUTADAS (ROTATIVO)

### 📅 2026-09-06
1. **[2026-09-06 01:45] Implementación Integral de Control de Accesos con Google OAuth, Flujo de Cuarentena en Espera, Módulo Administrativo /accesos y Superadministrador Inmutable paulosalem8@gmail.com:** Investigación profunda previa mediante subagentes especializados (`clean-code`, `nextjs-best-practices`, `nextjs-app-router-patterns`, `database-design`, `postgresql`). 1) **Base de Datos & DDL:** Creación de enum `estado_acceso` (`pendiente`, `aprobado`, `denegado`), extensión de tabla `usuarios` en Drizzle y Supabase PostgreSQL (`auth_id`, `avatar_url`, `estado_acceso`, `fecha_solicitud`, `fecha_resolucion`, `resuelto_por`, `notas`), creación de índices y siembra inmutable de `paulosalem8@gmail.com` como Superadmin aprobado. 2) **Página de Login (`/login`):** Interfaz corporativa Bloomberg Light Theme (`bg-white border-slate-200`) con botón oficial Google Sign-In SVG conectado a `@supabase/ssr` y aviso fiduciario de cuarentena. 3) **Pantalla de Solicitud en Revisión (`/espera`):** Vista de espera institucional para nuevos usuarios que ingresan con Google, mostrando datos de la cuenta postulante, estado pendiente y botón reactivo de verificación de aprobación. 4) **Módulo Administrativo de Gestión de Accesos (`/accesos`):** Vista de alta densidad para administradores con KPIs en tiempo real (solicitudes pendientes, brokers activos, denegados), pestañas de filtrado, Data Grid compacto con selector de rol (`broker_junior`, `broker_senior`, `admin`), botones de acción directa (`Aprobar Acceso`, `Denegar`, `Revocar`) y protección inmutable con candado para `paulosalem8@gmail.com`. 5) **Desacoplamiento de Layout & Middleware:** Creación de `AppShell` para aislar `/login` y `/espera` de la Sidebar institucional, y `middleware.ts` para blindar el perímetro de todas las rutas operativas. Integración de badge reactivo en Sidebar y campana en Header. 6) **Verificación:** 0 errores TypeScript (`npx tsc --noEmit`), 0 advertencias ESLint (`npm run lint`), build de producción aprobado (17/17 rutas estáticas y dinámicas compiladas exitosamente) y endpoints verificados en el servidor dev.
2. **[2026-09-06 01:25] Eliminación de Etiquetas de Módulos (Mod A, Mod B, Mod C, etc.) en Sidebar y Filtros de Auditoría:** Investigación y auditoría visual de componentes (`clean-code` y `react-patterns`). 1) **Limpieza en Sidebar (`src/components/layout/sidebar.tsx`):** Remoción de los badges estáticos `"Mod A"`, `"Mod B"`, `"Mod C"`, `"Mod D"`, `"Mod E"`, `"Mod F"`, `"Mod G"`, `"Mod H1"`, `"Mod H2"` de todos los elementos de navegación de `navigationItems`, tanto en su renderizado en modo expandido como en el `TooltipContent` flotante en modo colapsado, ofreciendo una apariencia limpia, pulida y 100% orientada al usuario de negocio institucional. 2) **Limpieza en Filtros de Auditoría (`src/components/auditoria/auditoria-toolbar.tsx`):** Eliminación de los sufijos identificadores internos `(Mod A)`, `(Mod C)`, `(Mod D)`, `(Mod E)`, `(Mod F)`, `(Mod G)` y `(Mod H1)` en el array de opciones `modulosDisponibles`, estandarizando los nombres formales de cada módulo del sistema (`"Terrenos"`, `"Documentos & CPU"`, `"Pipeline Negociaciones"`, `"Motor de Matching"`, `"Comisiones & Finanzas"`, `"Métricas BI"`, `"Configuración Normativa"`). 3) **Verificación:** 0 errores en TypeScript (`npx tsc --noEmit`), 0 advertencias en ESLint (`npm run lint`), build de producción intacto y sincronización en GitHub.
3. **[2026-09-06 01:21] Implementación Integral del Alta de Nuevo Lote de Suelo Institucional (TerrenoCreateDialog) y Corrección de DialogTitle Light Theme:** Investigación previa mediante subagente especializado de dominio inmobiliario y arquitectura frontend (`clean-code`, `react-patterns`, `nextjs-app-router-patterns`). 1) **Detección de Causa Raíz:** El botón "+ Nuevo Lote" en `src/components/terrenos/terrenos-toolbar.tsx` se encontraba estático sin prop `onClick`, y la vista cliente `TerrenosClient` no contaba con diálogo ni estado para registrar activos. 2) **Corrección de DialogTitle en Tema Claro:** En `src/components/ui/dialog.tsx`, corrección de la clase residual `text-white` en `DialogTitle` reemplazándola por `text-slate-900` para garantizar legibilidad absoluta sobre el fondo corporativo blanco `bg-white` y cabecera `bg-slate-50`. 3) **Creación de TerrenoCreateDialog:** Desarrollo del componente `src/components/terrenos/terreno-create-dialog.tsx` con soporte para: autogeneración de código institucional de cartera (`TR-[DIST]-[SEQ]`) editable; alta rápida inline de propietarios titulares en SUNARP con DNI/RUC; selector de distritos metropolitanos de Lima con cálculo automático de coordenadas centroides referenciales; validación geoespacial en tiempo real con `validateTerrenoCoordinates` para prevenir coordenadas erróneas o marítimas en el Océano Pacífico; parámetros urbanísticos (zonificación RDA/RDM/CZ/CM/I1/ZTE, área m², frente lineal, fondo calculado, altura en pisos y usos permitidos); y cálculo bidireccional reactivo entre precio total (USD) y precio por metro cuadrado ($/m²). 4) **Integración de Servicios y Estado Reactivo:** Extensión de `src/lib/services/terrenos.ts` con `getPropietarios()`, `createPropietarioEnMemoria()` y `createTerrenoEnMemoria()`. En `src/app/terrenos/terrenos-client.tsx`, conexión del disparador `onNuevoLote`, actualización reactiva inmediata de la tabla (`terrenosList`, contadores de toolbar y selección con apertura automática en el sheet de inspección). Carga paralela de `initialPropietarios` en `src/app/terrenos/page.tsx`. 5) **Validación y Calidad:** 0 errores en TypeScript (`npx tsc --noEmit`), 0 advertencias en ESLint (`npm run lint`), build de producción aprobado (`npm run build` con 13/13 rutas estáticas generadas) y verificación HTTP 200 OK con el servidor de desarrollo activo.
4. **[2026-09-06 01:18] Vinculación de Remoto GitHub y Push Inicial Exitoso de Rama Main:** Configuración de origen remoto `https://github.com/salempc-pe/central-promundo.git` y sincronización upstream `git push -u origin main` completada con éxito. Código fuente, esquemas Drizzle, configuración Next.js 14 y suites de validación 100% disponibles en GitHub con exclusión estricta de variables de entorno y credenciales sensibles (`.env.local`).
5. **[2026-09-06 01:16] Conexión Integral de Supabase PostgreSQL + PostGIS, Ejecución de Migración DDL y Validación de Build de Producción:** Configuración de `.env.local` con credenciales de Supabase (`rioosacxbuwkxntxmmpe`). Ejecución exitosa de migración DDL (`scripts/apply-migration.mjs` y `0000_init_postgis_schema.sql`) habilitando extensiones `postgis` y `uuid-ossp`, 8 tablas (`terrenos`, `documentos_terreno`, `propietarios`, `clientes`, `negociaciones`, `bitacora_negociacion`, `comisiones_cierres`, `usuarios`), triggers para cálculo de punto espacial WGS84 e índices GiST y B-Tree. Inicialización de Git con rama `main`, blindaje de credenciales en `.gitignore`, verificación de `npm run build` (13/13 rutas estáticas compiladas exitosamente con 0 errores) y commit inicial para despliegue en Vercel.

### 📅 2026-09-05
6. **[2026-09-05 19:55] Erradicación de la Sensación de Vista 3D (Transición a 2D Planar con easeTo) y Desacoplamiento de Clic en Marcador vs Sheet Lateral:** Investigación forense de cinemática de cámara MapLibre (`systematic-debugging` y `uxui-principles`). Reemplazo de `map.flyTo` por `map.easeTo` (`zoom: 16.0`, `duration: 500ms`, `easing: quad ease-out`), logrando un desplazamiento y zoom 100% planos sobre el plano 2D perpendicular (vista cenital pura sin swoop ni cambio de altitud). Desacoplamiento del clic sobre el pin (que ahora únicamente enfoca el predio en 2D y despliega el Popup HUD de 360px manteniendo el mapa iluminado). Validación completa con 0 errores TypeScript (`npx tsc --noEmit`), 0 advertencias en ESLint (`npm run lint`), 18/18 PASS en integridad geoespacial y confirmación HTTP 200 OK en `/mapa`.
7. **[2026-09-05 18:55] Micro-Calibración Cartográfica Final, Corrección de Regex en Script de Integridad y Bloqueo Total Multi-Input de Pitch:** Auditoría forense independiente y verificación exhaustiva de coordenadas contra OpenStreetMap y Nominatim. Alineación de `TR-SBOR-071` (Av. San Borja Sur 890), corrección en `TR-MIRA-084`, `TR-LMOL-039` y `TR-ATE-090`. Bloqueo total de pitch 3D en `terrenos-map.tsx` y suite automatizada con 18/18 PASS (100%). Verificación con `npm run lint` y `npx tsc --noEmit` (0 errores).
8. **[2026-09-05 18:40] Calibración Cartográfica 100% Vial de 18 Terrenos y Bloqueo Total de Perspectiva 3D/Pitch Cenital en MapLibre GL JS:** Investigación geográfica profunda con OpenStreetMap y reverse geocoding para alinear con exactitud milimétrica los 18 lotes de `src/lib/mock/terrenos-seed.ts`. Bloqueo inmutable de rotación y pitch en constructor de MapLibre GL JS. Verificación de suite espacial 18/18 PASS, `npm run lint` y `npx tsc --noEmit` con 0 errores.
9. **[2026-09-05 18:20] Alineación Vial de TR-SISI-019 (Calle Las Palmeras), Rediseño de Popup HUD a 360px y Creación de Validador Geoespacial:** Corrección de predio en San Isidro, expansión de popup HUD a 360px con zona de exclusión para evitar superposiciones, módulo de validación catastral `src/lib/map/geo-validator.ts` y suite automatizada con 18/18 lotes aprobados al 100%.
10. **[2026-09-05 17:42] Optimización de Rendimiento a 60fps en MapLibre GL JS y Recalibración Cartográfica WGS84 de Terrenos:** Corrección de lag severo mediante aislamiento DOM de marcadores en GPU (`scale`, `transform`) sin recalcular estilos inline del mapa, y recalibración de lotes que caían en el océano o acantilados de Lima. Verificación con 0 errores TypeScript (`npx tsc --noEmit`).

---

## 📌 SECCIÓN DE PENDIENTES Y HOJA DE RUTA

### 🟢 Módulos Base Completados (Fase 1):
- [x] **Módulo A: Data Grid de Terrenos con TanStack Table v8** 🟢 *(Completado y Validado)*
- [x] **Módulo B: Mapa Interactivo Georreferenciado** 🟢 *(Completado y Validado)*
- [x] **Módulo C: Gestión Documental & Certificados de Parámetros** 🟢 *(Completado y Validado)*
- [x] **Módulo D: Pipeline de Negociaciones & Bitácora de Auditoría** 🟢 *(Completado y Validado)*
- [x] **Módulo E: Motor de Matching Automático Lote ↔ Constructoras** 🟢 *(Completado y Validado)*
- [x] **Módulo F: Comisiones, Liquidaciones y Reportes Financieros** 🟢 *(Completado y Validado)*
- [x] **Módulo G: Métricas, Rendimiento BI & Reportes Ejecutivos (`/reportes`)** 🟢 *(Completado y Validado)*
- [x] **Módulo H: Configuración GIS, Parámetros Normativos & Auditoría Global (`/configuracion`, `/auditoria`)** 🟢 *(Completado y Validado)*

### 🟡 Iniciativas y Nuevos Módulos en Hoja de Ruta (Fase 2):
- [x] **Fase 2.0: Control de Accesos, Google OAuth & Flujo de Aprobación Fiduciaria** 🟢 *(Completado y Validado)*
  - [x] Página de Login institucional Bloomberg Light con Google Sign-In (`@supabase/ssr`).
  - [x] Flujo de cuarentena: nuevos usuarios redirigidos obligatoriamente a `/espera` sin acceso a cartera ni datos sensibles.
  - [x] Módulo administrativo `/accesos` para revisión, aprobación, denegación y asignación de roles (`broker_junior`, `broker_senior`, `admin`).
  - [x] Superadministrador inmutable: `paulosalem8@gmail.com` aprobado por defecto con rol `admin` y candado de protección.
  - [x] Desacoplamiento de layout con `AppShell`, protección perimetral con `middleware.ts`, badges en Sidebar y Header.

- [ ] **Fase 2.1: Unificación Reactiva del Dashboard Principal (`/`) & Command Palette Global (`Ctrl+K`)** 🟡 *(Prioridad Alta - Próximo)*
  - [ ] Conectar Dashboard (`src/app/page.tsx`) a los servicios reactivos del sistema (`terrenosService`, `negociacionesService`, `documentosService`, `matchingService`, `comisionesService`, `auditoriaService`).
  - [ ] KPIs dinámicos en tiempo real (valor real de cartera, área total en gestión, lotes activos, alertas reales de vencimiento de certificados).
  - [ ] Sincronizar ticker del `Header` con el inventario y estado global en tiempo real.
  - [ ] Implementar diálogo interactivo Command Palette (`Ctrl+K`) tipo Spotlight para búsqueda rápida de lotes, constructoras, documentos y navegación directa con atajos de teclado.

- [ ] **Fase 2.2: Módulo I: Directorio de Constructoras, Desarrolladores y Mandatos (`/constructoras` o `/clientes`)**
  - [ ] Tipado estricto e interfaces para constructoras, perfiles de inversión y mandatos de búsqueda (`src/types/constructoras.ts`).
  - [ ] Data Grid TanStack Table v8 con filtros por ticket, distritos prioritarios y capacidad de absorción.
  - [ ] Ficha técnica del desarrollador con mandatos activos e historial de lotes presentados/evaluados.
  - [ ] Integración comercial directa con el motor de matching y el pipeline de negociaciones.

- [x] **Fase 2.3: Formulario Integral de Alta de Nuevos Lotes (`TerrenoCreateDialog`)** 🟢 *(Completado y Validado)*
  - [x] Modal de alta corporativo (Bloomberg Light) con código sugerido por distrito (`TR-[DIST]-[SEQ]`), titular SUNARP y parámetros técnicos.
  - [x] Georreferenciación WGS84 con centroides referenciales distritales y validación territorial estricta (`validateTerrenoCoordinates`).
  - [x] Cálculo financiero bidireccional reactivo entre precio total (USD), área (m²) y precio/m² ($/m²).
  - [x] Registro rápido inline de nuevos propietarios con tipo y número de documento (DNI/RUC) y apoderado.
  - [x] Conexión reactiva en `TerrenosClient` con TanStack Table v8 y selección automática tras el guardado.

- [ ] **Fase 2.4: Generador de Ficha Comercial & Dossier Ejecutivo de Inversión en PDF**
  - [ ] Diseño y maquetación de One-Pager / Teaser Comercial imprimible y descargable en formato PDF de alta fidelidad.
  - [ ] Inclusión de ficha técnica de lote, croquis/ubicación satelital, resumen de parámetros distritales y análisis económico preliminar (incidencia estimada de suelo).
  - [ ] Modal de previsualización e impresión directa para comités de inversión.

- [ ] **Fase 2.5: Persistencia en Base de Datos Real (Supabase / PostgreSQL + PostGIS)**
  - [x] Esquema DDL, extensiones PostGIS (`EPSG:4326`), triggers e índices creados y verificados en Supabase Cloud (`rioosacxbuwkxntxmmpe`). 🟢 *(Completado)*
  - [x] Tabla `usuarios` migrada y vinculada con Supabase Auth y control de accesos. 🟢 *(Completado)*
  - [ ] Conexión a Supabase/PostgreSQL mediante Server Actions o endpoints API integrados con Drizzle ORM.
  - [ ] Consultas espaciales nativas en PostGIS (`ST_DWithin`, `ST_Intersects`, buffers territoriales distritales).
  - [ ] Sincronización y persistencia bidireccional entre la base de datos y los estados locales de la interfaz.


---

## 🟢 ESTADO DEL ENTORNO
* **Servidor Dev:** `http://localhost:3000` (Activo y corriendo en background).
* **Compilación TS:** 0 errores (`npx tsc --noEmit` verificado).
* **Base de Datos:** Drizzle ORM configurado con soporte PostGIS (`EPSG:4326`).
