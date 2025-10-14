// Storage Keys
export const STORAGE_KEYS = {
  REGISTROS: 'valorApp.registros',
  TRIGGER_IMPORT: 'valorApp.triggerImportATR',
  SIDEBAR_OPEN: 'valorApp.sidebarOpen',
  WELCOME_SEEN: 'valorApp.welcome.seen',
} as const

// UI Constants
export const UI_TEXT = {
  APP_TITLE: 'ValorApp',
  APP_SUBTITLE: 'Valoración Energética',
  BRAND: 'Ayesa',
  LOADING: {
    LOADING: 'Cargando...',
  },
} as const

// Routes
export const ROUTES = {
  HOME: '#/',
  WART: '#/wart',
  ANALISIS_EXPEDIENTE: '#/analisis-expediente',
  EXPORT_SALDO_ATR: '#/export-saldo-atr',
  VER_SALDO_ATR: '#/ver-saldo-atr',
} as const

// Business Constants
export const BUSINESS_RULES = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['.csv', 'text/csv'],
} as const