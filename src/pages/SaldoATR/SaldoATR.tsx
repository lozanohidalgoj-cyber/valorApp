/**
 * Interfaz Saldo ATR - Refactorizado
 * Muestra plantilla basada en "Interfaz Saldo ATR.xlsx" (46 columnas A..AT)
 * Permite importar "Saldo ATR.csv" (14 columnas A..N) y mapear a columnas A,C,G,H,I,J,P
 * Reducido mediante extracción de componentes, hooks y utilidades
 */

import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertMessages, ImportActions, SaldoATRHeader, SaldoATRTable } from './components';
import { useSaldoATRBase, useFileImport, useSaldoATRActions } from './hooks';
import { analizarConsumoCompleto } from '../../services/analisisConsumoService';
import type { DerivacionData, ResultadoAnalisis, SaldoATRRow } from '../../types';
import type { VistaAnalisis } from '../ExpedienteTipoV/types';
import {
  ResumenAnalisis,
  TabsVista,
  VistaAnual,
  VistaAnomalias,
  VistaGrafico,
  VistaListado,
  VistaMensual,
} from '../ExpedienteTipoV/components';
import {
  PALABRAS_CLAVE_ANULACION,
  COLUMNAS_REVISION_ANULACION,
  MAX_FACTURAS_DETALLE,
  obtenerIdentificadorSaldoAtr,
  obtenerTimestampDesdeFecha,
  convertirSaldoAtrADerivacion,
} from './utils';
import '../ExpedienteTipoV/ExpedienteTipoV.css';
import './SaldoATR.css';

export const SaldoATR = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { autoOpen?: boolean } };
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Hook para cargar la base de datos
  const { rows: baseRows, headers, loading, error: loadError } = useSaldoATRBase();

  // Hook para importar archivos
  const { handleFileImport, error: importError, success } = useFileImport();

  // Estado local de filas (puede ser actualizado por importación)
  const [rows, setRows] = useState<SaldoATRRow[]>([]);
  const [analisisHabilitado, setAnalisisHabilitado] = useState(false);
  const [resultadoAnalisis, setResultadoAnalisis] = useState<ResultadoAnalisis | null>(null);
  const [vistaActual, setVistaActual] = useState<VistaAnalisis>('anual');
  const [registrosDerivacion, setRegistrosDerivacion] = useState<DerivacionData[]>([]);
  const [columnasAnalisis, setColumnasAnalisis] = useState<string[]>([]);
  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuccess, setCustomSuccess] = useState<string | null>(null);
  const [tablaColapsada, setTablaColapsada] = useState(false);

  // Funciones auxiliares de reset
  const resetAnalisisState = () => {
    setResultadoAnalisis(null);
    setVistaActual('anual');
    setRegistrosDerivacion([]);
    setColumnasAnalisis([]);
  };

  const resetData = () => {
    setRows(baseRows);
    setAnalisisHabilitado(false);
    resetAnalisisState();
  };

  const resetAnalisis = () => {
    resetAnalisisState();
  };

  // Hook de acciones de exportación
  const {
    handleLimpiarDatos: limpiarDatosBase,
    handleExportarVistaAnual,
    handleExportarComparativaMensual,
    handleExportarAnalisisCompleto,
    handleExportarAnomalias,
  } = useSaldoATRActions({
    vistaAnual: resultadoAnalisis?.vistaAnual ?? null,
    comparativaMensual: resultadoAnalisis?.comparativaMensual ?? null,
    derivacionData: registrosDerivacion,
    resetData,
    resetAnalisis,
    onSuccess: (msg) => {
      setCustomSuccess(msg);
      setTimeout(() => setCustomSuccess(null), 3000);
    },
    onError: (err) => {
      setCustomError(err);
      setTimeout(() => setCustomError(null), 3000);
    },
  });

  // Sincronizar baseRows con rows locales
  useEffect(() => {
    if (!loading && baseRows.length > 0) {
      setRows(baseRows);
      setAnalisisHabilitado(false);
      resetAnalisisState();
      setCustomError(null);
      setCustomSuccess(null);
    }
  }, [baseRows, loading]);

  // Auto-abrir selector de archivos si viene de navegación
  useEffect(() => {
    if (location.state?.autoOpen) {
      setTimeout(() => inputRef.current?.click(), 0);
    }
  }, [location.state]);

  // Handlers
  const handleVolver = () => navigate(-1);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const updatedRows = await handleFileImport(file, rows);
      setRows(updatedRows);
      setAnalisisHabilitado(false);
      resetAnalisisState();
      setCustomError(null);
      setCustomSuccess(null);
    } catch {
      // Error ya manejado por el hook
    }
  };

  const handleLimpiarDatos = () => {
    limpiarDatosBase();
    setCustomError(null);
  };

  const handleAnularFC = () => {
    if (rows.length === 0) {
      setCustomError('No hay datos cargados para anular.');
      setTimeout(() => setCustomError(null), 4000);
      return;
    }

    const facturasExcluidas: string[] = [];

    const filasFiltradas = rows.filter((fila) => {
      const contienePalabraClave = COLUMNAS_REVISION_ANULACION.some((columna) => {
        const valor = fila[columna];
        if (valor === undefined || valor === null) {
          return false;
        }

        const texto = valor.toString().trim().toUpperCase();
        if (texto.length === 0) {
          return false;
        }

        return PALABRAS_CLAVE_ANULACION.some((palabra) => texto.includes(palabra));
      });

      if (contienePalabraClave) {
        facturasExcluidas.push(obtenerIdentificadorSaldoAtr(fila));
        return false;
      }

      return true;
    });

    const filasOrdenadas = [...filasFiltradas].sort(
      (a, b) => obtenerTimestampDesdeFecha(a['G']) - obtenerTimestampDesdeFecha(b['G'])
    );

    setRows(filasOrdenadas);
    setAnalisisHabilitado(true);
    setResultadoAnalisis(null);
    setVistaActual('anual');
    setRegistrosDerivacion([]);
    setColumnasAnalisis([]);
    setCustomError(null);

    if (facturasExcluidas.length > 0) {
      const detalle = facturasExcluidas.slice(0, MAX_FACTURAS_DETALLE).join(', ');
      const restante =
        facturasExcluidas.length > MAX_FACTURAS_DETALLE
          ? ` y ${facturasExcluidas.length - MAX_FACTURAS_DETALLE} más`
          : '';
      setCustomSuccess(
        `[OK] Se anularon ${facturasExcluidas.length} factura${
          facturasExcluidas.length === 1 ? '' : 's'
        }${detalle ? `: ${detalle}${restante}` : ''}`
      );
    } else {
      setCustomSuccess('No se encontraron facturas para anular. El listado se mantiene igual.');
    }

    setTimeout(() => setCustomSuccess(null), 6000);
  };

  const handleAnalisisConsumo = () => {
    if (!analisisHabilitado) {
      setCustomError('Debe ejecutar Anular FC antes de iniciar el análisis.');
      setTimeout(() => setCustomError(null), 4000);
      return;
    }

    const { registros: registrosConvertidos, columnas } = convertirSaldoAtrADerivacion(
      rows,
      headers
    );

    if (registrosConvertidos.length === 0) {
      setCustomError('No hay registros válidos para analizar.');
      setTimeout(() => setCustomError(null), 4000);
      return;
    }

    try {
      const resultado = analizarConsumoCompleto(registrosConvertidos);
      setResultadoAnalisis(resultado);
      setRegistrosDerivacion(registrosConvertidos);
      setColumnasAnalisis(columnas);
      setVistaActual('anual');
      setTablaColapsada(true); // Colapsar tabla cuando se ejecuta análisis
      setCustomError(null);
      setCustomSuccess(null);
    } catch {
      setCustomError('Error al ejecutar el análisis de consumo');
      setTimeout(() => setCustomError(null), 5000);
    }
  };

  // Combinar errores
  const displayError = loadError || importError || customError;
  const successMessage = customSuccess ?? success;
  const columnasListado = columnasAnalisis.length > 0 ? columnasAnalisis : headers;
  // Eliminado botón de exportación en header; variable previa puedeExportar ya no se utiliza

  return (
    <div className="saldoatr-container">
      <SaldoATRHeader
        onVolver={handleVolver}
        totalRegistros={rows.length}
        onLimpiarDatos={handleLimpiarDatos}
        onAnularFC={handleAnularFC}
        onAnalizar={handleAnalisisConsumo}
        analisisHabilitado={analisisHabilitado}
      />

      <AlertMessages error={displayError} success={successMessage} />

      <div className="saldoatr-scroll-area">
        {/* Sección de Tabla - Colapsable */}
        {!tablaColapsada && (
          <div className="saldoatr-card">
            <ImportActions inputRef={inputRef} onFileChange={handleFileChange} />

            {loading ? (
              <div className="saldoatr-loading">Cargando plantilla base...</div>
            ) : (
              <SaldoATRTable rows={rows} headers={headers} />
            )}
          </div>
        )}

        {/* Botón Toggle para mostrar/ocultar sección de datos */}
        <div className="saldoatr-toggle-container">
          <button
            className="saldoatr-tabla-toggle"
            onClick={() => setTablaColapsada(!tablaColapsada)}
            aria-expanded={!tablaColapsada}
            title={tablaColapsada ? 'Expandir sección de datos' : 'Colapsar sección de datos'}
          >
            <span className={`toggle-icon ${tablaColapsada ? 'collapsed' : ''}`}>
              {tablaColapsada ? '▶' : '▼'}
            </span>
            <span className="toggle-label">
              {tablaColapsada ? 'Ver' : 'Ocultar'} Datos ({rows.length} registros)
            </span>
          </button>
        </div>

        {resultadoAnalisis && (
          <div className="saldoatr-analisis-panel">
            <div className="saldoatr-analisis-panel__header">
              <h2>Resultados del análisis de consumo</h2>
              <p>
                Explora la información por años, meses, listado completo o gráfico para identificar
                patrones y anomalías.
              </p>
            </div>

            <div className="saldoatr-analisis-panel__content expediente-analisis-container">
              {vistaActual !== 'mensual' && <ResumenAnalisis resultado={resultadoAnalisis} />}

              <TabsVista vistaActual={vistaActual} onCambiarVista={setVistaActual} />

              {vistaActual === 'anual' && (
                <VistaAnual
                  datos={resultadoAnalisis.vistaAnual}
                  onExportar={handleExportarVistaAnual}
                />
              )}

              {vistaActual === 'mensual' && (
                <VistaMensual
                  datos={resultadoAnalisis.comparativaMensual}
                  detallesPorPeriodo={resultadoAnalisis.detallesPorPeriodo}
                  onExportarComparativa={handleExportarComparativaMensual}
                  onExportarCompleto={handleExportarAnalisisCompleto}
                />
              )}

              {vistaActual === 'listado' && (
                <VistaListado data={registrosDerivacion} columns={columnasListado} />
              )}

              {vistaActual === 'grafico' && (
                <VistaGrafico
                  comparativaMensual={resultadoAnalisis.comparativaMensual}
                  onExportar={handleExportarAnalisisCompleto}
                />
              )}

              {vistaActual === 'anomalia' && (
                <VistaAnomalias
                  datos={resultadoAnalisis.comparativaMensual}
                  detallesPorPeriodo={resultadoAnalisis.detallesPorPeriodo}
                  onExportar={handleExportarAnomalias}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
