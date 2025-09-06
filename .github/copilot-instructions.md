# ValorApp – Guía para agentes (Copilot)

## Visión general
Aplicación corporativa para valoración de consumo energético basada en registros ATR (información de contadores de clientes). Permite crear/gestionar registros, distinguir gestión por avería/fraude y marcar valores estimados o reales.

## Arquitectura y patrones clave
- Contextos anidados: `AuthProvider` envuelve `StoreProvider` en `src/main.tsx`.
- Persistencia: Auth en localStorage o sessionStorage según “remember”; Store en localStorage con clave `valorApp.registros`.
- Errores de contexto: `useAuth`/`useStore` lanzan error si se usan fuera de sus providers (mensaje en español).
- SPA por hash: hook `useHashRoute()` en `src/App.tsx`; rutas: `#/login`, `#/`, `#/nuevo` (sin react-router).
- Guard de autenticación: si no hay sesión → redirección a `#/login`.
- Navegación: sidebar con enlace activo usando clase `.active`.

## Modelo de dominio (src/types/atr.ts)
- `ATRRegistro`: `{ id, clienteId, fechaISO, gestion, fraudeTipo?, valorTipo, kWh, notas? }`.
- `gestion`: `'averia' | 'fraude'`; si es `'fraude'` entonces `fraudeTipo` es requerido en UI.
- `valorTipo`: `'estimado' | 'real'`.
- Fechas en ISO (`YYYY-MM-DD`) en formularios y `toLocaleDateString('es-ES')` para mostrar.

## UI y estilos
- Sistema de diseño en `src/index.css` con tokens (azul corporativo `#1f4788`, grises, sombras, radios) y utilidades: `.btn`, `.btn-primary`, `.card`, `.table-container`, `.form-group`, `.text-error`, `.text-success`, `.btn-sm`, `.flex`, `.gap-4`.
- Layout corporativo en `src/App.css`: `.app-layout` con `.sidebar` + `.main-content` y `header`.
- Patrones de tabla: contenedor `.table-container`, hover y bordes sutiles.

## Páginas y patrones
- `src/pages/Login.tsx`: login demo; `login()` devuelve booleano; “Recordar credenciales” decide localStorage vs sessionStorage.
- `src/pages/Nuevo.tsx`: formulario con grid 2 columnas; mostrar selector de fraude solo si `gestion === 'fraude'`; tras guardar → `window.location.hash = '#/'`.
- `src/pages/Lista.tsx`: filtros con `useMemo` (texto/gestión/valor); estados vacíos diferenciados; totales de kWh.

## Estado y datos
- `src/state/StoreContext.tsx`: acciones `add/remove/clear`; serializa `registros` en localStorage (`valorApp.registros`).
- `src/auth/AuthContext.tsx`: demo auth (cualquier usuario/contraseña) con token `'demo-token'`.

## Flujo de desarrollo
- Ejecutar en Windows: `npm.cmd run dev` (evita problemas de PowerShell ExecutionPolicy). Tarea de VS Code: “Vite dev (valorApp)”.
- Build: `npm run build`; Preview: `npm run preview`.

## Convenciones del proyecto
- Texto UI y comentarios en español; uso opcional de emojis (📋, ➕, 🗑️) para jerarquía visual.
- Importaciones TS sin extensión (`import App from './App'`).
- Números en inputs: `parseFloat(e.target.value) || 0`.
- Mantener el enrutado por hash y clases de diseño existentes al agregar vistas.

## Archivos clave
- `src/App.tsx` (router por hash, layout, navegación)
- `src/index.css` (tokens y componentes de diseño)
- `src/App.css` (layout corporativo)
- `src/auth/AuthContext.tsx` (auth + persistencia)
- `src/state/StoreContext.tsx` (store + persistencia)
- `src/pages/Lista.tsx`, `src/pages/Nuevo.tsx`, `src/pages/Login.tsx`
- `src/types/atr.ts` (tipos de dominio)

## Próximas integraciones (para agentes)
- Importación ATR desde Excel (p. ej., SheetJS): mapear a `ATRRegistro` y validar reglas de negocio.
- Cálculos de valoración (`Valoracion`): definir reglas según gestión/fraude/valor.
- Autenticación real con backend: sustituir demo en `AuthContext.tsx`.
