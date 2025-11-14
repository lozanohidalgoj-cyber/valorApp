/**
 * Tipos TypeScript para HeatMapConsumo
 */
import type { ConsumoMensual, DerivacionData } from '../../types';

export interface HeatMapConsumoProps {
  datos: ConsumoMensual[];
  detallesPorPeriodo?: Record<string, DerivacionData[]>;
  onCellClick?: (periodo: string) => void;
}

export type HeatmapMetricId =
  | 'consumoActiva'
  | 'promedioActiva'
  | 'maximetro'
  | 'energiaReconstruida'
  | 'deteccionAnomalias';

export interface HeatmapMetricConfig {
  id: HeatmapMetricId;
  titulo: string;
  descripcion: string;
  unidad: string;
  motivoClave?: string;
  decimales?: number;
  extractor: (dato: ConsumoMensual) => number;
}

export interface DetalleActivo {
  periodo: string;
  año: number;
  mes: number;
  registros: DerivacionData[];
  valor: number;
  metrica: HeatmapMetricConfig;
}

export interface CambioTitular {
  fecha: string;
  activo: boolean;
}

export interface FechaActa {
  fecha: string;
  activo: boolean;
}
