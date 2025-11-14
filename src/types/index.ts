/**
 * 📋 Tipos y Definiciones Globales de ValorApp_v2
 *
 * Archivo centralizado de tipos TypeScript para mantener
 * consistencia en toda la aplicación.
 */

// ============================================
// 📊 Tipos de Datos de Consumo Energético
// ============================================

/**
 * Representa un registro individual de consumo energético
 */
export interface ConsumoEnergetico {
  /** Identificador único del registro */
  id: string;
  /** Fecha de la lectura (formato ISO 8601) */
  fecha: string;
  /** Consumo en kWh */
  consumo: number;
  /** Periodo de facturación (ej: "2024-01") */
  periodo: string;
  /** Número de contador */
  numeroContador: string;
  /** Cliente o contrato asociado */
  cliente?: string;
}

/**
 * Datos agregados por periodo (mes/año)
 */
export interface ConsumoPeriodo {
  /** Periodo en formato YYYY-MM */
  periodo: string;
  /** Consumo total del periodo en kWh */
  consumoTotal: number;
  /** Consumo promedio diario */
  consumoPromedio: number;
  /** Número de días del periodo */
  dias: number;
}

// ============================================
// 🔍 Tipos para Detección de Anomalías
// ============================================

/**
 * Tipo de anomalía detectada
 */
export type TipoAnomalia =
  | 'descenso_abrupto' // Descenso repentino > 30%
  | 'descenso_gradual' // Descenso progresivo
  | 'consumo_cero' // Consumo nulo o casi nulo
  | 'consumo_negativo' // Valores negativos (error)
  | 'pico_anomalo'; // Incremento inusual

/**
 * Nivel de severidad de la anomalía
 */
export type NivelSeveridad = 'baja' | 'media' | 'alta' | 'critica';

/**
 * Anomalía detectada en el consumo
 */
export interface Anomalia {
  /** ID único de la anomalía */
  id: string;
  /** Tipo de anomalía detectada */
  tipo: TipoAnomalia;
  /** Periodo donde se detectó */
  periodo: string;
  /** Fecha exacta de detección */
  fechaDeteccion: string;
  /** Nivel de severidad */
  severidad: NivelSeveridad;
  /** Porcentaje de variación respecto al promedio */
  variacionPorcentaje: number;
  /** Consumo esperado en kWh */
  consumoEsperado: number;
  /** Consumo real en kWh */
  consumoReal: number;
  /** Descripción detallada */
  descripcion: string;
  /** Es la primera anomalía en una serie */
  esPrimeraOcurrencia: boolean;
}

// ============================================
// � Tipos para Derivación Individual (Entrada de Datos)
// ============================================

/**
 * Registro completo de derivación individual (estructura del CSV)
 */
export interface DerivacionData {
  'Número Fiscal de Factura': string;
  Potencia: string;
  'Código de contrato externo - interfaz': string;
  Contrato?: string;
  'Secuencial de factura': string;
  'Tipo de factura': string;
  'Estado de la factura': string;
  'Fecha desde': string;
  'Fecha hasta': string;
  'Importe Factura': string | number;
  'Fuente de la factura': string;
  'Estado medida': string;
  'Tipo de factura (detalle)': string;
  'Tipo de Fuente Anterior': string;
  'Descripción Tipo de fuente Anterior': string;
  'Tipo de punto de medida': string;
  'Consumo P1/punta': string | number;
  'Consumo P2/llano': string | number;
  'Consumo P3/valle': string | number;
  'Consumo P4/supervalle': string | number;
  'Consumo P5': string | number;
  'Consumo P6': string | number;
  'Consumo Reactiva1': string | number;
  'Consumo Reactiva2': string | number;
  'Consumo Reactiva3': string | number;
  'Consumo Reactiva4': string | number;
  'Consumo Reactiva5': string | number;
  'Consumo Reactiva6': string | number;
  'Consumo cargo-abono P1/punta': string | number;
  'Consumo cargo-abono P2/llano': string | number;
  'Consumo cargo-abono P3/valle': string | number;
  'Consumo cargo/abono P4': string | number;
  'Consumo cargo/abono P5': string | number;
  'Consumo cargo/abono P6': string | number;
  'Consumo pérdidas P1/punta': string | number;
  'Consumo pérdidas P2/llano': string | number;
  'Consumo pérdidas P3/valle': string | number;
  'Consumo pérdidas P4': string | number;
  'Consumo pérdidas P5': string | number;
  'Consumo pérdidas P6': string | number;
  'Maxímetro P1/Punta': string | number;
  'Maxímetro P2/Llano': string | number;
  'Maxímetro P3/Valle': string | number;
  'Maxímetro P4': string | number;
  'Maxímetro P5': string | number;
  'Maxímetro P6': string | number;
  Maxímetro?: string | number;
  'Consumo Activa'?: string | number;
  'Promedio Activa'?: string | number;
  'Consumo Reactiva'?: string | number;
  'Promedio Reactiva'?: string | number;
  'Energía Total Reconstruida'?: string | number;
  'A + B + C'?: string | number;
  'AB - A'?: string | number;
  'AB - C'?: string | number;
  'Tipo de Fuente'?: string;
  'Descripción Tipo de fuente'?: string;
  P1?: string | number;
  P2?: string | number;
  P3?: string | number;
  P4?: string | number;
  P5?: string | number;
  P6?: string | number;
  Días?: string | number;
  'Consumo promedio ciclo'?: string | number;
  'Promedio ER'?: string | number;
  Origen: string;
}

// ============================================
// �📈 Tipos para Análisis y Estadísticas
// ============================================

/**
 * Estadísticas de consumo
 */
export interface EstadisticasConsumo {
  /** Promedio de consumo en kWh */
  promedio: number;
  /** Mediana de consumo */
  mediana: number;
  /** Desviación estándar */
  desviacionEstandar: number;
  /** Consumo mínimo registrado */
  minimo: number;
  /** Consumo máximo registrado */
  maximo: number;
  /** Total de registros analizados */
  totalRegistros: number;
}

/**
 * Datos anuales para Vista por Años
 */
export interface ConsumoAnual {
  /** Año */
  año: number;
  /** Suma total del consumo activo (P1+P2+P3) en kWh */
  sumaConsumoActiva: number;
  /** Máximo de maxímetro registrado en el año */
  maxMaximetro: number;
  /** Número de periodos (facturas) en el año */
  periodosFacturados: number;
  /** Suma total de días facturados */
  sumaDias: number;
  /** Promedio de consumo por día */
  promedioConsumoPorDia: number;
}

/**
 * Datos mensuales para Comparativa Mensual
 */
export interface ConsumoMensual {
  /** Año */
  año: number;
  /** Mes (1-12) */
  mes: number;
  /** Periodo en formato "YYYY-MM" */
  periodo: string;
  /** Consumo total del mes basado en energía activa */
  consumoTotal: number;
  /** Sumatoria del campo "Consumo Activa" */
  consumoActivaTotal: number;
  /** Sumatoria del campo "Promedio Activa" */
  promedioActivaTotal: number;
  /** Sumatoria del campo "Maxímetro" */
  maximetroTotal: number;
  /** Sumatoria del campo "A + B + C" / Energía reconstruida */
  energiaReconstruidaTotal: number;
  /** Consumo promedio diario */
  consumoPromedioDiario: number;
  /** Potencia promedio declarada en el periodo */
  potenciaPromedio: number | null;
  /** Variación porcentual de la potencia respecto al periodo anterior */
  variacionPotenciaPorcentual: number | null;
  /** Número de días del periodo */
  dias: number;
  /** Variación porcentual respecto al mes anterior */
  variacionPorcentual: number | null;
  /** Es anomalía (variación > 40%) */
  esAnomalia: boolean;
  /** Tipo de variación */
  tipoVariacion: 'aumento' | 'descenso' | 'estable' | null;
  /** Motivos para clasificar una anomalía */
  motivosAnomalia: string[];
  /** Registros aportados al periodo */
  registros: number;
  /** Z-Score (desviaciones estándar respecto a la media móvil de 6 meses) */
  zScore: number | null;
  /** Índice estacional (consumo actual / promedio histórico del mes * 100) */
  indiceEstacional: number | null;
  /** Tendencia en kWh/mes (calculada sobre 3 meses) */
  tendencia3M: number | null;
  /** Días transcurridos desde la última anomalía */
  diasDesdeAnomalia: number | null;
  /** Ratio Consumo/Potencia (consumo / (potencia * dias * 24)) */
  ratioConsumoPotencia: number | null;
  /** Coeficiente de variación histórico (%) */
  coeficienteVariacion: number | null;
}

/**
 * Resultado del análisis de comportamiento para un periodo mensual
 */
export interface AnalisisPeriodoConsumo {
  /** Variación histórica respecto al promedio del mismo mes en otros años */
  variacionHistorica: number | null;
  /** Variación global respecto al promedio de toda la serie */
  variacionGlobal: number | null;
  /** Comportamiento detectado (ej. Descenso brusco, Cambio de potencia) */
  comportamiento: string;
  /** Indica si los ceros observados son esperados por estacionalidad */
  ceroEsperado: boolean;
}

/**
 * Clasificación global del expediente
 */
export type ClasificacionExpediente =
  | 'No anomalía - 0 esperado'
  | 'Anomalía indeterminada'
  | 'Descenso sostenido'
  | 'No objetivo por cambio de potencia'
  | 'Consumo bajo con picos';

/**
 * Resultado de la clasificación global del expediente
 */
export interface ResultadoClasificacionExpediente {
  /** Clasificación global del expediente */
  clasificacion: ClasificacionExpediente;
  /** Periodo donde inició la anomalía (YYYY-MM) */
  inicioPeriodoAnomalia: string | null;
  /** Fecha exacta donde inició la anomalía */
  inicioFechaAnomalia: Date | null;
  /** Consumo total del periodo donde inició */
  consumoInicio: number | null;
  /** Consumo previo al inicio de la anomalía */
  consumoPrevio: number | null;
  /** Variación porcentual en el inicio */
  variacionInicio: number | null;
  /** Número de periodos con anomalía */
  periodosConAnomalia: number;
  /** Número de cambios de potencia detectados */
  cambiosPotencia: number;
  /** Periodos con consumo cero esperado */
  periodosConCeroEsperado: number;
  /** Detalle adicional (razones de la clasificación) */
  detalle: string[];
  /** Nivel de confianza de la clasificación (0-100) */
  confianza: number;
  /** Periodos con descenso temporal que luego se recuperaron */
  periodosConRecuperacion?: Array<{
    periodoDescenso: string;
    periodoRecuperacion: string;
    consumoDescenso: number;
    consumoRecuperacion: number;
    variacionDescenso: number;
  }>;
}

/**
 * Resultado completo del análisis de consumo
 */
export interface ResultadoAnalisis {
  /** Vista por años */
  vistaAnual: ConsumoAnual[];
  /** Comparativa mensual */
  comparativaMensual: ConsumoMensual[];
  /** Registros detallados agrupados por periodo YYYY-MM */
  detallesPorPeriodo: Record<string, DerivacionData[]>;
  /** Periodo total analizado */
  periodoTotal: {
    fechaInicio: string;
    fechaFin: string;
    totalAños: number;
    totalMeses: number;
  };
  /** Resumen ejecutivo */
  resumen: {
    consumoTotalGeneral: number;
    promedioAnual: number;
    maxMaximetroGeneral: number;
    totalFacturas: number;
    anomaliasDetectadas: number;
  };
}

/**
 * Comparativa entre dos periodos
 */
export interface ComparativaPeriodos {
  /** Periodo anterior */
  periodoAnterior: ConsumoPeriodo;
  /** Periodo actual */
  periodoActual: ConsumoPeriodo;
  /** Diferencia absoluta en kWh */
  diferenciaAbsoluta: number;
  /** Diferencia porcentual */
  diferenciaPorcentual: number;
  /** Tendencia: 'aumento' | 'descenso' | 'estable' */
  tendencia: 'aumento' | 'descenso' | 'estable';
}

// ============================================
// 🎨 Tipos para Visualización
// ============================================

/**
 * Punto de datos para gráficos
 */
export interface PuntoGrafico {
  /** Etiqueta del eje X */
  etiqueta: string;
  /** Valor del eje Y */
  valor: number;
  /** Color (opcional) */
  color?: string;
  /** Metadatos adicionales */
  metadata?: Record<string, unknown>;
}

/**
 * Configuración de gráfico
 */
export interface ConfiguracionGrafico {
  /** Título del gráfico */
  titulo: string;
  /** Tipo de gráfico */
  tipo: 'linea' | 'barra' | 'area' | 'circular';
  /** Datos a visualizar */
  datos: PuntoGrafico[];
  /** Mostrar leyenda */
  mostrarLeyenda?: boolean;
  /** Color primario */
  colorPrimario?: string;
  /** Color secundario */
  colorSecundario?: string;
}

// ============================================
// � Tipos para Interfaz Saldo ATR
// ============================================

/**
 * Letras de columna válidas para Interfaz Saldo ATR (A..AT)
 */
export type SaldoATRColumna =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  | 'AA'
  | 'AB'
  | 'AC'
  | 'AD'
  | 'AE'
  | 'AF'
  | 'AG'
  | 'AH'
  | 'AI'
  | 'AJ'
  | 'AK'
  | 'AL'
  | 'AM'
  | 'AN'
  | 'AO'
  | 'AP'
  | 'AQ'
  | 'AR'
  | 'AS'
  | 'AT';

/**
 * Fila de datos de la Interfaz Saldo ATR.
 * Clave: letra de columna (A..AT). Valor: string (incluye vacío).
 */
export type SaldoATRRow = Record<SaldoATRColumna, string>;

// ============================================
// �🔧 Tipos de Estado y Contexto
// ============================================

/**
 * Estado global de la aplicación
 */
export interface EstadoApp {
  /** Datos de consumo cargados */
  consumos: ConsumoEnergetico[];
  /** Anomalías detectadas */
  anomalias: Anomalia[];
  /** Periodo seleccionado actualmente */
  periodoSeleccionado: string | null;
  /** Indica si hay datos cargados */
  datosCargados: boolean;
  /** Indica si se está procesando */
  procesando: boolean;
  /** Mensaje de error (si aplica) */
  error: string | null;
}

// ============================================
// 📁 Tipos para Importación de Datos
// ============================================

/**
 * Resultado de importación de archivo
 */
export interface ResultadoImportacion {
  /** Indica si la importación fue exitosa */
  exito: boolean;
  /** Número de registros importados */
  registrosImportados: number;
  /** Errores encontrados durante la importación */
  errores: string[];
  /** Advertencias (opcional) */
  advertencias?: string[];
  /** Datos importados */
  datos: ConsumoEnergetico[];
}

/**
 * Opciones de importación
 */
export interface OpcionesImportacion {
  /** Formato del archivo */
  formato: 'csv' | 'json' | 'excel';
  /** Delimitador (para CSV) */
  delimitador?: string;
  /** Codificación del archivo */
  codificacion?: string;
  /** Validar datos al importar */
  validar?: boolean;
}
