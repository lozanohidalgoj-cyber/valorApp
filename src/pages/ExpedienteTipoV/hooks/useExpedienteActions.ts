/**
 * Hook para manejar todas las acciones del componente ExpedienteTipoV
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ConsumoAnual, ConsumoMensual, DerivacionData } from '../../../types';
import {
  exportarVistaAnualExcel,
  exportarComparativaMensualExcel,
  exportarAnalisisCompleto,
} from '../../../services/exportacionService';
import { limpiarDatosGuardados } from '../../../services/persistenciaService';

interface UseExpedienteActionsProps {
  vistaAnual: ConsumoAnual[] | null;
  comparativaMensual: ConsumoMensual[] | null;
  derivacionData: DerivacionData[];
  resetData: () => void;
  resetAnalysis: () => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

/**
 * Hook que encapsula todas las acciones/handlers del componente ExpedienteTipoV
 */
export const useExpedienteActions = ({
  vistaAnual,
  comparativaMensual,
  derivacionData,
  resetData,
  resetAnalysis,
  onSuccess,
  onError,
}: UseExpedienteActionsProps) => {
  const navigate = useNavigate();

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
    onSuccess('✅ Análisis completo exportado correctamente');
  }, [vistaAnual, comparativaMensual, derivacionData, onError, onSuccess]);

  const handleExportarAnomalias = useCallback(
    (filas?: ConsumoMensual[]) => {
      if (!comparativaMensual || comparativaMensual.length === 0) {
        onError('⚠️ No hay anomalías para exportar');
        return;
      }

      const filasExportar = filas || comparativaMensual;
      exportarComparativaMensualExcel(filasExportar);
      onSuccess('✅ Anomalías exportadas correctamente');
    },
    [comparativaMensual, onError, onSuccess]
  );

  const handleLimpiarDatosGuardados = useCallback(() => {
    limpiarDatosGuardados();
    resetData();
    resetAnalysis();
    onSuccess('✅ Datos guardados eliminados correctamente');
  }, [resetData, resetAnalysis, onSuccess]);

  const handleIrSaldoAtr = useCallback(() => {
    navigate('/saldo-atr');
  }, [navigate]);

  const handleVolver = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return {
    handleExportarVistaAnual,
    handleExportarComparativaMensual,
    handleExportarAnalisisCompleto,
    handleExportarAnomalias,
    handleLimpiarDatosGuardados,
    handleIrSaldoAtr,
    handleVolver,
  };
};
