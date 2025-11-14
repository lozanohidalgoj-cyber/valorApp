/**
 * Header de SaldoATR con navegación y diseño unificado
 * Muestra título, botón de retorno y contador de registros opcional
 * Memoizado para evitar re-renders innecesarios
 */

import { memo } from 'react';
import { ArrowLeft, Trash2, BarChart2 } from 'lucide-react';

/**
 * Props del componente SaldoATRHeader
 */
interface SaldoATRHeaderProps {
  /** Callback para volver a la pantalla anterior */
  onVolver: () => void;
  /** Total de registros cargados (opcional) */
  totalRegistros?: number;
  /** Callback para limpiar datos (opcional) */
  onLimpiarDatos?: () => void;
  /** Callback para anular facturas complementarias */
  onAnularFC?: () => void;
  /** Callback para ejecutar el análisis de consumo */
  onAnalizar?: () => void;
  /** Controla el estado del botón de análisis */
  analisisHabilitado?: boolean;
}

/**
 * Componente de encabezado para la interfaz SaldoATR
 * Incluye navegación y información de registros
 */
const SaldoATRHeaderComponent = ({
  onVolver,
  totalRegistros,
  onLimpiarDatos,
  onAnularFC,
  onAnalizar,
  analisisHabilitado = false,
}: SaldoATRHeaderProps) => {
  // Si no hay registros, mostrar solo header simple
  if (!totalRegistros || totalRegistros === 0) {
    return (
      <div className="saldoatr-header-unified">
        <button className="saldoatr-back-btn-unified" onClick={onVolver}>
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="saldoatr-title-section">
          <h1 className="saldoatr-title-unified">Interfaz Saldo ATR</h1>
        </div>
      </div>
    );
  }

  // Header con botones de acción cuando hay datos
  return (
    <div className="saldoatr-header-inline">
      <button className="saldoatr-back-btn-unified" onClick={onVolver}>
        <ArrowLeft size={18} /> Volver
      </button>
      <div className="saldoatr-title-inline">
        <h1 className="saldoatr-title">Interfaz Saldo ATR</h1>
        <p>{totalRegistros} registros cargados</p>
      </div>
      <div className="saldoatr-header-actions">
        {onAnularFC && (
          <button onClick={onAnularFC} className="saldoatr-anular-btn-header">
            Anular FC
          </button>
        )}
        {onAnalizar && (
          <button
            onClick={onAnalizar}
            disabled={!analisisHabilitado}
            className="saldoatr-analisis-btn-header"
            title={
              !analisisHabilitado
                ? 'Primero debe ejecutar Anular FC'
                : 'Iniciar análisis de consumo'
            }
          >
            <BarChart2 size={22} />
            <span className="saldoatr-analisis-btn-header__text">Análisis de Consumo</span>
          </button>
        )}
        {/* Botón de exportación eliminado según requerimiento */}
        {onLimpiarDatos && (
          <button
            onClick={onLimpiarDatos}
            className="saldoatr-limpiar-btn-header"
            title="Limpiar todos los datos"
          >
            <Trash2 size={18} />
            Limpiar Datos
          </button>
        )}
      </div>
    </div>
  );
};

export const SaldoATRHeader = memo(SaldoATRHeaderComponent);
