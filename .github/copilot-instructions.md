# ValorApp – Guía para agentes (Copilot)

## Visión general
Aplicación corporativa para valoración de consumo energético basada en## Páginas y patrones

### Estructura de páginas
- **Login** (`src/pages/Login/`## Calidad de código y herramientas

### Linting y formateo
- **ESLint**: Configuración estricta con reglas de React y TypeScript
- **Prettier**: Formateo automático consistente
- **Husky**: Pre-commit hooks para calidad
- **EditorConfig**: Configuración de editor unificada

### Testing
- **Vitest**: Testing unitario rápido y moderno
- **React Testing Library**: Testing centrado en el usuario
- **MSW**: Mock Service Worker para APIs
- **Coverage**: Reportes de cobertura de código

### Performance y optimización
- **React.memo**: Para componentes puros
- **useMemo/useCallback**: Optimización de cálculos y funciones
- **Lazy loading**: Carga diferida de componentes
- **Bundle analysis**: Análisis de tamaño del bundle

## Flujo de desarrollo

### Scripts de desarrollo
```json
{
  "dev": "vite --host",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "lint:fix": "eslint src --ext ts,tsx --fix",
  "format": "prettier --write src",
  "test": "vitest",
  "test:coverage": "vitest --coverage",
  "typecheck": "tsc --noEmit"
}
```

### Workflow recomendado
1. **Desarrollo**: `npm run dev`
2. **Linting**: `npm run lint`
3. **Tests**: `npm run test`
4. **Build**: `npm run build`
5. **Preview**: `npm run preview`

## Convenciones del proyecto

### Estándares de código
- **Texto UI**: En español con emojis opcionales para jerarquía visual
- **Comentarios**: En español, concisos y útiles
- **Imports**: Sin extensiones TS, ordenados alfabéticamente
- **Números**: `parseFloat(e.target.value) || 0` para inputs numéricos
- **Funciones**: Máximo 20 líneas, una responsabilidad
- **Variables**: Nombres descriptivos, evitar abreviacionesicación demo con persistencia configurable
- **Dashboard** (`src/pages/Lista/`): Listado principal con filtros y agregaciones
- **Formularios** (`src/pages/Nuevo/`): Creación/edición de registros
- **Gestión** (`src/pages/GestionUsuarios/`): Administración de usuarios

### Patrones de implementación
- Hooks personalizados para lógica de negocio (`useLogin`, `useRegistros`, `useFormulario`)
- Componentes de formulario reutilizables con validación
- Manejo de estado local con `useState`/`useReducer` según complejidad
- Optimización con `useMemo`/`useCallback` para cálculos costosos
- Lazy loading para rutas secundarias

### Manejo de formularios
```typescript
// Patrón recomendado para formularios
const useFormulario = (initialData: FormData) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = useCallback((data: FormData) => {
    // Lógica de validación
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Lógica de envío
  }, [data, validate]);

  return { data, setData, errors, isLoading, handleSubmit };
};
```istros ATR (información de contadores de clientes). Permite crear/gestionar registros, distinguir gestión por avería/fraude y marcar valores estimados o reales.

## Arquitectura y patrones clave
- **Arquitectura modular**: Separación clara entre presentación, lógica de negocio y estado
- **Contextos anidados**: `AuthProvider` envuelve `StoreProvider` en `src/main.tsx`
- **Persistencia**: Auth en localStorage o sessionStorage según "remember"; Store en localStorage con clave `valorApp.registros`
- **Errores de contexto**: `useAuth`/`useStore` lanzan error si se usan fuera de sus providers (mensaje en español)
- **SPA por hash**: hook `useHashRoute()` en `src/App.tsx`; rutas: `#/login`, `#/`, `#/nuevo` (sin react-router)
- **Guard de autenticación**: si no hay sesión → redirección a `#/login`
- **Navegación**: sidebar con enlace activo usando clase `.active`

## Principios de desarrollo (SOLID y mejores prácticas)

### Single Responsibility Principle (SRP)
- Cada componente debe tener una única responsabilidad
- Separar lógica de presentación usando hooks personalizados
- Componentes de máximo 100-150 líneas (dividir si excede)

### Open/Closed Principle (OCP)
- Interfaces extensibles sin modificar código existente
- Uso de composición sobre herencia
- Props configurables para extensibilidad

### Liskov Substitution Principle (LSP)
- Componentes intercambiables que respetan contratos
- Interfaces consistentes para componentes similares

### Interface Segregation Principle (ISP)
- Props específicas por componente, evitar interfaces monolíticas
- Hooks especializados por funcionalidad

### Dependency Inversion Principle (DIP)
- Dependencia de abstracciones (interfaces/tipos)
- Inyección de dependencias via props/context Guía para agentes (Copilot)

## Visión general
Aplicación corporativa para valoración de consumo energético basada en registros ATR (información de contadores de clientes). Permite crear/gestionar registros, distinguir gestión por avería/fraude y marcar valores estimados o reales.

## Arquitectura y patrones clave
- Contextos anidados: `AuthProvider` envuelve `StoreProvider` en `src/main.tsx`.
- Persistencia: Auth en localStorage o sessionStorage según “remember”; Store en localStorage con clave `valorApp.registros`.
- Errores de contexto: `useAuth`/`useStore` lanzan error si se usan fuera de sus providers (mensaje en español).
- SPA por hash: hook `useHashRoute()` en `src/App.tsx`; rutas: `#/login`, `#/`, `#/nuevo` (sin react-router).
- Guard de autenticación: si no hay sesión → redirección a `#/login`.
- Navegación: sidebar con enlace activo usando clase `.active`.

## Estructura de carpetas y organización

### Arquitectura de capas
```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de UI básicos (Button, Input, Card)
│   ├── forms/          # Componentes de formularios
│   └── layout/         # Componentes de layout (Header, Sidebar)
├── pages/              # Páginas principales
├── hooks/              # Hooks personalizados
├── services/           # Servicios y APIs
├── utils/              # Utilidades y helpers
├── types/              # Tipos e interfaces TypeScript
├── constants/          # Constantes y configuraciones
├── styles/             # Estilos globales y variables CSS
└── assets/             # Recursos estáticos
```

### Convenciones de nomenclatura
- **Componentes**: PascalCase (`UserCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`)
- **Servicios**: camelCase (`authService.ts`)
- **Tipos**: PascalCase (`ATRRegistro`, `UserRole`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
- **Archivos de estilos**: kebab-case (`user-card.css`)

## Modelo de dominio (src/types/atr.ts)
- `ATRRegistro`: `{ id, clienteId, fechaISO, gestion, fraudeTipo?, valorTipo, kWh, notas? }`
- `gestion`: `'averia' | 'fraude'`; si es `'fraude'` entonces `fraudeTipo` es requerido en UI
- `valorTipo`: `'estimado' | 'real'`
- Fechas en ISO (`YYYY-MM-DD`) en formularios y `toLocaleDateString('es-ES')` para mostrar

## Patrones de componentes y estilos

### Separación de responsabilidades en componentes
- **Presentacionales**: Solo UI, reciben props y renderizan
- **Contenedores**: Manejan lógica, estado y datos
- **Hooks personalizados**: Lógica reutilizable extraída

### Estructura de componente recomendada
```typescript
// UserCard/UserCard.tsx
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  const { handleEdit } = useUserCard(user, onEdit);
  
  return (
    <div className={styles.userCard}>
      {/* JSX */}
    </div>
  );
};

// UserCard/useUserCard.ts - Hook personalizado
export const useUserCard = (user: User, onEdit?: (user: User) => void) => {
  const handleEdit = useCallback(() => {
    onEdit?.(user);
  }, [user, onEdit]);
  
  return { handleEdit };
};

// UserCard/UserCard.module.css - Estilos del componente
.userCard {
  /* estilos específicos */
}

// UserCard/index.ts - Exportación limpia
export { UserCard } from './UserCard';
export type { UserCardProps } from './UserCard';
```

### Sistema de diseño y estilos
- **Tokens de diseño** en `src/styles/tokens.css`: variables CSS para colores, espaciado, tipografía
- **Componentes base** en `src/components/ui/`: Button, Input, Card, etc.
- **Módulos CSS**: Cada componente tiene su archivo `.module.css`
- **Utilidades globales** en `src/styles/utilities.css`
- **Layout corporativo** en `src/App.css`: `.app-layout` con `.sidebar` + `.main-content`

## Páginas y patrones
- `src/pages/Login.tsx`: login demo; `login()` devuelve booleano; “Recordar credenciales” decide localStorage vs sessionStorage.
- `src/pages/Nuevo.tsx`: formulario con grid 2 columnas; mostrar selector de fraude solo si `gestion === 'fraude'`; tras guardar → `window.location.hash = '#/'`.
- `src/pages/Lista.tsx`: filtros con `useMemo` (texto/gestión/valor); estados vacíos diferenciados; totales de kWh.

## Estado y datos

### Gestión de estado global
- **AuthContext**: Autenticación y autorización centralizada
- **StoreContext**: Estado de la aplicación con persistencia
- **Reducers**: Para operaciones complejas de estado
- **Selectors**: Funciones para acceder a fragmentos específicos del estado

### Patrones de estado
```typescript
// Patrón para contextos con reducers
interface State {
  registros: ATRRegistro[];
  loading: boolean;
  error: string | null;
}

type Action = 
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: ATRRegistro[] }
  | { type: 'LOAD_ERROR'; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    // ... otros casos
    default:
      return state;
  }
};
```

### Persistencia y sincronización
- localStorage para datos del usuario y preferencias
- sessionStorage para datos temporales de sesión
- Debouncing para sincronización automática
- Manejo de errores y recuperación de datos corruptos

## Flujo de desarrollo
- Ejecutar en Windows: `npm.cmd run dev` (evita problemas de PowerShell ExecutionPolicy). Tarea de VS Code: “Vite dev (valorApp)”.
- Build: `npm run build`; Preview: `npm run preview`.

## Convenciones del proyecto
- Texto UI y comentarios en español; uso opcional de emojis (📋, ➕, 🗑️) para jerarquía visual.
- Importaciones TS sin extensión (`import App from './App'`).
- Números en inputs: `parseFloat(e.target.value) || 0`.
- Mantener el enrutado por hash y clases de diseño existentes al agregar vistas.

### Manejo de errores
- **Try/catch**: En todas las operaciones asíncronas
- **Error boundaries**: Para errores de componentes
- **Logging**: Sistema centralizado de logs
- **Fallbacks**: Interfaces de error amigables

### Accesibilidad
- **ARIA**: Labels y roles apropiados
- **Keyboard navigation**: Navegación completa por teclado
- **Color contrast**: Cumplimiento WCAG AA
- **Screen readers**: Compatibilidad con lectores de pantalla

## Archivos clave y estructura

### Archivos principales
```
src/
├── App.tsx                 # Router, layout, navegación principal
├── main.tsx               # Punto de entrada, providers
├── index.css              # Tokens de diseño y utilidades
├── App.css                # Layout corporativo
├── auth/
│   └── AuthContext.tsx    # Contexto de autenticación
├── state/
│   └── StoreContext.tsx   # Estado global de la aplicación
├── types/
│   └── atr.ts            # Tipos de dominio
└── pages/                 # Páginas principales
    ├── Login.tsx
    ├── Lista.tsx
    └── Nuevo.tsx
```

### Configuración recomendada
```
.editorconfig              # Configuración del editor
.eslintrc.json            # Reglas de linting
.prettierrc               # Configuración de formateo
.gitignore                # Archivos ignorados
tsconfig.json             # Configuración TypeScript
vite.config.ts            # Configuración del bundler
```

## Próximas integraciones y mejoras

### Funcionalidades pendientes
- **Importación ATR**: Desde Excel usando SheetJS
- **Cálculos de valoración**: Reglas según gestión/fraude/valor
- **Autenticación real**: Reemplazar demo por backend
- **Notificaciones**: Toast/snackbar para feedback
- **Exportación**: PDF/Excel de reportes
- **Filtros avanzados**: Fechas, rangos, múltiples criterios

### Optimizaciones técnicas
- **PWA**: Service worker y cache
- **Internacionalización**: i18n para múltiples idiomas
- **Dark mode**: Tema oscuro
- **Responsive**: Diseño móvil completo
- **API integration**: Conexión con backend real
