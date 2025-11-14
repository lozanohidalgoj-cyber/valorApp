/**
 * Componente: Banner de Clasificación del Expediente
 * Muestra la clasificación global del expediente en un banner destacado
 */

import { MapPin } from 'lucide-react';
import type { ResultadoClasificacionExpediente } from '../../types';
import {
  obtenerClaseClasificacion,
  obtenerIconoClasificacion,
  formatearFechaClasificacion,
} from './bannerHelpers';
import './BannerClasificacionExpediente.css';

interface BannerClasificacionExpedienteProps {
  resultado: ResultadoClasificacionExpediente;
  onIrInicio?: () => void;
}

export const BannerClasificacionExpediente = ({
  resultado,
  onIrInicio,
}: BannerClasificacionExpedienteProps) => {
  return (
    <div className={`banner-clasificacion ${obtenerClaseClasificacion(resultado.clasificacion)}`}>
      <div className="banner-clasificacion__header">
        <span className="banner-clasificacion__icono">
          {obtenerIconoClasificacion(resultado.clasificacion)}
        </span>
        <h2 className="banner-clasificacion__titulo">{resultado.clasificacion}</h2>
      </div>

      {/* Mostrar inicio de anomalía solo para clasificaciones específicas */}
      {/* NOTA: "Anomalía indeterminada" y "No objetivo por cambio de potencia" NO muestran inicio */}
      {/* - Anomalía indeterminada: no tiene un patrón claro de inicio */}
      {/* - Cambio de potencia: no es anomalía real, es un cambio contractual */}
      {['Descenso sostenido', 'Consumo bajo con picos'].includes(resultado.clasificacion) &&
        resultado.inicioPeriodoAnomalia && (
          <div className="banner-clasificacion__inicio">
            <div className="banner-clasificacion__inicio-info">
              <span className="banner-clasificacion__label">Inicio de anomalía:</span>
              <span className="banner-clasificacion__valor">
                {formatearFechaClasificacion(resultado.inicioFechaAnomalia)} (
                {resultado.inicioPeriodoAnomalia})
              </span>
            </div>

            {resultado.consumoPrevio && resultado.consumoInicio && (
              <div className="banner-clasificacion__consumos">
                <div className="banner-clasificacion__consumo">
                  <span className="banner-clasificacion__consumo-label">Consumo previo:</span>
                  <span className="banner-clasificacion__consumo-valor">
                    {resultado.consumoPrevio.toFixed(0)} kWh
                  </span>
                </div>
                <span className="banner-clasificacion__flecha">→</span>
                <div className="banner-clasificacion__consumo">
                  <span className="banner-clasificacion__consumo-label">Al inicio:</span>
                  <span className="banner-clasificacion__consumo-valor banner-clasificacion__consumo-valor--anomalo">
                    {resultado.consumoInicio.toFixed(0)} kWh
                  </span>
                </div>
                {resultado.variacionInicio && (
                  <div className="banner-clasificacion__variacion">
                    <span className="banner-clasificacion__variacion-valor">
                      {resultado.variacionInicio > 0 ? '+' : ''}
                      {resultado.variacionInicio.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {onIrInicio && (
              <button className="banner-clasificacion__btn-ir" onClick={onIrInicio}>
                <MapPin size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Ir al inicio de la anomalía
              </button>
            )}
          </div>
        )}

      <div className="banner-clasificacion__estadisticas">
        <div className="banner-clasificacion__estadistica">
          <span className="banner-clasificacion__estadistica-label">Periodos con anomalía:</span>
          <span className="banner-clasificacion__estadistica-valor">
            {resultado.periodosConAnomalia}
          </span>
        </div>

        {resultado.cambiosPotencia > 0 && (
          <div className="banner-clasificacion__estadistica">
            <span className="banner-clasificacion__estadistica-label">Cambios de potencia:</span>
            <span className="banner-clasificacion__estadistica-valor">
              {resultado.cambiosPotencia}
            </span>
          </div>
        )}

        {resultado.periodosConCeroEsperado > 0 && (
          <div className="banner-clasificacion__estadistica">
            <span className="banner-clasificacion__estadistica-label">
              {resultado.clasificacion === 'No anomalía - 0 esperado'
                ? 'Periodos con cero esperado:'
                : 'Periodos con cero por anomalía:'}
            </span>
            <span className="banner-clasificacion__estadistica-valor">
              {resultado.periodosConCeroEsperado}
            </span>
          </div>
        )}
      </div>

      {resultado.detalle.length > 0 && (
        <details className="banner-clasificacion__detalle">
          <summary className="banner-clasificacion__detalle-titulo">
            Ver detalles de la clasificación
          </summary>
          <ul className="banner-clasificacion__detalle-lista">
            {resultado.detalle.map((item: string, index: number) => (
              <li key={index} className="banner-clasificacion__detalle-item">
                {item}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};
