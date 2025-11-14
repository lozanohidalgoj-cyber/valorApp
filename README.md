# ValorApp v2

**Aplicación profesional de análisis de consumo energético y detección de anomalías**

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características Principales](#características-principales)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Comandos Disponibles](#comandos-disponibles)
- [Path Aliases](#path-aliases)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Sistema de Diseño](#sistema-de-diseño)
- [Flujo de Datos](#flujo-de-datos)
- [Módulos Principales](#módulos-principales)
- [Guías de Desarrollo](#guías-de-desarrollo)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Contribución](#contribución)

---

## Descripción

## Descripción

ValorApp v2 es una aplicación web desarrollada en **React 19 + TypeScript + Vite** diseñada específicamente para el **análisis avanzado de consumos energéticos y detección automatizada de anomalías** en contadores eléctricos.

### Propósito

La aplicación procesa datos de consumo energético obtenidos mediante macros de Excel (archivos CSV/JSON) y realiza:

La aplicación procesa datos de consumo energético obtenidos mediante macros de Excel (archivos CSV/JSON) y realiza:

- Análisis comparativo de consumos mensuales y anuales
- Detección automática de descensos anormales en el consumo (15-30%)
- Identificación de consumos cero o negativos
- Detección de picos anómalos (>promedio + 2σ)
- Determinación precisa de la primera factura donde inicia la anomalía
- Visualización interactiva mediante gráficos y tablas
- Cálculos estadísticos y proyecciones de impacto económico

### Arquitectura Client-Side

**No requiere backend ni base de datos**: Todos los datos se procesan completamente en el navegador (client-side), garantizando:

- Privacidad total de los datos del usuario
- Procesamiento instantáneo sin latencia de red
- Despliegue simplificado (solo archivos estáticos)
- Independencia de infraestructura de servidor

---

## Características Principales

### Análisis de Datos

- **Importación flexible**: Soporte para CSV y JSON
- **Validación automática**: Detección de errores en formatos de fecha, valores numéricos
- **Limpieza de datos**: Eliminación de duplicados y registros inválidos
- **Agrupación inteligente**: Procesamiento por periodos (mensual/anual)

### Detección de Anomalías

El sistema implementa algoritmos avanzados para detectar:

1. **Descenso abrupto**: Caída >30% periodo a periodo
2. **Descenso gradual**: Caída 15-30% sostenida
3. **Consumo cero**: Lecturas ≤5 kWh
4. **Consumo negativo**: Valores <0 (errores de contador)
5. **Picos anómalos**: Consumo excesivamente alto (>promedio + 2×desviación estándar)

### Visualización

- **Heat maps**: Matriz de consumos por año/mes con códigos de color
- **Gráficos de tendencias**: Evolución temporal del consumo
- **Tablas interactivas**: Detalles completos con ordenamiento y filtrado
- **Exportación**: Reportes en Excel con análisis completo

### Clasificación de Expedientes

- **Expediente Tipo V**: Análisis especializado para fraudes detectados
- **Saldo ATR**: Análisis de saldos de Acceso de Terceros a la Red
- **Derivación individual**: Gestión de casos de consumos compartidos

---

## Arquitectura

## Arquitectura

### Principios de Diseño

El proyecto sigue una arquitectura **por capas** basada en principios SOLID:

```
┌─────────────────────────────────────────┐
│  PRESENTACIÓN (components/, pages/)     │  ← Componentes React, UI
├─────────────────────────────────────────┤
│  LÓGICA DE APLICACIÓN (hooks/)          │  ← Hooks personalizados, orquestación
├─────────────────────────────────────────┤
│  LÓGICA DE NEGOCIO (services/)          │  ← Reglas de negocio puras
├─────────────────────────────────────────┤
│  UTILIDADES (utils/)                    │  ← Funciones matemáticas, formateo
├─────────────────────────────────────────┤
│  ESTADO GLOBAL (context/)               │  ← React Context API
└─────────────────────────────────────────┘
```

### Estructura de Directorios

```
src/
├── components/       → Componentes reutilizables (Button, Card, HeatMap)
│   └── [Component]/  → Cada componente en su carpeta con .tsx + .css + index.ts
├── pages/            → Vistas completas (Home, ExpedienteTipoV, SaldoATR)
│   └── [Page]/       → Página con subcomponentes, hooks y utils propios
├── services/         → Lógica de negocio (anomaliaService, dataService)
├── hooks/            → Hooks personalizados (useProcesarDatos, useImportarArchivos)
├── utils/            → Funciones auxiliares puras (cálculos, formateo, validación)
├── types/            → Definiciones TypeScript centralizadas
├── context/          → Estado global con React Context API
├── constants/        → Configuraciones y constantes de la app
├── data/             → Archivos de ejemplo/plantilla
├── styles/           → Estilos globales y utilidades CSS
└── assets/           → Recursos estáticos (imágenes, fuentes)
```

---

## Tecnologías

### Core

## Tecnologías

### Core

| Tecnología       | Versión | Propósito                            |
| ---------------- | ------- | ------------------------------------ |
| **React**        | 19.1.1  | Framework UI con hooks modernos      |
| **TypeScript**   | 5.9.3   | Type safety y mejor DX               |
| **Vite**         | 7.1.7   | Build tool y dev server ultrarrápido |
| **React Router** | 7.9.5   | Navegación entre páginas             |

### Visualización y UI

| Librería         | Versión | Uso                                    |
| ---------------- | ------- | -------------------------------------- |
| **Recharts**     | 3.3.0   | Gráficos interactivos (líneas, barras) |
| **Lucide React** | 0.553.0 | Iconos SVG consistentes                |
| **TailwindCSS**  | 3.4.15  | Utility-first CSS framework            |

### Procesamiento de Datos

| Librería | Versión | Uso                           |
| -------- | ------- | ----------------------------- |
| **XLSX** | 0.18.5  | Importación/exportación Excel |

### Herramientas de Desarrollo

| Herramienta     | Versión | Propósito                         |
| --------------- | ------- | --------------------------------- |
| **ESLint**      | 9.36.0  | Linting y detección de errores    |
| **Prettier**    | 3.6.2   | Formateo automático de código     |
| **Husky**       | 9.1.7   | Git hooks para pre-commit         |
| **lint-staged** | 16.2.6  | Lint solo en archivos modificados |

---

## Instalación

### Requisitos Previos

### Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/lozanohidalgoj-cyber/valorapp-v2.git
cd valorapp-v2

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## Comandos Disponibles

### Desarrollo

## Comandos Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo con hot reload
npm run dev

# Compilar TypeScript sin generar archivos (verificar errores)
npm run type-check
```

### Producción

```bash
# Compilar para producción
npm run build

# Previsualizar build de producción localmente
npm run preview

# Limpiar carpeta dist
npm run clean
```

### Calidad de Código

```bash
# Ejecutar ESLint (detectar errores)
npm run lint

# Ejecutar ESLint y corregir automáticamente
npm run lint:fix

# Formatear código con Prettier
npm run format

# Verificar formato sin modificar archivos
npm run format:check

# Validación completa (type-check + lint + format)
npm run validate
```

### Git Hooks

El proyecto usa **Husky** y **lint-staged** para ejecutar automáticamente validaciones antes de cada commit:

- Formateo automático con Prettier
- Linting con ESLint
- Type checking con TypeScript

---

## Path Aliases

## Path Aliases

Para mejorar la legibilidad y evitar imports relativos complejos, el proyecto usa **path aliases** configurados en `tsconfig.app.json` y `vite.config.ts`:

### Aliases Disponibles

| Alias           | Ruta Real            | Uso                                   |
| --------------- | -------------------- | ------------------------------------- |
| `@/*`           | `src/*`              | Acceso general a cualquier módulo     |
| `@components/*` | `src/components/*`   | Componentes reutilizables             |
| `@pages/*`      | `src/pages/*`        | Páginas/vistas de la aplicación       |
| `@services/*`   | `src/services/*`     | Servicios de lógica de negocio        |
| `@utils/*`      | `src/utils/*`        | Funciones auxiliares                  |
| `@hooks/*`      | `src/hooks/*`        | Hooks personalizados                  |
| `@types`        | `src/types/index.ts` | Definiciones TypeScript centralizadas |
| `@constants/*`  | `src/constants/*`    | Constantes y configuraciones          |
| `@context/*`    | `src/context/*`      | React Context API                     |
| `@styles/*`     | `src/styles/*`       | Archivos CSS globales                 |

### Ejemplos de Uso

### Ejemplos de Uso

```typescript
// En lugar de: import { Button } from '../../../components/Button';
import { Button } from '@components/Button';

// En lugar de: import { useAppContext } from '../../context';
import { useAppContext } from '@context';

// En lugar de: import { detectarAnomalias } from '../../../services/anomaliaService';
import { detectarAnomalias } from '@services/anomaliaService';

// En lugar de: import type { ConsumoEnergetico } from '../../../types';
import type { ConsumoEnergetico } from '@types';
```

---

## Estructura del Proyecto

### Componentes (`/components`)

Componentes reutilizables organizados por funcionalidad:

```
components/
├── Button/                    → Botones corporativos con variantes
├── Card/                      → Contenedores de información
├── HeatMapConsumo/            → Matriz de calor para visualización de consumos
│   ├── hooks/                 → useHeatMapCalculations
│   ├── utils/                 → constants, colorHelpers
│   └── types.ts               → Interfaces específicas
├── DeteccionAnomalia/         → Componente de detección automática
└── BannerClasificacionExpediente/  → Banner de estado de expediente
```

### Páginas (`/pages`)

Vistas completas de la aplicación:

```
pages/
├── Home/                      → Dashboard principal
├── ExpedienteTipoV/           → Análisis de expedientes tipo V (fraude)
│   ├── components/            → Subcomponentes específicos
│   ├── hooks/                 → Hooks de la página
│   └── utils/                 → Utilidades de cálculo
├── SaldoATR/                  → Gestión de saldos ATR
│   ├── components/            → Tablas, gráficos
│   ├── hooks/                 → useSaldoATRData
│   └── utils/                 → Formateo de datos
├── Averia/                    → Selección de tipo de avería
└── Wart/                      → Validación WART
```

### Servicios (`/services`)

Lógica de negocio pura (funciones sin estado):

| Servicio                           | Responsabilidad                                   |
| ---------------------------------- | ------------------------------------------------- |
| `anomaliaService.ts`               | Detección de anomalías con umbrales configurables |
| `dataService.ts`                   | Limpieza, agrupación y procesamiento de datos     |
| `importService.ts`                 | Importación y validación de CSV/JSON              |
| `clasificadorExpedienteService.ts` | Clasificación de tipos de expediente              |
| `exportacionService.ts`            | Exportación a Excel con formato                   |
| `loggerService.ts`                 | Sistema de logging centralizado                   |

### Hooks (`/hooks`)

Hooks personalizados que orquestan servicios:

| Hook                    | Propósito                                            |
| ----------------------- | ---------------------------------------------------- |
| `useProcesarDatos`      | Procesa consumos y detecta anomalías automáticamente |
| `useImportarArchivos`   | Gestiona importación de archivos CSV/JSON            |
| `useImportarDerivacion` | Importa datos de derivación individual               |

### Utilidades (`/utils`)

Funciones auxiliares puras:

- `formatearFecha()`: Formateo consistente de fechas
- `calcularEstadisticas()`: Media, desviación estándar, percentiles
- `validarConsumo()`: Validación de datos de consumo
- `obtenerPeriodo()`: Conversión fecha → periodo (YYYY-MM)

---

## Sistema de Diseño

### Paleta de Colores Corporativa

Los colores están definidos como variables CSS en `src/index.css`:

```css
:root {
  --color-primary: #0000d0; /* Azul corporativo */
  --color-secondary: #ff3184; /* Rosa vibrante */
  --color-white: #ffffff;
  --color-bg: #f5f5f5;
  --color-border: #d9d9d9;
  --color-text: #333333;
}
```

### Uso en Componentes

```css
/* SIEMPRE usar variables CSS */
.button-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.button-secondary:hover {
  background-color: var(--color-secondary);
}

/* NUNCA hardcodear colores */
/* ❌ background-color: #0000d0; */
```

### Espaciado

```css
:root {
  --spacing-xs: 0.25rem; /* 4px */
  --spacing-sm: 0.5rem; /* 8px */
  --spacing-md: 1rem; /* 16px */
  --spacing-lg: 1.5rem; /* 24px */
  --spacing-xl: 2rem; /* 32px */
  --spacing-2xl: 3rem; /* 48px */
}
```

### Tipografía

```css
:root {
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-base: 1rem; /* 16px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.5rem; /* 24px */
  --font-size-2xl: 2rem; /* 32px */
}
```

---

## Flujo de Datos

### 1. Importación de Datos

```
Usuario selecciona CSV/JSON
         ↓
importService.importarCSV()
         ↓
Validación de formato
         ↓
ConsumoEnergetico[]
```

### 2. Procesamiento

```
ConsumoEnergetico[]
         ↓
dataService.limpiarDatos()
         ↓
dataService.eliminarDuplicados()
         ↓
dataService.agruparPorPeriodo()
         ↓
ConsumoPeriodo[]
```

### 3. Detección de Anomalías

```
ConsumoPeriodo[]
         ↓
anomaliaService.detectarAnomalias()
         ↓
Análisis de tendencias
         ↓
Comparación con umbrales
         ↓
Anomalia[]
```

### 4. Estado Global

```
Datos procesados
         ↓
AppContext (React Context API)
         ↓
Consumido por componentes
         ↓
Renderizado en UI
```

---

## Módulos Principales

### Expediente Tipo V

**Propósito**: Análisis detallado de fraudes detectados en contadores

**Características**:

- Importación de datos de consumo
- Detección automática de primera anomalía
- Cálculo de impacto económico
- Clasificación de expediente (V1, V2, V3, V4)
- Exportación a Excel con métricas completas

**Acceso**: `/expediente-tipo-v`

### Saldo ATR

**Propósito**: Análisis de saldos de Acceso de Terceros a la Red

**Características**:

- Importación de archivos saldoATR
- Análisis comparativo de periodos
- Detección de inconsistencias
- Visualización de saldos históricos

**Acceso**: `/saldo-atr`

### Heat Map de Consumos

**Propósito**: Visualización matricial de consumos por año/mes

**Características**:

- Matriz año × mes con código de colores
- Detección visual de anomalías
- Métricas por celda (consumo activa, promedio, máximo)
- Baseline de referencia calculado automáticamente

**Ubicación**: Componente reutilizable `HeatMapConsumo`

---

## Guías de Desarrollo

### Principios SOLID

1. **Single Responsibility**: Cada módulo tiene una única responsabilidad
2. **Open/Closed**: Extensible mediante configuración, no modificación
3. **Liskov Substitution**: Interfaces consistentes
4. **Interface Segregation**: Interfaces pequeñas y específicas
5. **Dependency Inversion**: Dependencias hacia abstracciones

### Convenciones de Código

#### Nombres en Español

```typescript
// ✅ CORRECTO - nombres descriptivos en español
const consumosPorPeriodo = agruparPorPeriodo(datos);
const detectarAnomalias = (consumos: ConsumoEnergetico[]) => { ... };

// ❌ INCORRECTO - nombres genéricos o en inglés
const data = groupByPeriod(items);
const detect = (records: Record[]) => { ... };
```

#### Tipos Centralizados

```typescript
// ✅ CORRECTO - importar de src/types/index.ts
import type { ConsumoEnergetico, Anomalia } from '@types';

// ❌ INCORRECTO - declarar tipos inline
interface MyConsumo {
  fecha: string;
  consumo: number;
}
```

#### Servicios como Funciones Puras

```typescript
// ✅ CORRECTO - función pura sin efectos secundarios
export const calcularPromedio = (valores: number[]): number => {
  return valores.reduce((a, b) => a + b, 0) / valores.length;
};

// ❌ INCORRECTO - mutación de estado o efectos secundarios
let total = 0;
export const calcularPromedio = (valores: number[]) => {
  total = valores.reduce((a, b) => a + b, 0);
  console.log(total); // ❌ efectos secundarios
  return total / valores.length;
};
```

#### Documentación JSDoc

```typescript
/**
 * Detecta anomalías en una serie de consumos por periodo
 * @param consumosPorPeriodo - Array de consumos agrupados mensualmente
 * @returns Array de anomalías detectadas con tipo y severidad
 */
export const detectarAnomalias = (consumosPorPeriodo: ConsumoPeriodo[]): Anomalia[] => {
  // ...
};
```

### Crear un Nuevo Componente

```bash
# 1. Crear carpeta
mkdir src/components/MiComponente

# 2. Crear archivos
src/components/MiComponente/
├── MiComponente.tsx       # Lógica + JSX
├── MiComponente.css       # Estilos (usar variables CSS)
└── index.ts               # export { MiComponente } from './MiComponente';

# 3. Exportar en barrel
# src/components/index.ts
export { MiComponente } from './MiComponente';
```

### Crear un Nuevo Servicio

```typescript
// src/services/miServicio.ts

import type { MiTipo } from '@types';

/**
 * Descripción del servicio
 */
export const procesarDatos = (datos: MiTipo[]): ResultadoProcesamiento => {
  // Lógica pura sin estado ni efectos secundarios
  return resultado;
};

// Exportar en src/services/index.ts
export { procesarDatos } from './miServicio';
```

---

## Testing

### Estado Actual

El proyecto NO tiene tests implementados actualmente.

### Roadmap de Testing (FASE 4 - Planificada)

#### 1. Configuración

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

#### 2. Tests Unitarios Prioritarios

**Servicios**:

- `anomaliaService.detectarAnomalias()`
- `dataService.agruparPorPeriodo()`
- `clasificadorExpedienteService.clasificarExpediente()`

**Utilidades**:

- `calcularEstadisticas()`
- `formatearFecha()`
- `validarConsumo()`

#### 3. Tests de Integración

**Hooks**:

- `useProcesarDatos` (combinación de servicios)
- `useImportarArchivos` (flujo completo de importación)

#### 4. Objetivo de Cobertura

- **Servicios**: 80% coverage
- **Utilidades**: 90% coverage
- **Hooks**: 60% coverage
- **Componentes**: 40% coverage

---

## Despliegue

### Build de Producción

```bash
# Generar build optimizado
npm run build

# Resultado en carpeta dist/
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # Código principal
│   ├── react-vendor-[hash].js
│   ├── chart-vendor-[hash].js
│   └── *.css
```

### Code Splitting Configurado

El proyecto usa **code splitting** para optimizar la carga:

| Chunk               | Contenido                     | Tamaño Aprox. |
| ------------------- | ----------------------------- | ------------- |
| `react-vendor`      | React, ReactDOM, React Router | 43 KB         |
| `chart-vendor`      | Recharts                      | <1 KB         |
| `icons-vendor`      | Lucide React                  | 7 KB          |
| `utils-vendor`      | XLSX                          | 425 KB        |
| `expediente`        | ExpedienteTipoV + componentes | 75 KB         |
| `saldo-atr`         | SaldoATR + componentes        | 17 KB         |
| `services-analisis` | Servicios de análisis         | 23 KB         |
| `services-data`     | Servicios de datos            | 4 KB          |

### Despliegue en Vercel

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# O usar GitHub integration automática
```

Configuración en `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Despliegue en Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

---

## Contribución

### Workflow de Desarrollo

1. **Crear rama desde `main`**:

   ```bash
   git checkout -b feature/mi-funcionalidad
   ```

2. **Desarrollar siguiendo convenciones**:
   - Usar path aliases
   - Respetar paleta de colores
   - Documentar con JSDoc
   - Escribir código TypeScript estricto

3. **Validar antes de commit**:

   ```bash
   npm run validate
   ```

4. **Commit con mensaje descriptivo**:

   ```bash
   git commit -m "feat: agregar análisis de picos de consumo"
   ```

5. **Push y crear Pull Request**

### Convenciones de Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `refactor:` Refactorización sin cambios funcionales
- `docs:` Cambios en documentación
- `style:` Formateo, sin cambios de código
- `test:` Agregar o modificar tests
- `chore:` Mantenimiento general

### Checklist de Pull Request

- [ ] Código formateado con Prettier
- [ ] Sin errores de ESLint
- [ ] Sin errores de TypeScript
- [ ] Build pasa exitosamente
- [ ] Funciones documentadas con JSDoc
- [ ] Path aliases usados correctamente
- [ ] Variables CSS respetadas
- [ ] Sin console.log o debugger

---

## Licencia

Este proyecto es propietario. Todos los derechos reservados.

---

## Contacto

**Desarrollador Principal**: Jullieth Lozano Hidalgo  
**Repositorio**: [https://github.com/lozanohidalgoj-cyber/valorapp-v2](https://github.com/lozanohidalgoj-cyber/valorapp-v2)

---

**ValorApp v2** - Análisis energético profesional y confiable
