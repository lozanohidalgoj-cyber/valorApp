/**
 * Hook para manejar acciones de SaldoATR
 * Centraliza handlers de exportación, navegación y limpieza
 */
import { useCallback } from 'react';
import type { ConsumoAnual, ConsumoMensual, DerivacionData } from '../../../types';
import {
  exportarVistaAnualExcel,
  exportarComparativaMensualExcel,
  exportarAnalisisCompleto,
} from '../../../services/exportacionService';

interface UseSaldoATRActionsProps {
  vistaAnual: ConsumoAnual[] | null;
  comparativaMensual: ConsumoMensual[] | null;
  derivacionData: DerivacionData[];
  resetData: () => void;
  resetAnalisis: () => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

/**
 * Hook que encapsula acciones/handlers del componente SaldoATR
 */
export const useSaldoATRActions = ({
  vistaAnual,
  comparativaMensual,
  derivacionData,
  resetData,
  resetAnalisis,
  onSuccess,
  onError,
}: UseSaldoATRActionsProps) => {
  const handleLimpiarDatos = useCallback(() => {
    resetData();
    resetAnalisis();
    onSuccess('✅ Datos eliminados correctamente');
  }, [resetData, resetAnalisis, onSuccess]);

  const handleExportarVistaAnual = useCallback(() => {
    if (!vistaAnual || vistaAnual.length === 0) {
      onError('⚠️ No hay datos de Vista Anual para exportar');
      return;
    }

    exportarVistaAnualExcel(vistaAnual);
    onSuccess('✅ Vista Anual exportada correctamente');
  }, [vistaAnual, onError, onSuccess]);

  const handleExportarComparativaMensual = useCallback(() => {
    if (!comparativaMensual || comparativaMensual.length === 0) {
      onError('⚠️ No hay datos de Comparativa Mensual para exportar');
      return;
    }

    exportarComparativaMensualExcel(comparativaMensual);
    onSuccess('✅ Comparativa Mensual exportada correctamente');
  }, [comparativaMensual, onError, onSuccess]);

  const handleExportarAnalisisCompleto = useCallback(() => {
    if (!vistaAnual || !comparativaMensual) {
      onError('⚠️ No hay análisis completo para exportar');
      return;
    }

    exportarAnalisisCompleto(vistaAnual, comparativaMensual, derivacionData);
    onSuccess('✅ Análisis completo exportado correctamente (3 hojas)');
  }, [vistaAnual, comparativaMensual, derivacionData, onError, onSuccess]);

  const handleExportarAnomalias = useCallback(
    (filas?: ConsumoMensual[]) => {
      if (!comparativaMensual || comparativaMensual.length === 0) {
        onError('⚠️ No hay anomalías para exportar');
        return;
      }

      const filasExportar = filas || comparativaMensual;
      exportarComparativaMensualExcel(filasExportar, 'anomalias_saldoatr.xlsx');
      onSuccess('✅ Anomalías exportadas correctamente');
    },
    [comparativaMensual, onError, onSuccess]
  );

  return {
    handleLimpiarDatos,
    handleExportarVistaAnual,
    handleExportarComparativaMensual,
    handleExportarAnalisisCompleto,
    handleExportarAnomalias,
  };
};
