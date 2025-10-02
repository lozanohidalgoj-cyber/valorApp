// Storage Keys
export const STORAGE_KEYS = {
  AUTH: 'valorApp.auth',
  USERS: 'valorApp.users',
  REGISTROS: 'valorApp.registros',
  TRIGGER_IMPORT: 'valorApp.triggerImportATR',
} as const

// UI Constants
export const UI_TEXT = {
  APP_TITLE: 'ValorApp',
  APP_SUBTITLE: 'Valoracion',
  BRAND: 'Ayesa',
  LOGIN: {
    TITLE: 'Iniciar Sesión',
    USERNAME_PLACEHOLDER: 'Ingrese su usuario',
    PASSWORD_PLACEHOLDER: 'Ingrese su contraseña',
    REMEMBER_LABEL: 'Recordar credenciales',
    REGISTER_LINK: '¿No tienes cuenta? Regístrate',
    INVALID_CREDENTIALS: 'Credenciales no válidas',
  },
  LOADING: {
    LOGIN: 'Ingresando…',
    LOADING: 'Cargando...',
  },
} as const

// Routes
export const ROUTES = {
  HOME: '#/',
  LOGIN: '#/login',
  REGISTER: '#/registro',
  NEW_RECORD: '#/nuevo',
  CHANGE_PASSWORD: '#/coordinador/cambiar-password',
  USER_MANAGEMENT: '#/coordinador/usuarios',
} as const

// Business Constants
export const BUSINESS_RULES = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['.csv', 'text/csv'],
} as const