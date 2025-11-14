/**
 * Utilidades para el componente BannerClasificacionExpediente
 */
import {
  AlertOctagon,
  AlertTriangle,
  Wrench,
  Umbrella,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import type { ResultadoClasificacionExpediente } from '../../types';

/**
 * Determina la clase CSS según la clasificación del expediente
 */
export const obtenerClaseClasificacion = (
  clasificacion: ResultadoClasificacionExpediente['clasificacion']
): string => {
  switch (clasificacion) {
    case 'Descenso sostenido':
      return 'banner-clasificacion--descenso-sostenido';
    case 'Anomalía indeterminada':
      return 'banner-clasificacion--anomalia-indeterminada';
    case 'No objetivo por cambio de potencia':
      return 'banner-clasificacion--cambio-potencia';
    case 'No anomalía - 0 esperado':
      return 'banner-clasificacion--cero-esperado';
    case 'Consumo bajo con picos':
      return 'banner-clasificacion--bajo-con-picos';
    default:
      return 'banner-clasificacion--neutral';
  }
};

/**
 * Determina el ícono según la clasificación del expediente
 */
export const obtenerIconoClasificacion = (
  clasificacion: ResultadoClasificacionExpediente['clasificacion']
): React.ReactNode => {
  const iconProps = { size: 28, strokeWidth: 2 };
  switch (clasificacion) {
    case 'Descenso sostenido':
      return <AlertOctagon {...iconProps} />;
    case 'Anomalía indeterminada':
      return <AlertTriangle {...iconProps} />;
    case 'No objetivo por cambio de potencia':
      return <Wrench {...iconProps} />;
    case 'No anomalía - 0 esperado':
      return <Umbrella {...iconProps} />;
    case 'Consumo bajo con picos':
      return <TrendingDown {...iconProps} />;
    default:
      return <BarChart3 {...iconProps} />;
  }
};

/**
 * Formatea una fecha al formato español legible
 */
export const formatearFechaClasificacion = (fecha: Date | null): string => {
  if (!fecha) return '-';
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
  }).format(fecha);
};
