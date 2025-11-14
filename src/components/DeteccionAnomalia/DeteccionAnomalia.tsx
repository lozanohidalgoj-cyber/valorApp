/**
 * 🎯 Componente de Detección de Anomalías
 * Mapa de calor especializado que usa CONSUMO PROMEDIO DIARIO para detectar anomalías
 * con mayor precisión que el consumo total mensual
 */

import { memo, useMemo, useCallback } from 'react';
import type { ConsumoMensual } from '../../types';
import { formatearNumero } from '../../utils';
import { useDeteccionAnomalia } from './useDeteccionAnomalia';
import type { CeldaAnomalia } from './useDeteccionAnomalia';
import {
  NOMBRES_MESES,
  organizarDatosPorAñoMes,
  calcularEstadisticasAnomalias,
} from './deteccionHelpers';
import './DeteccionAnomalia.css';

interface DeteccionAnomaliaProps {
  datos: ConsumoMensual[];
  onCellClick?: (periodo: string) => void;
}

const DeteccionAnomaliaComponent = ({ datos, onCellClick }: DeteccionAnomaliaProps) => {
  const { baseline, celdas, años } = useDeteccionAnomalia(datos);

  // Organizar datos por año y mes
  const datosPorAñoMes = useMemo(() => organizarDatosPorAñoMes(celdas, años), [celdas, años]);

  // Estadísticas de anomalías
  const { conteoAnomalias, porcentajeAnomalias } = useMemo(
    () => calcularEstadisticasAnomalias(celdas),
    [celdas]
  );

  const handleCellClick = useCallback(
    (celda: CeldaAnomalia) => {
      if (onCellClick) {
        onCellClick(celda.periodo);
      }
    },
    [onCellClick]
  );

  return (
    <div className="deteccion-anomalia">
      <div className="deteccion-anomalia__header">
        <h2>🎯 Detección de Anomalías (Consumo Promedio Diario)</h2>
        <div className="deteccion-anomalia__stats">
          <span className="stat">
            <strong>Baseline:</strong> {formatearNumero(baseline, 1)} kWh/día
          </span>
          <span className="stat">
            <strong>Anomalías:</strong> {conteoAnomalias}/{celdas.length} (
            {porcentajeAnomalias.toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="deteccion-anomalia__legend">
        <div className="legend-item">
          <div className="legend-color legend-color--normal"></div>
          <span>Normal (60-150%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-color--moderado"></div>
          <span>Moderado (40-60% o &gt;150%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-color--alto"></div>
          <span>Alto (20-40%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-color--critico"></div>
          <span>Crítico (&lt;20% o 0)</span>
        </div>
      </div>

      {años.length === 0 ? (
        <div className="deteccion-anomalia__empty">
          <p>No hay datos disponibles para el análisis de anomalías</p>
        </div>
      ) : (
        <div className="deteccion-anomalia__table-container">
          <table className="deteccion-anomalia__table">
            <thead>
              <tr>
                <th className="año-header">Año</th>
                {NOMBRES_MESES.map((nombreMes, mesIndex) => (
                  <th key={mesIndex} className="mes-header">
                    {nombreMes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {años.map((año) => (
                <tr key={año}>
                  <td className="año-cell">{año}</td>
                  {Array.from({ length: 12 }, (_, mesIndex) => {
                    const mesNumero = mesIndex + 1;
                    const celda = datosPorAñoMes[año][mesNumero];

                    if (!celda) {
                      return <td key={mesNumero} className="celda celda--vacia"></td>;
                    }

                    return (
                      <td
                        key={mesNumero}
                        className={`celda celda--${celda.severidad} ${celda.esAnomalia ? 'celda--anomalia' : ''}`}
                        onClick={() => handleCellClick(celda)}
                        title={`${celda.periodo} - ${celda.descripcion}
${formatearNumero(celda.consumoPromedioDiario, 1)} kWh/día (${celda.dias} días)
Total mes: ${formatearNumero(celda.consumoTotal)} kWh`}
                      >
                        <div className="celda__valor">
                          {formatearNumero(celda.consumoPromedioDiario, 1)}
                        </div>
                        <div className="celda__dias">{celda.dias}d</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="deteccion-anomalia__info">
        <p>
          <strong>💡 Información:</strong> Este mapa usa el <em>consumo promedio diario</em> para
          detectar anomalías con mayor precisión que el consumo total mensual, normalizando las
          diferencias de días por periodo.
        </p>
      </div>
    </div>
  );
};

export const DeteccionAnomalia = memo(DeteccionAnomaliaComponent);
