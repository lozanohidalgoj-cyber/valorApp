/**
 * 📊 Componente de Resumen de Análisis
 * Muestra estadísticas generales del análisis de consumo
 */

import type { ResultadoAnalisis } from '../../../types';

interface ResumenAnalisisProps {
  resultado: ResultadoAnalisis;
}

export const ResumenAnalisis = ({ resultado }: ResumenAnalisisProps) => {
  // El resumen visual se deshabilitó por requerimiento para eliminar los banners de métricas.
  void resultado;
  return null;
};
