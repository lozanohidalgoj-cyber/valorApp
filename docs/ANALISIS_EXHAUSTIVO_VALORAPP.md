# ValorApp — Análisis técnico exhaustivo (26/10/2025)

## Resumen ejecutivo

ValorApp es una SPA en React + TypeScript orientada al análisis de consumo energético a partir de registros ATR (CSV/Excel), con detección de anomalías (fraude/avería, consumos nulos sostenidos, incrementos extremos) y herramientas de preprocesado/visualización. No hay autenticación ni backend: la persistencia es localStorage. La navegación es por hash y el estado global se maneja con un Store propio.

- Stack: React 18, Vite, TypeScript, Vitest, SheetJS (xlsx)
- Estado: Context + reducer + servicios (persistencia en localStorage)
- Rutas hash: `#/`, `#/wart`, `#/analisis-expediente`, `#/export-saldo-atr`, `#/ver-saldo-atr`
- Entrada de datos: CSV/Excel (detección automática; parsers propios y SheetJS)
- Detección de anomalías: Implementada en `ATRPreview` con criterios documentados en `docs/DETECCION_ANOMALIAS_CONSUMO.md`

## Arquitectura y módulos

- Entrada (`src/main.tsx`): monta `StoreProvider` + `App`.
- Router por hash (`src/App.tsx`): hook `useHashRoute()` decide la vista.
- Estado global (`src/state/StoreContext.tsx`):
  - Acciones: INIT_REGISTROS, ADD/REMOVE/CLEAR_REGISTRO, SET_LOADING/ERROR
  - Servicios: `atrService` (capa de persistencia/validación/búsqueda)
  - Selección y utilidades: búsqueda, totales kWh, validación y generación de ID
- Servicio ATR (`src/services/atr/atrService.ts`):
  - Clave de almacenamiento: `valorApp.registros`
  - CRUD sobre registros, validación de negocio y cálculos agregados (total kWh)
  - Abstracción de storage: `src/services/storage/storageService.ts`
- Tipos de dominio (`src/types/atr.ts`): `ATRRegistro`, enums de gestión y valor, utilidades numéricas
- Páginas principales:
  - Dashboard (`src/pages/Dashboard/`): listado, filtros y métricas de registros manuales (store)
  - WART (`src/pages/Wart/Wart.tsx`): checklist de precondiciones, cambio de titular y fecha de acta con persistencia en localStorage
  - Análisis de expediente (`src/pages/AnalisisExpediente/`): lectura y parseo de Excel, KPIs y tabla
  - Export Saldo ATR (`src/pages/ExportSaldoATR/ExportSaldoATR.tsx`): import de CSV/Excel ATR y navegación a vista previa
  - Vista previa y análisis ATR (`src/pages/ExportSaldoATR/ATRPreview.tsx`): preprocesado, limpieza de columnas, filtrado, anulación de filas, construcción de series y detección de anomalías

## Flujos funcionales clave

1) Gestión de registros ATR (manual)
- Crear/validar/guardar registros desde formularios (`pages/ATRForm/` y hook `useATRForm`).
- Persistencia inmediata en `valorApp.registros` mediante `atrService`.
- Visualización, filtros y métricas en Dashboard con `useDashboard` + `useATRData`.

2) Flujo WART
- UI de checklist (revisión pinzas y cargas), captura de “cambio de titular” y “fecha de acta”.
- Persistencia:
  - `valorApp.wart.cambioTitular`: { tuvoCambioTitular: boolean, fecha: string }
  - `valorApp.wart.fechaActa`: string (ISO yyyy-mm-dd)
- Estos datos se leen luego en la vista ATR para validaciones cruzadas (p.ej. `useActaFacturaValidation`).

3) Import y análisis de expediente (Excel)
- `AnalisisExpediente` detecta y carga automáticamente un Excel embebido si existe en `/public`.
- Parser SheetJS (`modules/analisisExpediente/parseExcel.ts`): mapea columnas flexibles, calcula diff de pinzas y diferencia de cargas, marca flags (`pinzasOk`, `diferenciaOk`).
- KPIs de conteo y porcentajes, renderización de tabla.

4) Import ATR y análisis de anomalías (CSV/Excel)
- `ExportSaldoATR` acepta CSV y formatos Excel; detecta por “firma” (PK/OLE) además de la extensión/MIME.
- Guarda la carga en `valorApp.analisis.atrCsv` con estructura `{ headers, rows }`.
- Redirige a `#/ver-saldo-atr` donde `ATRPreview`:
  - Filtra cabeceras (p. ej. elimina “Autofactura”), ordena y permite anular filas.
  - Construye serie temporal (fecha/consumo, agregado mensual) y calcula variaciones.
  - Ejecuta el árbol de decisión de anomalías.
  - Muestra heatmap y barras; resalta el mes anómalo y contextualiza con el estado WART/fecha acta.

## Reglas de negocio y validaciones

- ATRRegistro:
  - Requeridos: clienteId, fechaISO (YYYY-MM-DD), gestión ('averia'|'fraude'), valorTipo ('estimado'|'real'), kWh ≥ 0
  - Si `gestion === 'fraude'` → `fraudeTipo` requerido
- Import y normalización:
  - CSV: parser robusto con autodetección de separador (`,`, `;`, `\t`), comillas y CRLF (`src/utils/csv.ts`)
  - Excel: SheetJS con utilidades para fechas (código serial) y extracción cruda (AoA → headers + rows)
- Detección de anomalías (resumen):
  - Umbral operativo: ±40% como variación crítica
  - Criterio 0 (consumo nulo sostenido): ≤ 1 kWh por ≥ 2 meses consecutivos → Crítica (confianza alta)
  - Validaciones cruzadas: outlier estadístico (|z|>2), anormalidad estacional (>15% vs promedio estacional), caída significativa (>30% mensual o >35% vs baseline)
  - Score de confianza compuesto (0.1–1.0) y clasificación (extrema/crítica/sostenida)
  - Detalles completos: `docs/DETECCION_ANOMALIAS_CONSUMO.md` y `ATRPreview.tsx`
- Validación acta vs facturación (`useActaFacturaValidation`):
  - Verifica existencia de facturas para el período del acta, calcula diferencia de días frente a última factura, emite alerta warning/error.

## Persistencia (mapa de claves)

- `valorApp.registros`: registros manuales ATR (array de `ATRRegistro`)
- `valorApp.analisis.atrCsv`: dataset importado (CSV/Excel) `{ headers: string[], rows: Record<string, any>[] }`
- `valorApp.analisisExpediente`: items parseados del Excel analizado (array)
- `valorApp.analisis.tipoContador`: string ('Tipo V' | 'Tipo IV')
- `valorApp.wart.cambioTitular`: { tuvoCambioTitular: boolean, fecha: string }
- `valorApp.wart.fechaActa`: string (ISO)

## Calidad, tests y tooling

- Scripts (package.json): dev, build, preview, typecheck, lint/lint:fix, format, test/test:coverage
- Lint: ESLint (React/TS), Prettier y EditorConfig
- Tests: Vitest + Testing Library; mocks de local/sessionStorage en `src/test/setup.ts`
- Vite config mínima con plugin React y opciones de build

## Seguridad y privacidad

- Sin backend ni autenticación (aplicación abierta). Datos permanecen en el navegador (localStorage).
- Riesgo: datasets sensibles se quedan en el cliente si no se limpian. Recomendación: añadir acción de “borrado seguro” y banner informativo.

## Performance

- Parsers sin web workers (bloqueo posible con CSV/Excel muy grandes). Mejoras sugeridas:
  - Carga y parsing en Web Worker
  - Virtualización de tablas grandes
  - Memoización de series y agregaciones costosas en `ATRPreview`

## Accesibilidad y UI

- Sistema visual corporativo documentado en `docs/DESIGN_SYSTEM.md` y tokens en `src/styles/tokens.css`.
- Se observan tamaños responsivos con `clamp()` y alto contraste; continuar auditando roles ARIA/tabindex y foco en modales.

## Riesgos y deuda técnica

- `ATRPreview.tsx` muy extenso (>3000 líneas): difícil de mantener y testear.
- Documentación antigua en `.github/copilot-instructions.md` hace referencia a auth y rutas inexistentes (se corrige en esta iteración).
- Falta de integración continua (CI) y chequeos automáticos en PR.

## Sugerencias de mejoras (priorizadas)

1. Refactor de `ATRPreview` en submódulos:
   - parsing/normalización, construcción de series, detección (pura/testeable), visualización, UI de filtros y anulación
2. Aislar algoritmo de anomalías en `src/modules/atrAnomalies/` con tests unitarios y fixtures
3. Web Worker para parsing CSV/Excel y agregados
4. Tabla virtualizada + paginación
5. Panel de “Histórico de anomalías” con export a CSV/PDF
6. Acción global de “Limpiar todos los datos locales” (borrado seguro)
7. Pipeline CI: typecheck + lint + test + preview

## Contratos mínimos (resumen)

- Entrada ATR (CSV/Excel):
  - headers: string[]; rows: Record<string, any>[]
  - Debe existir una columna interpretable como Fecha y otra como Consumo (nombrado flexible)
- `ATRRegistro` (manual):
  - { id, clienteId, fechaISO (YYYY-MM-DD), gestion ('averia'|'fraude'), fraudeTipo?, valorTipo ('estimado'|'real'), kWh ≥ 0, notas? }
- Salida anomalías:
  - Período (YYYY-MM), tipo (extrema/crítica/sostenida), confianza (0–1), variación, baseline y valores de referencia

---

Este análisis se basa en el código actual de la rama `main` a 26/10/2025 (Windows, Vite). 
