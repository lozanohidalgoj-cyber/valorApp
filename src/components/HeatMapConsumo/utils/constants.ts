/**
 * Constantes y configuraciones para HeatMapConsumo
 */
import type { ConsumoMensual } from '../../../types';
import type { HeatmapMetricConfig } from '../../HeatMapConsumo/types';
import {
  extraerConsumoActiva,
  extraerPromedioActiva,
  extraerMaximetro,
  extraerEnergiaReconstruida,
} from '../../../services/extractorMetricasService';

/**
 * Configuración de métricas disponibles en el HeatMap
 */
export const METRICAS: HeatmapMetricConfig[] = [
  {
    id: 'consumoActiva',
    titulo: 'Consumo de Energía Activa',
    descripcion: 'Energía activa total del periodo',
    unidad: 'kWh',
    motivoClave: 'Consumo Total kWh',
    decimales: 2,
    extractor: extraerConsumoActiva,
  },
  {
    id: 'promedioActiva',
    titulo: 'Promedio de Energía Activa',
    descripcion: 'Promedio diario de energía activa',
    unidad: 'kWh/día',
    motivoClave: 'Promedio kWh/día',
    decimales: 2,
    extractor: extraerPromedioActiva,
  },
  {
    id: 'maximetro',
    titulo: 'Maxímetro',
    descripcion: 'Potencia máxima registrada',
    unidad: 'kW',
    motivoClave: 'Maxímetro kW',
    decimales: 3,
    extractor: extraerMaximetro,
  },
  {
    id: 'energiaReconstruida',
    titulo: 'Energía Activa Reconstruida',
    descripcion: 'Suma de A + B + C',
    unidad: 'kWh',
    motivoClave: 'Energía Reconstruida',
    decimales: 2,
    extractor: extraerEnergiaReconstruida,
  },
  {
    id: 'deteccionAnomalias',
    titulo: 'Detección de Anomalías',
    descripcion: 'Visualización de anomalías vs baseline',
    unidad: '%',
    decimales: 1,
    extractor: (dato: ConsumoMensual) => dato.consumoPromedioDiario,
  },
];

/**
 * Campos a mostrar en el panel de detalle (solo keys)
 */
export const CAMPOS_DETALLE = [
  'Código de contrato externo - interfaz',
  'Número Fiscal de Factura',
  'Secuencial de factura',
  'Nombre de Cliente',
  'Fecha desde',
  'Fecha hasta',
  'Número días periodo',
  'Código de tarifa de acceso',
  'Potencia',
  'Consumo Total kWh',
  'Promedio kWh/día',
  'Maxímetro kW',
  'Energía Reconstruida',
  'Energía Activa A+',
  'Energía Activa B+',
  'Energía Activa C+',
  'Fecha Alta Titular',
  'Fecha Acta de Puesta en Servicio',
] as const;

/**
 * Mapeo de campos a etiquetas legibles
 */
export const LABELS_DETALLE: Record<string, string> = {
  'Código de contrato externo - interfaz': 'Contrato',
  'Número Fiscal de Factura': 'Nº Fiscal',
  'Secuencial de factura': 'Secuencial',
  'Nombre de Cliente': 'Cliente',
  'Fecha desde': 'Desde',
  'Fecha hasta': 'Hasta',
  'Número días periodo': 'Días',
  'Código de tarifa de acceso': 'Tarifa',
  Potencia: 'Potencia (kW)',
  'Consumo Total kWh': 'Consumo (kWh)',
  'Promedio kWh/día': 'Promedio (kWh/día)',
  'Maxímetro kW': 'Maxímetro (kW)',
  'Energía Reconstruida': 'E. Reconstruida',
  'Energía Activa A+': 'E. Activa A+',
  'Energía Activa B+': 'E. Activa B+',
  'Energía Activa C+': 'E. Activa C+',
  'Fecha Alta Titular': 'Alta Titular',
  'Fecha Acta de Puesta en Servicio': 'Acta Servicio',
};

/**
 * Nombres de meses en formato corto (3 letras)
 */
export const NOMBRES_MESES_CORTO = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
] as const;

/**
 * Nombres de meses en formato largo
 */
export const NOMBRES_MESES_LARGO = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;
