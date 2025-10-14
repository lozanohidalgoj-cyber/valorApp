# Estructura Final del Proyecto ValorApp

## 📁 Árbol de directorios

```
valorApp/
├── 📄 index.html
├── 📄 package.json
├── 📄 README.md
├── 📄 CAMBIOS_REFACTORIZACION.md
├── 📄 tsconfig.json
├── 📄 vite.config.ts
├── 📄 vitest.config.ts
├── 📄 vercel.json
│
├── 📂 .github/
│   └── 📄 copilot-instructions.md (actualizado)
│
├── 📂 public/
│   └── 📄 analisis-expedientes.txt
│
└── 📂 src/
    ├── 📄 main.tsx (simplificado - sin AuthProvider)
    ├── 📄 App.tsx (sin rutas de autenticación)
    ├── 📄 App.css
    ├── 📄 index.css
    │
    ├── 📂 assets/
    │
    ├── 📂 components/
    │   └── 📂 ui/
    │       ├── 📂 Button/
    │       ├── 📂 Card/
    │       ├── 📂 Input/
    │       ├── 📂 Select/
    │       └── 📂 Textarea/
    │
    ├── 📂 constants/
    │   └── 📄 index.ts (limpio - sin auth)
    │
    ├── 📂 hooks/
    │   ├── 📂 business/
    │   │   ├── 📄 useATRData.ts
    │   │   ├── 📄 useATRForm.ts
    │   │   └── 📄 useSaldoATR.ts
    │   └── 📂 ui/
    │       ├── 📄 useDebounce.ts
    │       ├── 📄 useFilters.ts
    │       └── 📄 useStorage.ts
    │
    ├── 📂 modules/
    │   └── 📂 analisisExpediente/
    │       ├── 📄 AnalisisTable.tsx
    │       ├── 📄 AnalisisUploader.tsx
    │       ├── 📄 parseExcel.ts
    │       ├── 📄 types.ts
    │       └── 📄 useAnalisisExpediente.ts
    │
    ├── 📂 pages/
    │   ├── 📂 AnalisisExpediente/
    │   │   └── 📄 AnalisisExpediente.tsx
    │   ├── 📂 ATRForm/
    │   │   ├── 📄 ATRForm.tsx
    │   │   ├── 📄 ATRFormActions.tsx
    │   │   ├── 📄 ATRFormFields.tsx
    │   │   └── 📄 useATRFormPage.ts
    │   ├── 📂 Dashboard/
    │   │   ├── 📄 Dashboard.tsx
    │   │   ├── 📄 ATRTable.tsx
    │   │   ├── 📄 FilterBar.tsx
    │   │   ├── 📄 SaldoATRPanel.tsx
    │   │   ├── 📄 StatsSummary.tsx
    │   │   └── 📄 useDashboard.ts
    │   ├── 📂 ExportSaldoATR/
    │   │   ├── 📄 ExportSaldoATR.tsx
    │   │   ├── 📄 AnomaliaATR.tsx
    │   │   └── 📄 ATRPreview.tsx
    │   ├── 📂 Wart/
    │   │   └── 📄 Wart.tsx
    │   └── 📂 Welcome/
    │       └── 📄 WelcomeScreen.tsx
    │
    ├── 📂 services/
    │   ├── 📂 atr/
    │   │   ├── 📄 atrService.ts
    │   │   └── 📄 index.ts
    │   └── 📂 storage/
    │       └── 📄 storageService.ts
    │
    ├── 📂 state/
    │   └── 📄 StoreContext.tsx (simplificado)
    │
    ├── 📂 styles/
    │   ├── 📄 tokens.css
    │   └── 📄 utilities.css
    │
    ├── 📂 test/
    │   ├── 📄 setup.ts
    │   ├── 📄 smoke.test.tsx (actualizado)
    │   └── 📄 test-utils.tsx (sin AuthProvider)
    │
    ├── 📂 types/
    │   └── 📄 atr.ts
    │
    └── 📂 utils/
        ├── 📄 csv.ts
        ├── 📂 formatting/
        └── 📂 validation/
```

## 🎯 Componentes principales por página

### Dashboard (`pages/Dashboard/`)
- **Dashboard.tsx**: Componente principal con welcome screen
- **ATRTable.tsx**: Tabla de registros con ordenamiento
- **FilterBar.tsx**: Barra de filtros (texto, gestión, tipo valor)
- **StatsSummary.tsx**: Resumen de estadísticas
- **SaldoATRPanel.tsx**: Panel de saldo ATR
- **useDashboard.ts**: Hook con lógica del dashboard

### WART (`pages/Wart/`)
- **Wart.tsx**: Funcionalidad WART

### Análisis Expediente (`pages/AnalisisExpediente/`)
- **AnalisisExpediente.tsx**: Vista principal
- Integrado con `modules/analisisExpediente/`
  - **AnalisisTable.tsx**: Tabla de resultados
  - **AnalisisUploader.tsx**: Carga de archivos
  - **parseExcel.ts**: Parseo de Excel
  - **useAnalisisExpediente.ts**: Hook de lógica

### Export Saldo ATR (`pages/ExportSaldoATR/`)
- **ExportSaldoATR.tsx**: Vista principal de exportación
- **AnomaliaATR.tsx**: Componente de anomalías
- **ATRPreview.tsx**: Vista previa de datos ATR

### ATR Form (`pages/ATRForm/`)
- **ATRForm.tsx**: Formulario principal
- **ATRFormFields.tsx**: Campos del formulario
- **ATRFormActions.tsx**: Acciones del formulario
- **useATRFormPage.ts**: Hook de lógica

## 🔧 Servicios y Hooks

### Business Hooks (`hooks/business/`)
- **useATRData.ts**: Gestión de datos ATR
- **useATRForm.ts**: Lógica de formularios ATR
- **useSaldoATR.ts**: Cálculo de saldo ATR

### UI Hooks (`hooks/ui/`)
- **useDebounce.ts**: Debouncing para inputs
- **useFilters.ts**: Gestión de filtros
- **useStorage.ts**: Persistencia en localStorage

### Servicios (`services/`)
- **atr/atrService.ts**: CRUD de registros ATR
- **storage/storageService.ts**: Abstracción de localStorage

## 📊 Estado global

### StoreContext (`state/StoreContext.tsx`)
```typescript
interface StoreState {
  registros: ATRRegistro[]
  isLoading: boolean
  error: string | null
}

interface StoreContextType extends StoreState {
  add: (registro: ATRRegistro) => void
  remove: (id: string) => void
  clear: () => void
  searchRegistros: (query, gestionFilter?, valorTipoFilter?) => ATRRegistro[]
  getTotalKWh: () => number
  validateRegistro: (registro) => string[]
  generateId: () => string
}
```

## 🧪 Testing

### Archivos de test
- **test/setup.ts**: Configuración de Vitest
- **test/smoke.test.tsx**: Test básico de renderizado
- **test/test-utils.tsx**: Utilidades para testing
- **hooks/business/useATRForm.test.ts**: Tests de hooks

## 🎨 UI Components (`components/ui/`)

### Componentes base reutilizables
- **Button**: Botones con variantes (primary, secondary, success, danger)
- **Card**: Tarjetas para contenido
- **Input**: Inputs con labels y validación
- **Select**: Selectores dropdown
- **Textarea**: Áreas de texto

## 📝 Tipos (`types/atr.ts`)

```typescript
interface ATRRegistro {
  id: string
  clienteId: string
  fechaISO: string
  gestion: 'averia' | 'fraude'
  fraudeTipo?: string
  valorTipo: 'estimado' | 'real'
  kWh: number
  notas?: string
}
```

## 🚀 Scripts disponibles

```json
{
  "dev": "vite --host",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src --ext ts,tsx",
  "lint:fix": "eslint src --ext ts,tsx --fix",
  "format": "prettier --write src",
  "test": "vitest",
  "test:coverage": "vitest --coverage",
  "typecheck": "tsc --noEmit"
}
```

## 📦 Dependencias principales

### Runtime
- React 18
- TypeScript
- SheetJS (xlsx) - Manejo de Excel

### Development
- Vite - Bundler y dev server
- Vitest - Testing
- ESLint - Linting
- Prettier - Formateo
- Testing Library - Testing de componentes

## 🔐 Persistencia

### localStorage keys
```typescript
const STORAGE_KEYS = {
  REGISTROS: 'valorApp.registros',
  TRIGGER_IMPORT: 'valorApp.triggerImportATR',
  SIDEBAR_OPEN: 'valorApp.sidebarOpen',
  WELCOME_SEEN: 'valorApp.welcome.seen',
}
```

## ✅ Estado actual

- ✅ Sin autenticación ni usuarios
- ✅ Acceso libre a todas las funcionalidades
- ✅ Compilación exitosa sin errores
- ✅ TypeScript sin errores
- ✅ Arquitectura simplificada
- ✅ Código optimizado y limpio
- ✅ Listo para despliegue
