/**
 * Header con acciones de análisis cuando hay datos cargados
 * Muestra título, cantidad de registros y botones de acción
 */

import { ArrowLeft, Trash2 } from 'lucide-react';

/**
 * Props del componente AnalysisHeader
 */
interface AnalysisHeaderProps {
  /** Indica si el análisis está habilitado */
  analisisHabilitado: boolean;
  /** Total de registros cargados */
  registrosCargados: number;
  /** Vista actual del módulo */
  modoVista: 'principal' | 'derivacion' | 'analisis';
  /** Callback para iniciar análisis */
  onAnalizar: () => void;
  /** Callback para anular facturas complementarias */
  onAnularFC: () => void;
  /** Callback para volver al módulo anterior */
  onVolver: () => void;
  /** Callback para limpiar datos guardados */
  onLimpiar: () => void;
}

/**
 * Componente de encabezado con acciones de análisis
 * Muestra controles principales cuando hay datos cargados
 */
export const AnalysisHeader = ({
  analisisHabilitado,
  registrosCargados,
  modoVista,
  onAnalizar,
  onAnularFC,
  onVolver,
  onLimpiar,
}: AnalysisHeaderProps) => {
  const textoTooltipVolver = (() => {
    if (modoVista === 'analisis') {
      return 'Volver a la derivación individual';
    }

    if (modoVista === 'derivacion') {
      return 'Volver al Análisis de Expediente Tipo V';
    }

    return 'Volver al módulo WART';
  })();

  return (
    <div className="expediente-header-inline">
      <button onClick={onVolver} className="expediente-back-btn-inline" title={textoTooltipVolver}>
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>
      <div className="expediente-header-actions">
        <div className="expediente-title-inline">
          <h1>Derivación Individual</h1>
          <p>{registrosCargados} registros cargados</p>
        </div>
        <button onClick={onAnularFC} className="expediente-anular-btn-header">
          Anular FC
        </button>
        <button
          onClick={onAnalizar}
          disabled={!analisisHabilitado}
          className="expediente-analisis-btn-header"
          title={
            !analisisHabilitado ? 'Primero debe ejecutar Anular FC' : 'Iniciar análisis de consumo'
          }
        >
          Análisis de Consumo
        </button>
        <button
          onClick={onLimpiar}
          className="expediente-limpiar-btn-header"
          title="Eliminar todos los datos guardados"
        >
          <Trash2 size={16} /> Limpiar Datos
        </button>
      </div>
    </div>
  );
};
