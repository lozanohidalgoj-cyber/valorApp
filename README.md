# ValorApp

**Aplicación enfocada al análisis de consumo energético y la detección de anomalías**

Aplicación web especializada para el análisis inteligente de consumo energético basada en registros ATR (información de contadores eléctricos). Su objetivo principal es detectar anomalías en el consumo que puedan indicar fraudes, averías o comportamientos atípicos en el sistema eléctrico.

## 🚀 Características principales

### 🔍 **Detección de Anomalías**
- **Algoritmo de 3 criterios** para detectar consumos anómalos
- **Detección de fraudes** energéticos (manipulación de contadores)
- **Identificación de averías** (consumos atípicamente bajos)
- **Persistencia temporal** (anomalías sostenidas vs. temporales)
- **Ajuste estacional** (considera patrones históricos por mes)

### � **Análisis de Consumo**
- **Visualización con mapa de calor** (rojo=bajo/anómalo, verde=normal)
- **Agregación mensual** de consumos kWh
- **Análisis de variación porcentual** entre períodos
- **Cálculo de promedios estacionales**
- **Highlighting interactivo** de filas y celdas anómalas

### 🛠️ **Funcionalidades adicionales**
- **Sin autenticación**: Acceso libre sin gestión de usuarios
- **Gestión de registros ATR**: Crear, editar y eliminar registros de consumo
- **Análisis de expedientes**: Importación y análisis de archivos Excel/CSV
- **WART**: Funcionalidad especializada con checklist de validación
- **Exportación**: Generación de saldo ATR y exportación de datos
- **Interfaz moderna**: React + TypeScript + Vite

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone <repo-url>

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

## 📜 Scripts disponibles

- `npm run dev` — Servidor de desarrollo (http://localhost:5173)
- `npm run build` — Compilar para producción
- `npm run preview` — Vista previa del build
- `npm run lint` — Verificar código con ESLint
- `npm run lint:fix` — Corregir problemas de linting
- `npm run test` — Ejecutar tests con Vitest
- `npm run typecheck` — Verificar tipos TypeScript

## 🏗️ Arquitectura

### Stack tecnológico
- **React 18** con TypeScript
- **Vite** como bundler y dev server
- **Context API** para gestión de estado
- **CSS Modules** para estilos
- **Vitest** para testing

### Estructura de carpetas
```
src/
├── components/      # Componentes reutilizables
├── pages/          # Páginas principales
├── hooks/          # Hooks personalizados
├── services/       # Servicios y lógica de negocio
├── state/          # Gestión de estado global
├── types/          # Tipos e interfaces TypeScript
├── utils/          # Utilidades y helpers
└── constants/      # Constantes y configuración
```

### Rutas disponibles
- `#/` — Dashboard principal
- `#/wart` — Módulo WART
- `#/analisis-expediente` — Análisis de expedientes
- `#/export-saldo-atr` — Exportación de saldo ATR
- `#/ver-saldo-atr` — Vista previa de saldo ATR

## 🚢 Despliegue en Vercel

1. Conectar repositorio en Vercel
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy

La aplicación usa enrutado por hash (`#/`), por lo que funciona sin configuración adicional del servidor.

## 📝 Notas de desarrollo

- Persistencia de datos en `localStorage`
- Sin backend ni autenticación
- Optimizado para rendimiento con React.memo y hooks
- Código formateado con Prettier y ESLint

## 📄 Licencia

Proyecto privado - Todos los derechos reservados
