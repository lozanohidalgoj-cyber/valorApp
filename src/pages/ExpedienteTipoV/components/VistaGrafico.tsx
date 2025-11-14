/**
 * Vista de gráfico de evolución mensual
 */

import { useMemo } from 'react';
import { Download } from 'lucide-react';
import type { ConsumoMensual } from '../../../types';
import { formatearNumero } from '../../../utils';
import { analizarComportamientoMensual } from '../../../services/analisisConsumoService';
import { useGraficoCalculos } from './VistaGrafico/index';

interface VistaGraficoProps {
  comparativaMensual: ConsumoMensual[];
  onExportar: () => void;
}

export const VistaGrafico = ({ comparativaMensual, onExportar }: VistaGraficoProps) => {
  const datosVacios = comparativaMensual.length === 0;

  const gradientId = useMemo(() => `grafico-area-${Math.random().toString(36).slice(2, 9)}`, []);
  const analisisPorPeriodo = useMemo(
    () => analizarComportamientoMensual(comparativaMensual),
    [comparativaMensual]
  );

  // Usar hook personalizado para cálculos del gráfico
  const { maxConsumo, minConsumo, promedioConsumo, totalBajasConsumo, totalMeses, graficoConfig } =
    useGraficoCalculos({ comparativaMensual, analisisPorPeriodo });

  if (datosVacios || !graficoConfig) {
    return (
      <div className="expediente-grafico-wrapper expediente-grafico-wrapper--empty">
        <div className="grafico-header">
          <h3>📈 Evolución del Consumo Mensual</h3>
          <p>
            No hay datos suficientes para construir el gráfico. Importa un archivo para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="expediente-grafico-wrapper">
      <div className="grafico-header">
        <div>
          <h3>📈 Evolución del Consumo Mensual</h3>
          <p>
            Tendencia de consumo activo con referencia al promedio y bajas de consumo destacadas
          </p>
        </div>
        <span className="grafico-tag" aria-label={`Meses analizados: ${totalMeses}`}>
          {totalMeses} meses
        </span>
      </div>

      <div className="grafico-container">
        <svg
          className="grafico-svg"
          role="img"
          aria-label="Gráfico de evolución del consumo mensual"
          viewBox={`0 0 ${graficoConfig.width} ${graficoConfig.height}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {graficoConfig.gridLines.map((linea, indice) => (
            <g key={`grid-${indice}`} className="grafico-grid">
              <line
                x1={graficoConfig.paddingX}
                y1={linea.y}
                x2={graficoConfig.width - graficoConfig.paddingX}
                y2={linea.y}
                className="grafico-grid-line"
              />
              <text
                x={graficoConfig.paddingX - 2}
                y={linea.y + 1.5}
                className="grafico-grid-label"
                textAnchor="end"
              >
                {formatearNumero(linea.valor)} kWh
              </text>
            </g>
          ))}

          <line
            x1={graficoConfig.paddingX}
            y1={graficoConfig.promedioY}
            x2={graficoConfig.width - graficoConfig.paddingX}
            y2={graficoConfig.promedioY}
            className="grafico-promedio-line"
          />
          <text
            x={graficoConfig.width - graficoConfig.paddingX}
            y={graficoConfig.promedioY - 1.5}
            className="grafico-promedio-label"
            textAnchor="end"
          >
            Promedio {formatearNumero(promedioConsumo)} kWh
          </text>

          <path d={graficoConfig.areaPath} className="grafico-area" fill={`url(#${gradientId})`} />
          <path d={graficoConfig.lineaPath} className="grafico-line" fill="none" />

          {graficoConfig.puntos.map((punto, indice) => (
            <g key={`${punto.mes.periodo}-${indice}`} className="grafico-punto-grupo">
              <circle
                className={`grafico-punto ${punto.bajaConsumo ? 'grafico-punto--anomalia' : ''}`}
                cx={punto.x}
                cy={punto.y}
                r={punto.bajaConsumo ? 1.2 : 0.8}
              >
                <title>
                  {`${punto.etiqueta}: ${formatearNumero(punto.mes.consumoTotal)} kWh • ${punto.comportamiento}`}
                </title>
              </circle>
              {punto.bajaConsumo && (
                <circle className="grafico-punto-onda" cx={punto.x} cy={punto.y} r={2.6} />
              )}
            </g>
          ))}

          <line
            x1={graficoConfig.paddingX}
            y1={graficoConfig.height - graficoConfig.paddingY}
            x2={graficoConfig.width - graficoConfig.paddingX}
            y2={graficoConfig.height - graficoConfig.paddingY}
            className="grafico-eje-base"
          />
        </svg>
      </div>

      <div className="grafico-eje-x" role="presentation">
        {graficoConfig.puntos.map((punto) => (
          <span
            key={`label-${punto.mes.periodo}`}
            className={`grafico-eje-x-item ${punto.bajaConsumo ? 'grafico-eje-x-item--anomalia' : ''}`}
          >
            <strong>{punto.etiqueta}</strong>
            <small>{formatearNumero(punto.mes.consumoTotal)} kWh</small>
          </span>
        ))}
      </div>

      <div className="grafico-stats">
        <div className="stat-card">
          <span className="stat-label">📊 Máximo</span>
          <span className="stat-value">{formatearNumero(maxConsumo)} kWh</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">📉 Mínimo</span>
          <span className="stat-value">{formatearNumero(minConsumo)} kWh</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">📈 Promedio</span>
          <span className="stat-value">{formatearNumero(promedioConsumo)} kWh</span>
        </div>
        <div className="stat-card anomalia-card">
          <span className="stat-label">⚠️ Bajas de consumo</span>
          <span className="stat-value">{totalBajasConsumo}</span>
        </div>
      </div>

      <div className="grafico-leyenda">
        <div className="leyenda-item">
          <span className="leyenda-icono leyenda-icono--normal" aria-hidden="true" />
          <span>Consumo normal</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-icono leyenda-icono--anomalia" aria-hidden="true" />
          <span>Baja de consumo destacada</span>
        </div>
      </div>

      <div className="expediente-export-buttons expediente-export-bottom">
        <button
          className="btn-export btn-export-complete"
          onClick={onExportar}
          title="Exportar análisis completo"
        >
          <Download size={16} />
          Exportar Análisis Completo
        </button>
      </div>
    </div>
  );
};
