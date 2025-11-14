/**
 * ⚙️ Constantes de Configuración
 * Configuraciones y umbrales de la aplicación
 */

export const STORAGE_KEYS = {
  DERIVACION_DATA: 'valorapp_derivacion_data',
  FILTROS_APLICADOS: 'valorapp_filtros_aplicados',
  ULTIMA_SESION: 'valorapp_ultima_sesion',
  CONFIGURACION: 'valorapp_configuracion',
} as const;

export const UMBRALES_ANOMALIA = {
  DESCENSO_MINIMO: 15,
  DESCENSO_ABRUPTO: 30,
  CONSUMO_CERO: 5,
  FACTOR_DESVIACION: 2,
  VARIACION_MENSUAL: 40,
} as const;

export const LIMITES = {
  MAX_LOGS: 100,
  MAX_FILE_SIZE_MB: 10,
  PAGINATION_SIZE: 50,
  MAX_REGISTROS_EXPORTACION: 10000,
} as const;

export const FORMATOS_ARCHIVO = {
  CSV: '.csv',
  JSON: '.json',
  EXCEL: '.xlsx',
} as const;

export const MENSAJES_ERROR = {
  ARCHIVO_NO_SOPORTADO: 'Formato de archivo no soportado',
  ERROR_LECTURA: 'Error al leer el archivo',
  ERROR_EXPORTACION: 'Error al exportar los datos',
  DATOS_INVALIDOS: 'Los datos proporcionados no son válidos',
  SIN_DATOS: 'No hay datos disponibles',
} as const;
