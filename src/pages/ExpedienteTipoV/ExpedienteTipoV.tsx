/**
 * Análisis de Expediente Tipo V - Refactorizado
 * Componente container que orquesta el flujo de importación, análisis y visualización
 * Reducido de 654 líneas a menos de 200 mediante extracción de hooks y componentes
 */

import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  guardarDerivacionData,
  recuperarDerivacionData,
  hayDatosGuardados,
} from '../../services/persistenciaService';
import {
  AlertMessages,
  FileUploadSection,
  AnalysisHeader,
  VistaListado,
  VistaGrafico,
  VistaAnual,
  DataTable,
  VistaAnomalias,
  VistaMensual,
} from './components';
import { useFileLoader, useAnalysis, useExpedienteActions } from './hooks';
import type { DerivacionData, ConsumoAnual, ConsumoMensual } from '../../types';
import './ExpedienteTipoV.css';

type VistaModuloExpediente = 'principal' | 'derivacion' | 'analisis';

export const ExpedienteTipoV = () => {
  // Hooks personalizados para manejo de estado
  const {
    data: derivacionData,
    columns: derivacionColumns,
    loaded: derivacionLoaded,
    error: fileError,
    loadFile,
    resetData,
    setData,
    setLoaded,
  } = useFileLoader();

  const {
    resultado: resultadoAnalisis,
    vistaActual,
    analisisHabilitado: analisisConsumoHabilitado,
    ejecutarAnalisis,
    cambiarVista: setVistaActual,
    habilitarAnalisis: setAnalisisConsumoHabilitado,
    resetAnalisis,
    setMostrandoAnalisis,
  } = useAnalysis();

  const [modoVista, setModoVista] = useState<VistaModuloExpediente>('principal');
  const [filtroFactura, setFiltroFactura] = useState<string | null>(null);

  // Estado local para mensajes
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Funciones de navegación entre vistas
  const mostrarDerivacion = () => {
    setMostrandoAnalisis(false);
    setVistaActual('anual');
    setModoVista('derivacion');
  };

  const mostrarVistaPrincipal = () => {
    setMostrandoAnalisis(false);
    setVistaActual('anual');
    setModoVista('principal');
  };

  // Hook de acciones de exportación y navegación
  const {
    handleExportarVistaAnual,
    handleExportarComparativaMensual,
    handleExportarAnalisisCompleto,
    handleExportarAnomalias,
    handleLimpiarDatosGuardados,
    handleIrSaldoAtr,
    handleVolver: volverBase,
  } = useExpedienteActions({
    vistaAnual: resultadoAnalisis?.vistaAnual ?? null,
    comparativaMensual: resultadoAnalisis?.comparativaMensual ?? null,
    derivacionData,
    resetData,
    resetAnalysis: resetAnalisis,
    onSuccess: (msg) => {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err) => {
      setError(err);
      setTimeout(() => setError(null), 3000);
    },
  });

  // Recuperar datos guardados al montar
  useEffect(() => {
    if (hayDatosGuardados()) {
      const datosGuardados = recuperarDerivacionData();
      if (datosGuardados && datosGuardados.length > 0) {
        resetAnalisis();
        setData(datosGuardados, Object.keys(datosGuardados[0] || {}));
        setLoaded(true);
        setModoVista('derivacion');
        setSuccessMessage(
          `✅ Se recuperaron ${datosGuardados.length} registros guardados anteriormente`
        );
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    }
  }, [resetAnalisis, setData, setLoaded, setModoVista]);

  // Guardar datos cuando cambian
  useEffect(() => {
    if (derivacionLoaded && derivacionData.length > 0) {
      guardarDerivacionData(derivacionData);
    }
  }, [derivacionData, derivacionLoaded]);

  // Handlers
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMessage(null);

    try {
      resetAnalisis();
      await loadFile(file);
      setModoVista('derivacion');
      setSuccessMessage(`✅ Archivo "${file.name}" cargado exitosamente`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        `Error al cargar el archivo: ${err instanceof Error ? err.message : 'Error desconocido'}`
      );
    }
  };

  const handleAnularFC = () => {
    if (derivacionData.length === 0) {
      setError('No hay datos cargados para anular');
      setTimeout(() => setError(null), 4000);
      return;
    }

    setError(null);

    const palabrasClaveExcluir = [
      'ANULADA',
      'ANULADOR',
      'COMPLEMENTARIA',
      'SUSTITUIDA',
      'SUSTITUYENTE',
    ];

    const obtenerIdentificadorFactura = (registro: DerivacionData): string => {
      const numeroFiscal = (registro['Número Fiscal de Factura'] || '').toString().trim();
      if (numeroFiscal) {
        return `Factura ${numeroFiscal}`;
      }

      const secuencial = (registro['Secuencial de factura'] || '').toString().trim();
      if (secuencial) {
        return `Secuencial ${secuencial}`;
      }

      const contrato = (registro['Código de contrato externo - interfaz'] || '').toString().trim();
      if (contrato) {
        return `Contrato ${contrato}`;
      }

      return 'Registro sin identificador';
    };

    const facturasExcluidas: string[] = [];

    const datosFiltrados = derivacionData.filter((row) => {
      const estadoOriginal = (row['Estado de la factura'] || '').toString();
      const estadoNormalizado = estadoOriginal.trim().toUpperCase();

      if (palabrasClaveExcluir.some((palabra) => estadoNormalizado.includes(palabra))) {
        facturasExcluidas.push(obtenerIdentificadorFactura(row));
        return false;
      }

      return true;
    });

    const datosOrdenados: DerivacionData[] = [...datosFiltrados].sort((a, b) => {
      const fechaA = new Date(a['Fecha desde']);
      const fechaB = new Date(b['Fecha desde']);
      return fechaA.getTime() - fechaB.getTime();
    });

    setData(datosOrdenados, derivacionColumns);
    mostrarDerivacion();
    setAnalisisConsumoHabilitado();

    const registrosExcluidos = facturasExcluidas.length;

    if (registrosExcluidos > 0) {
      const resumenFacturas = facturasExcluidas.slice(0, 5).join(', ');
      const restante = registrosExcluidos > 5 ? ` y ${registrosExcluidos - 5} más` : '';
      const detalleFacturas = `${resumenFacturas}${restante}`.trim();
      const detalleFormateado = detalleFacturas ? `: ${detalleFacturas}` : '';
      setSuccessMessage(
        `✅ Se anularon ${registrosExcluidos} factura${registrosExcluidos === 1 ? '' : 's'}${detalleFormateado}`
      );
    } else {
      setSuccessMessage('No se encontraron facturas para anular. El listado se mantiene igual.');
    }

    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const handleAnalisisConsumo = () => {
    if (derivacionData.length === 0) {
      setError('No hay datos para analizar');
      return;
    }

    try {
      const exito = ejecutarAnalisis(derivacionData as DerivacionData[], 'anual');
      if (exito) {
        setModoVista('analisis');
        setSuccessMessage(
          `Análisis completado: ${resultadoAnalisis?.vistaAnual.length || 0} años procesados`
        );
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError('Error al realizar el análisis de consumo');
      }
    } catch {
      setError('Error al realizar el análisis de consumo');
    }
  };

  const irADerivacionPorFactura = (numeroFiscal: string) => {
    setFiltroFactura(numeroFiscal);
    setModoVista('derivacion');
  };

  const handleVolver = () => {
    if (modoVista === 'analisis') {
      mostrarDerivacion();
      return;
    }

    if (modoVista === 'derivacion') {
      mostrarVistaPrincipal();
      return;
    }

    volverBase();
  };

  // Error combinado de hook y local
  const displayError = error || fileError;

  return (
    <div className="expediente-container">
      {/* Encabezado principal o barra de acciones según la vista actual */}
      {modoVista === 'principal' || derivacionData.length === 0 ? (
        <div className="expediente-header-section">
          <h1 className="expediente-header-title">Análisis de Expediente Tipo V</h1>
          <p className="expediente-header-subtitle">
            Importa los archivos necesarios para continuar con el análisis
          </p>
        </div>
      ) : (
        <AnalysisHeader
          analisisHabilitado={analisisConsumoHabilitado}
          registrosCargados={derivacionData.length}
          modoVista={modoVista}
          onAnalizar={handleAnalisisConsumo}
          onAnularFC={handleAnularFC}
          onVolver={handleVolver}
          onLimpiar={handleLimpiarDatosGuardados}
        />
      )}

      <div className="expediente-inner">
        <AlertMessages error={displayError} success={successMessage} />

        {modoVista === 'principal' && (
          <div className="expediente-main-content">
            <FileUploadSection
              loaded={derivacionLoaded}
              onFileChange={handleFileChange}
              onClearData={handleLimpiarDatosGuardados}
            />
            <button onClick={handleIrSaldoAtr} className="expediente-saldo-atr-btn">
              Saldo ATR
            </button>
            {derivacionLoaded && derivacionData.length > 0 && (
              <button
                type="button"
                className="expediente-continuar-derivacion-btn"
                onClick={mostrarDerivacion}
              >
                Ver derivación cargada
              </button>
            )}
          </div>
        )}

        {modoVista === 'derivacion' && (
          <div className="expediente-data-card">
            {filtroFactura && (
              <div className="expediente-filter-bar" role="status">
                <span>
                  Filtrando por Número Fiscal de Factura: <strong>{filtroFactura}</strong>
                </span>
                <button
                  type="button"
                  className="btn-export"
                  onClick={() => setFiltroFactura(null)}
                  title="Quitar filtro"
                >
                  Quitar filtro
                </button>
              </div>
            )}
            <DataTable
              data={
                filtroFactura
                  ? derivacionData.filter(
                      (r) =>
                        String(
                          (r as unknown as Record<string, unknown>)['Número Fiscal de Factura'] ??
                            ''
                        ) === filtroFactura
                    )
                  : derivacionData
              }
              columns={derivacionColumns}
            />
          </div>
        )}

        {modoVista === 'analisis' && resultadoAnalisis && (
          <div className="expediente-analisis-container">
            <div className="expediente-tabs">
              <button
                className={`expediente-tab ${vistaActual === 'anual' ? 'active' : ''}`}
                onClick={() => setVistaActual('anual')}
              >
                Vista por Años
              </button>
              <button
                className={`expediente-tab ${vistaActual === 'mensual' ? 'active' : ''}`}
                onClick={() => setVistaActual('mensual')}
              >
                Comparativa Mensual
              </button>
              <button
                className={`expediente-tab ${vistaActual === 'listado' ? 'active' : ''}`}
                onClick={() => setVistaActual('listado')}
              >
                Listado
              </button>
              <button
                className={`expediente-tab ${vistaActual === 'grafico' ? 'active' : ''}`}
                onClick={() => setVistaActual('grafico')}
              >
                Gráfico
              </button>
              <button
                className={`expediente-tab ${vistaActual === 'anomalia' ? 'active' : ''}`}
                onClick={() => setVistaActual('anomalia')}
              >
                Anomalía
              </button>
            </div>

            {vistaActual === 'anual' && (
              <VistaAnual
                datos={resultadoAnalisis.vistaAnual as ConsumoAnual[]}
                onExportar={handleExportarVistaAnual}
              />
            )}

            {vistaActual === 'mensual' && resultadoAnalisis && (
              <VistaMensual
                datos={resultadoAnalisis.comparativaMensual as ConsumoMensual[]}
                detallesPorPeriodo={resultadoAnalisis.detallesPorPeriodo}
                onExportarComparativa={handleExportarComparativaMensual}
                onExportarCompleto={handleExportarAnalisisCompleto}
              />
            )}

            {vistaActual === 'listado' && (
              <VistaListado data={derivacionData} columns={derivacionColumns} />
            )}

            {vistaActual === 'grafico' && (
              <VistaGrafico
                comparativaMensual={resultadoAnalisis.comparativaMensual as ConsumoMensual[]}
                onExportar={handleExportarAnalisisCompleto}
              />
            )}

            {vistaActual === 'anomalia' && (
              <VistaAnomalias
                datos={resultadoAnalisis.comparativaMensual as ConsumoMensual[]}
                detallesPorPeriodo={resultadoAnalisis.detallesPorPeriodo}
                onExportar={handleExportarAnomalias}
                onIrADerivacionPorFactura={irADerivacionPorFactura}
              />
            )}
          </div>
        )}

        {modoVista === 'principal' && (
          <div className="expediente-footer">
            <button onClick={handleVolver} className="expediente-back-btn">
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
