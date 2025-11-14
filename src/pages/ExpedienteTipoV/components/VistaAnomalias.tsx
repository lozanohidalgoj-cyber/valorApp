/**
 * Vista de anomalías detectadas en la comparativa mensual
 */

import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, Download, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import type { ConsumoMensual, DerivacionData } from '../../../types';
import { HeatMapConsumo, BannerClasificacionExpediente } from '../../../components';
import {
  formatearNumero,
  analizarComportamientoMensual,
  esComportamientoAnomalo,
} from '../../../services/analisisConsumoService';
import { clasificarExpediente } from '../../../services/clasificadorExpedienteService';
import { useAnomaliasSorting, useAnomaliasFilters, scrollToPeriodo } from './VistaAnomalias/index';

interface VistaAnomaliasProps {
  datos: ConsumoMensual[];
  detallesPorPeriodo: Record<string, DerivacionData[]>;
  onExportar?: (filas: ConsumoMensual[]) => void;
  onIrADerivacionPorFactura?: (numeroFiscal: string) => void;
}

export const VistaAnomalias = ({
  datos,
  detallesPorPeriodo,
  onExportar,
  onIrADerivacionPorFactura,
}: VistaAnomaliasProps) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Usar hooks personalizados para ordenamiento y filtrado
  const { sortColumn, sortDirection, sortedDatos, handleColumnSort } = useAnomaliasSorting(datos);

  const {
    fechaDesdeFilter,
    fechaHastaFilter,
    tipoComportamientoFilter,
    tiposComportamientoUnicos,
    setFechaDesdeFilter,
    setFechaHastaFilter,
    setTipoComportamientoFilter,
    aplicarFiltros,
  } = useAnomaliasFilters({ datos: sortedDatos, detallesPorPeriodo });

  // Aplicar filtros a los datos ordenados
  const datosFiltrados = aplicarFiltros(sortedDatos);

  // Wrapper para scrollToPeriodo que usa la referencia de la tabla
  const handleScrollToPeriodo = (periodo: string) => {
    scrollToPeriodo(tableRef, periodo);
  };

  const coloresPorAnio = useMemo(() => {
    const palette = [
      { background: 'rgba(0, 0, 208, 0.12)', text: 'var(--color-primary)' },
      { background: 'rgba(255, 49, 132, 0.14)', text: 'var(--color-secondary)' },
      { background: 'rgba(16, 185, 129, 0.18)', text: '#065f46' },
      { background: 'rgba(250, 204, 21, 0.18)', text: '#92400e' },
      { background: 'rgba(99, 102, 241, 0.18)', text: '#312e81' },
      { background: 'rgba(236, 72, 153, 0.18)', text: '#9d174d' },
    ];

    const years = Array.from(
      new Set(
        datos
          .map((registro) => registro.año)
          .filter((anio): anio is number => typeof anio === 'number' && Number.isFinite(anio))
      )
    ).sort((a, b) => a - b);

    const mapa = new Map<number, { background: string; text: string }>();
    years.forEach((year, index) => {
      mapa.set(year, palette[index % palette.length]);
    });

    return mapa;
  }, [datos]);
  const promedioHistoricoPorMes = useMemo(() => {
    const acumulados = new Map<number, { suma: number; cantidad: number }>();

    datos.forEach((registro) => {
      // Usar consumoTotal en lugar de consumoPromedioDiario
      if (!Number.isFinite(registro.consumoTotal)) {
        return;
      }

      const actual = acumulados.get(registro.mes) ?? { suma: 0, cantidad: 0 };
      acumulados.set(registro.mes, {
        suma: actual.suma + registro.consumoTotal, // ✅ CONSUMO TOTAL
        cantidad: actual.cantidad + 1,
      });
    });

    const promedios = new Map<number, number>();

    acumulados.forEach((valor, mes) => {
      if (valor.cantidad > 0) {
        promedios.set(mes, valor.suma / valor.cantidad); // Promedio del CONSUMO TOTAL de ese mes
      }
    });

    return promedios;
  }, [datos]);
  const analisisPorPeriodo = useMemo(() => analizarComportamientoMensual(datos), [datos]);
  const totalAnomalias = useMemo(() => {
    return datos.reduce((acumulado, registro) => {
      const analisis = analisisPorPeriodo.get(registro.periodo);
      return esComportamientoAnomalo(analisis) ? acumulado + 1 : acumulado;
    }, 0);
  }, [analisisPorPeriodo, datos]);
  const coloresPorPotencia = useMemo(() => {
    const palette = [
      { background: 'rgba(0, 0, 208, 0.14)', text: 'var(--color-primary)' },
      { background: 'rgba(255, 49, 132, 0.16)', text: 'var(--color-secondary)' },
      { background: 'rgba(16, 185, 129, 0.18)', text: '#065f46' },
      { background: 'rgba(250, 204, 21, 0.2)', text: '#92400e' },
      { background: 'rgba(99, 102, 241, 0.2)', text: '#312e81' },
      { background: 'rgba(236, 72, 153, 0.2)', text: '#9d174d' },
    ];

    const valoresUnicos = Array.from(
      new Set(
        datos
          .map((registro) =>
            registro.potenciaPromedio !== null ? Number(registro.potenciaPromedio.toFixed(2)) : null
          )
          .filter((valor): valor is number => valor !== null)
      )
    ).sort((a, b) => a - b);

    const mapa = new Map<number, { background: string; text: string }>();
    valoresUnicos.forEach((valor, indice) => {
      mapa.set(valor, palette[indice % palette.length]);
    });

    return mapa;
  }, [datos]);
  const obtenerClaseFilaPotencia = (variacion: number | null): string => {
    if (variacion === null || variacion === 0) {
      return '';
    }
    return variacion > 0
      ? 'expediente-anomalias__row--potencia-subida'
      : 'expediente-anomalias__row--potencia-bajada';
  };

  const hayDatos = datos.length > 0;
  const hayAnomalias = totalAnomalias > 0;
  const resumenGeneral = useMemo(() => {
    if (datos.length === 0) {
      return null;
    }

    const ordenados = [...datos].sort((a, b) => {
      if (a.año === b.año) return a.mes - b.mes;
      return a.año - b.año;
    });
    if (ordenados.length === 0) {
      return null;
    }

    // 1. Verificar si hay cambio de potencia
    let hayCambioPotencia = false;
    let potenciaAnterior = ordenados[0]?.potenciaPromedio ?? null;

    for (let i = 1; i < ordenados.length; i += 1) {
      const potenciaActual = ordenados[i].potenciaPromedio;
      if (potenciaActual !== potenciaAnterior) {
        hayCambioPotencia = true;
        break;
      }
      potenciaAnterior = potenciaActual;
    }

    if (hayCambioPotencia) {
      return {
        tipo: 'warning',
        icono: '⚠️',
        mensaje: 'No objetivo por cambio de potencia',
      } as const;
    }

    // 2. Contar ceros esperados (estacionalidad)
    const registrosCero = ordenados.filter((registro) => registro.consumoTotal === 0);
    if (registrosCero.length > 0) {
      const todosCeroEsperado = registrosCero.every((registro) => {
        const analisis = analisisPorPeriodo.get(registro.periodo);
        return (
          analisis?.comportamiento === 'Estacionalidad – uso temporal' || analisis?.ceroEsperado
        );
      });

      if (todosCeroEsperado) {
        return {
          tipo: 'info',
          icono: '⚪',
          mensaje: 'No anomalía – 0 esperado',
        } as const;
      }
    }

    // 3. Detectar descensos sostenidos (3+ meses consecutivos)
    let rachaDescenso = 0;
    let inicioDescensoSostenido: string | null = null;

    for (const registro of ordenados) {
      const analisis = analisisPorPeriodo.get(registro.periodo);
      if (analisis?.comportamiento === 'Descenso brusco mes a mes') {
        if (rachaDescenso === 0) {
          inicioDescensoSostenido = registro.periodo;
        }
        rachaDescenso += 1;
      } else {
        rachaDescenso = 0;
      }
    }

    if (rachaDescenso >= 3 && inicioDescensoSostenido) {
      const formatearPeriodoLegible = (periodo: string) => {
        const [anioStr, mesStr] = periodo.split('-');
        const anio = Number(anioStr);
        const mes = Number(mesStr);

        if (!Number.isFinite(anio) || !Number.isFinite(mes)) {
          return periodo;
        }

        const fecha = new Date(anio, mes - 1, 1);
        return new Intl.DateTimeFormat('es-ES', {
          month: 'long',
          year: 'numeric',
        }).format(fecha);
      };

      return {
        tipo: 'danger',
        icono: '🔴',
        mensaje: `Descenso sostenido – inicio de anomalía detectado en ${formatearPeriodoLegible(
          inicioDescensoSostenido
        )}`,
      } as const;
    }

    // Si no hay descenso sostenido, verificar si hay otros descensos
    // La "anomalía indeterminada" requiere descensos que no forman racha
    const tieneDescensos = ordenados.some((registro) => {
      const analisis = analisisPorPeriodo.get(registro.periodo);
      return analisis?.comportamiento === 'Descenso brusco mes a mes';
    });

    if (!tieneDescensos) {
      return {
        tipo: 'warning',
        icono: '⚠️',
        mensaje: 'Anomalía indeterminada',
      } as const;
    }

    // 4. Si hay descensos pero NO sostenidos, es anomalía indeterminada
    return {
      tipo: 'warning',
      icono: '⚠️',
      mensaje: 'Anomalía indeterminada',
    } as const;
  }, [analisisPorPeriodo, datos]);

  // Clasificación global del expediente
  const clasificacionExpediente = useMemo(() => {
    if (datos.length === 0) return null;
    return clasificarExpediente(datos);
  }, [datos]);

  // Handler para ir al inicio de la anomalía
  const handleIrInicioAnomalia = () => {
    if (clasificacionExpediente?.inicioPeriodoAnomalia) {
      handleScrollToPeriodo(clasificacionExpediente.inicioPeriodoAnomalia);
    }
  };

  return (
    <div className="expediente-anomalias">
      <div className="expediente-heatmap-section expediente-anomalias__heatmap">
        <div className="expediente-heatmap-wrapper">
          <HeatMapConsumo
            datos={datos}
            detallesPorPeriodo={detallesPorPeriodo}
            onCellClick={handleScrollToPeriodo}
          />
        </div>
      </div>

      {/* Banner de Clasificación Global del Expediente */}
      {clasificacionExpediente && (
        <BannerClasificacionExpediente
          resultado={clasificacionExpediente}
          onIrInicio={
            clasificacionExpediente.inicioPeriodoAnomalia ? handleIrInicioAnomalia : undefined
          }
        />
      )}

      {!hayDatos ? (
        <div className="expediente-anomalias__empty">
          <AlertTriangle size={36} />
          <div>
            <h3>Sin datos disponibles</h3>
            <p>Carga información para visualizar el detalle de periodos y anomalías.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="expediente-anomalias__header">
            <div>
              <h3>Análisis de consumo</h3>
              <p>Visualiza los periodos cargados y revisa los indicadores más relevantes.</p>
            </div>
            {onExportar && (
              <button
                className="btn-export"
                onClick={() => onExportar(datos)}
                title="Exportar anomalías a Excel"
              >
                <Download size={16} />
                Exportar anomalías
              </button>
            )}
          </div>

          {resumenGeneral && (
            <div
              className={`expediente-anomalias__alert expediente-anomalias__alert--${resumenGeneral.tipo}`}
              role="status"
            >
              <span className="expediente-anomalias__alert-icon">{resumenGeneral.icono}</span>
              <span>{resumenGeneral.mensaje}</span>
            </div>
          )}

          {!hayAnomalias && (
            <div className="expediente-anomalias__note">
              <AlertTriangle size={18} />
              <span>No se detectaron anomalías en el periodo analizado.</span>
            </div>
          )}

          {/* Mostrar recuperaciones detectadas */}
          {clasificacionExpediente?.periodosConRecuperacion &&
            clasificacionExpediente.periodosConRecuperacion.length > 0 && (
              <div
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  backgroundColor: 'rgba(251, 146, 60, 0.1)',
                  border: '2px solid rgba(251, 146, 60, 0.4)',
                  borderRadius: '8px',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 0.75rem 0',
                    color: '#c2410c',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <RefreshCw size={20} style={{ color: '#c2410c' }} />
                  Periodos con Descenso Sostenido que se Recuperaron (
                  {clasificacionExpediente.periodosConRecuperacion.length})
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gap: '0.5rem',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                  }}
                >
                  {clasificacionExpediente.periodosConRecuperacion.map((rec, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid rgba(251, 146, 60, 0.3)',
                        fontSize: '0.875rem',
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#c2410c', marginBottom: '0.25rem' }}>
                        {rec.periodoDescenso} → {rec.periodoRecuperacion}
                      </div>
                      <div style={{ color: '#374151' }}>
                        Descenso promedio: {rec.consumoDescenso.toFixed(1)} kWh
                        <span
                          style={{
                            color: '#dc2626',
                            fontWeight: '600',
                            marginLeft: '0.5rem',
                          }}
                        >
                          ({rec.variacionDescenso.toFixed(1)}%)
                        </span>
                      </div>
                      <div style={{ color: '#374151' }}>
                        Recuperación: {rec.consumoRecuperacion.toFixed(1)} kWh
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Controles de filtrado */}
          <div
            className="expediente-filtros"
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: 'rgba(0, 0, 208, 0.05)',
              borderRadius: '8px',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px' }}
            >
              <label
                htmlFor="fechaDesde"
                style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}
              >
                Fecha desde:
              </label>
              <input
                id="fechaDesde"
                type="date"
                value={fechaDesdeFilter}
                onChange={(e) => setFechaDesdeFilter(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                }}
              />
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px' }}
            >
              <label
                htmlFor="fechaHasta"
                style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}
              >
                Fecha hasta:
              </label>
              <input
                id="fechaHasta"
                type="date"
                value={fechaHastaFilter}
                onChange={(e) => setFechaHastaFilter(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                minWidth: '300px',
                flex: 1,
                position: 'relative',
              }}
            >
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                Tipos de comportamiento:
              </label>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1f2937',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minWidth: '300px',
                }}
              >
                <span>
                  {tipoComportamientoFilter.length === 0
                    ? 'Seleccionar tipos...'
                    : `${tipoComportamientoFilter.length} seleccionados`}
                </span>
                <span style={{ fontSize: '0.75rem', transition: 'transform 0.2s' }}>
                  {isDropdownOpen ? '▼' : '▶'}
                </span>
              </button>

              {isDropdownOpen && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    maxHeight: '250px',
                    overflow: 'auto',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={tipoComportamientoFilter.length === tiposComportamientoUnicos.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTipoComportamientoFilter([...tiposComportamientoUnicos]);
                        } else {
                          setTipoComportamientoFilter([]);
                        }
                      }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                      Todos ({tiposComportamientoUnicos.length})
                    </span>
                  </label>
                  <hr
                    style={{ margin: '0.25rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }}
                  />
                  {tiposComportamientoUnicos.map((tipo) => (
                    <label
                      key={tipo}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={tipoComportamientoFilter.includes(tipo)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTipoComportamientoFilter([...tipoComportamientoFilter, tipo]);
                          } else {
                            setTipoComportamientoFilter(
                              tipoComportamientoFilter.filter((t) => t !== tipo)
                            );
                          }
                        }}
                      />
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>{tipo}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'transparent' }}>
                &nbsp;
              </label>
              <button
                onClick={() => {
                  setFechaDesdeFilter('');
                  setFechaHastaFilter('');
                  setTipoComportamientoFilter([]);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: 'var(--color-secondary)',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                title="Limpiar todos los filtros"
              >
                Limpiar filtros
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginLeft: 'auto',
              }}
            >
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'transparent' }}>
                &nbsp;
              </label>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  fontWeight: '600',
                  alignSelf: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                Mostrando {datosFiltrados.length} de {datos.length} periodos
              </div>
            </div>
          </div>

          <div className="expediente-anomalias__table-wrapper">
            <table className="expediente-table expediente-table-analisis" ref={tableRef}>
              <thead>
                <tr>
                  <th>Número Fiscal</th>
                  <th>Fecha desde</th>
                  <th>Fecha hasta</th>
                  <th
                    onClick={() => handleColumnSort('periodo')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Periodo{' '}
                    {sortColumn === 'periodo' &&
                      (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                  </th>
                  <th
                    onClick={() => handleColumnSort('consumo')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Consumo (kWh){' '}
                    {sortColumn === 'consumo' &&
                      (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                  </th>
                  <th
                    onClick={() => handleColumnSort('dias')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Días{' '}
                    {sortColumn === 'dias' &&
                      (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                  </th>
                  <th
                    onClick={() => handleColumnSort('promedioDiario')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Consumo Promedio Diario (kWh){' '}
                    {sortColumn === 'promedioDiario' &&
                      (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                  </th>
                  <th>Tipo de comportamiento detectado</th>
                  <th
                    onClick={() => handleColumnSort('potencia')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Potencia (kW){' '}
                    {sortColumn === 'potencia' &&
                      (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                  </th>
                  <th>Promedio Histórico (mismo mes)</th>
                  <th>Variación Histórica (%)</th>
                  <th
                    onClick={() => handleColumnSort('variacion')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Variación %{' '}
                    {sortColumn === 'variacion' &&
                      (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.map((registro) => {
                  // Usar el campo ya calculado en el servicio
                  const consumoPromedioDiario = registro.consumoPromedioDiario;
                  const potenciaPromedio = registro.potenciaPromedio;
                  const variacionPotencia = registro.variacionPotenciaPorcentual;
                  const claseFilaPotencia = obtenerClaseFilaPotencia(variacionPotencia);
                  const estiloPeriodo = coloresPorAnio.get(registro.año);
                  const potenciaClave =
                    potenciaPromedio !== null ? Number(potenciaPromedio.toFixed(2)) : null;
                  const colorPotencia =
                    potenciaClave !== null ? coloresPorPotencia.get(potenciaClave) : undefined;
                  const promedioHistorico = promedioHistoricoPorMes.get(registro.mes) ?? null;
                  const analisis = analisisPorPeriodo.get(registro.periodo);
                  const variacionHistorica = analisis?.variacionHistorica ?? null;
                  const comportamientoDetectado = analisis?.comportamiento ?? 'Normal';
                  const esAnomalia = esComportamientoAnomalo(analisis);
                  const claseAnomalia = esAnomalia ? 'expediente-anomalias__row--anomalia' : '';

                  const periodoRegistros = detallesPorPeriodo[registro.periodo] || [];
                  const numerosFiscales = (() => {
                    const set = new Set<string>();
                    periodoRegistros.forEach((r) => {
                      const nf = (r as unknown as Record<string, unknown>)[
                        'Número Fiscal de Factura'
                      ];
                      const val = nf !== undefined && nf !== null ? String(nf).trim() : '';
                      if (val) set.add(val);
                    });
                    return Array.from(set);
                  })();

                  const fechasDesdeHasta = (() => {
                    const fechasDesde = periodoRegistros
                      .map((r) =>
                        String(
                          (r as unknown as Record<string, unknown>)['Fecha desde'] || ''
                        ).trim()
                      )
                      .filter((s) => s);
                    const fechasHasta = periodoRegistros
                      .map((r) =>
                        String(
                          (r as unknown as Record<string, unknown>)['Fecha hasta'] || ''
                        ).trim()
                      )
                      .filter((s) => s);

                    const safeParse = (s: string): number => {
                      const t = Date.parse(s);
                      return Number.isNaN(t) ? Number.NaN : t;
                    };

                    let minDesde: string | null = null;
                    let minDesdeTime = Number.POSITIVE_INFINITY;
                    for (const s of fechasDesde) {
                      const t = safeParse(s);
                      if (!Number.isNaN(t) && t < minDesdeTime) {
                        minDesdeTime = t;
                        minDesde = s;
                      }
                    }

                    let maxHasta: string | null = null;
                    let maxHastaTime = Number.NEGATIVE_INFINITY;
                    for (const s of fechasHasta) {
                      const t = safeParse(s);
                      if (!Number.isNaN(t) && t > maxHastaTime) {
                        maxHastaTime = t;
                        maxHasta = s;
                      }
                    }

                    // Fallbacks si no parsea bien: usar primer/último valor
                    if (minDesde === null && fechasDesde.length > 0) {
                      minDesde = fechasDesde[0];
                    }
                    if (maxHasta === null && fechasHasta.length > 0) {
                      maxHasta = fechasHasta[fechasHasta.length - 1];
                    }

                    return { desde: minDesde ?? '—', hasta: maxHasta ?? '—' };
                  })();

                  return (
                    <tr
                      key={registro.periodo}
                      data-periodo={registro.periodo}
                      className={`expediente-anomalias__row ${claseFilaPotencia} ${claseAnomalia}`.trim()}
                    >
                      <td
                        style={
                          estiloPeriodo
                            ? {
                                backgroundColor: estiloPeriodo.background,
                                color: estiloPeriodo.text,
                                fontWeight: 700,
                              }
                            : undefined
                        }
                      >
                        {numerosFiscales.length > 0 ? (
                          <div className="expediente-fiscales-wrap">
                            {numerosFiscales.map((nf) => (
                              <button
                                key={nf}
                                type="button"
                                className="expediente-link-fiscal"
                                onClick={() => onIrADerivacionPorFactura?.(nf)}
                                title={`Ver derivación para factura ${nf}`}
                              >
                                {nf}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="expediente-fiscal-placeholder">—</span>
                        )}
                      </td>
                      <td>{fechasDesdeHasta.desde}</td>
                      <td>{fechasDesdeHasta.hasta}</td>
                      <td>{registro.periodo}</td>
                      <td>{formatearNumero(registro.consumoTotal)}</td>
                      <td>{registro.dias}</td>
                      <td className="expediente-table-analisis__columna-promedio">
                        {consumoPromedioDiario > 0
                          ? formatearNumero(consumoPromedioDiario, 2)
                          : 'N/A'}
                      </td>
                      <td className="expediente-table-analisis__columna-comportamiento">
                        {comportamientoDetectado}
                      </td>
                      <td
                        style={
                          colorPotencia
                            ? {
                                backgroundColor: colorPotencia.background,
                                color: colorPotencia.text,
                                fontWeight: 700,
                              }
                            : undefined
                        }
                      >
                        {potenciaPromedio !== null
                          ? `${formatearNumero(potenciaPromedio, 2)} kW`
                          : 'N/A'}
                      </td>
                      <td className="expediente-table-analisis__columna-promedio">
                        {promedioHistorico === null
                          ? 'Sin histórico'
                          : formatearNumero(promedioHistorico, 2)}
                      </td>
                      <td className="expediente-table-analisis__columna-promedio">
                        {variacionHistorica === null
                          ? 'N/A'
                          : `${formatearNumero(variacionHistorica, 2)}%`}
                      </td>
                      <td>
                        {registro.variacionPorcentual === null
                          ? 'N/A'
                          : `${formatearNumero(registro.variacionPorcentual)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
