# ValorApp – Guía para agentes (Copilot)

## Visión general
Aplicación corporativa para el análisis de consumo energético basada en registros ATR (CSV/Excel). Detecta anomalías (fraude/avería) y permite gestionar registros locales. No hay autenticación ni backend: acceso libre, datos en localStorage.

## Arquitectura y patrones clave
- Arquitectura modular (presentación, negocio, estado) con React + TypeScript
- Contexto único: `StoreProvider` (en `src/main.tsx`)
- Persistencia: localStorage (clave principal `valorApp.registros`), más claves auxiliares
- SPA por hash: `useHashRoute()` en `src/App.tsx`
- Rutas: `#/`, `#/wart`, `#/analisis-expediente`, `#/export-saldo-atr`, `#/ver-saldo-atr`

## Páginas y responsabilidades
- Dashboard (`src/pages/Dashboard/`): listado y métricas de registros del store; filtros rápidos
- WART (`src/pages/Wart/Wart.tsx`): checklist, “cambio de titular” y “fecha del acta” (persisten en localStorage)
- Análisis de Expediente (`src/pages/AnalisisExpediente/`): parsing de Excel, KPIs y tabla
- Export Saldo ATR (`src/pages/ExportSaldoATR/ExportSaldoATR.tsx`): import CSV/Excel ATR y guardado
- Vista ATR (`src/pages/ExportSaldoATR/ATRPreview.tsx`): previsualización, filtrado, series y detección de anomalías
- Formularios ATR (`src/pages/ATRForm/`): creación/edición de registros con validación

## Estado y servicios
- `src/state/StoreContext.tsx`: reducer + acciones (INIT/ADD/REMOVE/CLEAR/SET_LOADING/SET_ERROR)
- `src/services/atr/atrService.ts`: CRUD, validación, búsqueda y totales kWh, persistencia
- `src/services/storage/storageService.ts`: servicio genérico de storage (local/session)

## Persistencia (claves)
- `valorApp.registros` (registros ATR manuales)
- `valorApp.analisis.atrCsv` (dataset importado: { headers, rows })
- `valorApp.analisisExpediente` (items parseados de expediente)
- `valorApp.analisis.tipoContador` ('Tipo V' | 'Tipo IV')
- `valorApp.wart.cambioTitular` ({ tuvoCambioTitular, fecha })
- `valorApp.wart.fechaActa` (string ISO)

## Calidad de código y herramientas
- ESLint (React/TS) + Prettier + EditorConfig
- Vitest + React Testing Library (mock de storages en `src/test/setup.ts`)
- Vite + `@vitejs/plugin-react`

### Scripts (package.json)
```json
{
  "dev": "vite --host",
  "build": "vite build",
  "preview": "vite preview",
  "start": "vite preview --host",
  "typecheck": "tsc --noEmit",
  "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "lint:fix": "eslint src --ext ts,tsx --fix",
  "format": "prettier --write src",
  "test": "vitest",
  "test:coverage": "vitest --coverage"
}
```

### Workflow recomendado
1) `npm run dev` → desarrollo
2) `npm run lint` / `npm run typecheck` → calidad
3) `npm run test` → pruebas
4) `npm run build` y `npm run preview` → verificación final

## Convenciones del proyecto
- UI y comentarios en español; emojis opcionales (📊, ⚠️, ✅) para jerarquía
- Imports sin extensión TS y ordenados
- Números en inputs: `parseFloat(e.target.value) || 0`
- Componentes: responsabilidad única y <150 líneas; extraer lógica a hooks
- Mantener rutas por hash y estilos corporativos (ver `docs/DESIGN_SYSTEM.md`)

## Patrones de implementación
- Hooks especializados para negocio (`useATRData`, `useWARTModule`, `useActaFacturaValidation`)
- Formularios con validación previa; mensajes claros de error
- Optimización con `useMemo`/`useCallback` y React.memo en componentes puros

## Detección de anomalías (guía rápida)
- Implementación principal en `src/pages/ExportSaldoATR/ATRPreview.tsx`
- Criterio 0: consumo nulo sostenido (≤1 kWh por ≥2 meses)
- Umbral operativo: ±40% (variación crítica)
- Validaciones cruzadas: Z-Score, estacionalidad, caída/incremento significativo
- Detalle completo: `docs/DETECCION_ANOMALIAS_CONSUMO.md`

## Manejo de errores y accesibilidad
- try/catch en operaciones asíncronas; errores globales en `StoreContext`
- Accesibilidad: labels/roles ARIA, foco visible, contraste suficiente, navegación por teclado

## Archivos clave
```
src/
├── App.tsx                  # Router por hash
├── main.tsx                 # Providers
├── state/StoreContext.tsx   # Estado global
├── services/atr/atrService.ts
├── services/storage/storageService.ts
├── types/atr.ts             # Tipos de dominio
├── pages/
│   ├── Dashboard/
│   ├── Wart/
│   ├── AnalisisExpediente/
│   └── ExportSaldoATR/
└── utils/csv.ts             # Parser CSV robusto
```

## Próximas integraciones y mejoras
- Refactor de `ATRPreview` en submódulos + tests unitarios
- Web Worker para parsing y agregados
- Tabla virtualizada y export de reportes
- Acciones de borrado seguro de datos locales
- PWA / i18n / dark mode (opcional)

## Nota para agentes (Copilot)
- Favorecer cambios pequeños y testeables; no introducir autenticación
- No romper el enrutado por hash ni las claves de localStorage existentes
- Si añades claves nuevas, documentarlas en esta guía
- Mantener textos en español y coherencia visual con `DESIGN_SYSTEM.md`
