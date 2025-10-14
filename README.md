# ValorApp

Aplicación web para valoración de consumo energético basada en registros ATR.

## 🚀 Características

- **Sin autenticación**: Acceso libre sin gestión de usuarios
- **Gestión de registros ATR**: Crear, editar y eliminar registros de consumo
- **Análisis de expedientes**: Importación y análisis de archivos Excel
- **WART**: Funcionalidad especializada
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
