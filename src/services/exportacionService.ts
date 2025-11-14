/**
 * 📤 Servicio de Exportación de Datos
 *
 * Exporta análisis a formatos Excel y CSV para compartir resultados.
 * Replica la funcionalidad de "Guardar como" del Excel.
 */

import * as XLSX from 'xlsx';
import type { ConsumoAnual, ConsumoMensual, DerivacionData } from '../types';
import { logger } from './loggerService';

const MOTIVOS_LABELS: Record<string, string> = {
  variacion_consumo_activa: 'Variación consumo activa',
  variacion_promedio_activa: 'Variación promedio activa',
  variacion_energia_reconstruida: 'Variación energía reconstruida',
  variacion_maximetro: 'Variación maxímetro',
};

const traducirMotivosAnomalia = (motivos: string[]): string => {
  if (motivos.length === 0) {
    return 'Sin detalle';
  }

  return motivos.map((motivo) => MOTIVOS_LABELS[motivo] ?? motivo).join(', ');
};

type EncabezadoComparativa =
  | 'Periodo'
  | 'Consumo (kWh)'
  | 'Potencia (kW)'
  | 'Días'
  | 'Consumo Promedio Diario (kWh)'
  | 'Variación %'
  | 'Tipo Variación'
  | 'Motivos'
  | 'Año'
  | 'Mes'
  | 'Es Anomalía';

const ENCABEZADOS_COMPARATIVA_MENSUAL: EncabezadoComparativa[] = [
  'Periodo',
  'Consumo (kWh)',
  'Potencia (kW)',
  'Días',
  'Consumo Promedio Diario (kWh)',
  'Variación %',
  'Tipo Variación',
  'Motivos',
  'Año',
  'Mes',
  'Es Anomalía',
];

const formatearRegistroComparativa = (
  registro: ConsumoMensual
): Record<EncabezadoComparativa, string> => ({
  Periodo: registro.periodo,
  'Consumo (kWh)': registro.consumoTotal.toFixed(2),
  'Potencia (kW)':
    registro.potenciaPromedio !== null ? registro.potenciaPromedio.toFixed(2) : 'N/A',
  Días: registro.dias.toString(),
  'Consumo Promedio Diario (kWh)':
    registro.dias > 0 ? (registro.consumoTotal / registro.dias).toFixed(2) : 'N/A',
  'Variación %':
    registro.variacionPorcentual !== null ? `${registro.variacionPorcentual.toFixed(2)}%` : 'N/A',
  'Tipo Variación': registro.tipoVariacion ?? 'N/A',
  Motivos: traducirMotivosAnomalia(registro.motivosAnomalia),
  Año: registro.año.toString(),
  Mes: registro.mes.toString(),
  'Es Anomalía': registro.esAnomalia ? 'SÍ' : 'NO',
});

/**
 * Exporta Vista por Años a archivo Excel
 */
export const exportarVistaAnualExcel = (
  datos: ConsumoAnual[],
  nombreArchivo: string = 'vista_por_anos.xlsx'
): void => {
  try {
    // Crear hoja de trabajo
    const datosParaExcel = datos.map((registro) => ({
      Año: registro.año,
      'Suma Consumo Activa (kWh)': registro.sumaConsumoActiva.toFixed(2),
      'Máx Maxímetro (kW)': registro.maxMaximetro.toFixed(2),
      Periodos: registro.periodosFacturados,
      Días: registro.sumaDias,
      'Promedio/Día (kWh)': registro.promedioConsumoPorDia.toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 10 }, // Año
      { wch: 25 }, // Suma Consumo Activa
      { wch: 20 }, // Máx Maxímetro
      { wch: 12 }, // Periodos
      { wch: 10 }, // Días
      { wch: 20 }, // Promedio/Día
    ];

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vista por años');

    // Descargar archivo
    XLSX.writeFile(workbook, nombreArchivo);
  } catch (error) {
    logger.error('Error al exportar Vista por años', error as Error);
    throw new Error('No se pudo exportar el archivo Excel');
  }
};

/**
 * Exporta Comparativa Mensual a archivo Excel
 */
export const exportarComparativaMensualExcel = (
  datos: ConsumoMensual[],
  nombreArchivo: string = 'comparativa_mensual.xlsx'
): void => {
  try {
    const datosParaExcel = datos.map(formatearRegistroComparativa);

    const worksheet = XLSX.utils.json_to_sheet(datosParaExcel, {
      header: ENCABEZADOS_COMPARATIVA_MENSUAL as string[],
    });

    worksheet['!cols'] = [
      { wch: 14 }, // Periodo
      { wch: 18 }, // Consumo
      { wch: 16 }, // Potencia
      { wch: 8 }, // Días
      { wch: 28 }, // Consumo promedio diario
      { wch: 14 }, // Variación %
      { wch: 18 }, // Tipo variación
      { wch: 40 }, // Motivos
      { wch: 8 }, // Año
      { wch: 6 }, // Mes
      { wch: 12 }, // Es anomalía
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Comparativa Mensual');

    XLSX.writeFile(workbook, nombreArchivo);
  } catch (error) {
    logger.error('Error al exportar Comparativa mensual', error as Error);
    throw new Error('No se pudo exportar el archivo Excel');
  }
};

/**
 * Exporta datos de derivación completos a Excel
 */
export const exportarDerivacionCompleta = (
  datos: DerivacionData[],
  nombreArchivo: string = 'derivacion_completa.xlsx'
): void => {
  try {
    // Convertir datos a formato plano
    const worksheet = XLSX.utils.json_to_sheet(datos);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Entrada datos');

    XLSX.writeFile(workbook, nombreArchivo);
  } catch (error) {
    logger.error('Error al exportar derivación completa', error as Error);
    throw new Error('No se pudo exportar el archivo Excel');
  }
};

/**
 * Exporta Vista por Años a CSV
 */
export const exportarVistaAnualCSV = (datos: ConsumoAnual[]): string => {
  const encabezados = [
    'Año',
    'Suma Consumo Activa (kWh)',
    'Máx Maxímetro (kW)',
    'Periodos',
    'Días',
    'Promedio/Día (kWh)',
  ];

  const filas = datos.map((registro) => [
    registro.año,
    registro.sumaConsumoActiva.toFixed(2),
    registro.maxMaximetro.toFixed(2),
    registro.periodosFacturados,
    registro.sumaDias,
    registro.promedioConsumoPorDia.toFixed(2),
  ]);

  return [encabezados.join(','), ...filas.map((fila) => fila.join(','))].join('\n');
};

/**
 * Exporta Comparativa Mensual a CSV
 */
export const exportarComparativaMensualCSV = (datos: ConsumoMensual[]): string => {
  const filas = datos.map((registro) => {
    const fila = formatearRegistroComparativa(registro);
    return ENCABEZADOS_COMPARATIVA_MENSUAL.map((encabezado) => fila[encabezado]);
  });

  return [ENCABEZADOS_COMPARATIVA_MENSUAL.join(','), ...filas.map((fila) => fila.join(','))].join(
    '\n'
  );
};

/**
 * Descarga un string como archivo
 */
export const descargarArchivo = (
  contenido: string,
  nombreArchivo: string,
  tipo: string = 'text/csv'
): void => {
  try {
    const blob = new Blob([contenido], { type: tipo });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    logger.error('Error al descargar archivo', error as Error);
    throw new Error('No se pudo descargar el archivo');
  }
};

/**
 * Exporta análisis completo en un solo archivo Excel con múltiples hojas
 */
export const exportarAnalisisCompleto = (
  vistaAnual: ConsumoAnual[],
  comparativaMensual: ConsumoMensual[],
  derivacionData: DerivacionData[],
  nombreArchivo: string = 'analisis_completo.xlsx'
): void => {
  try {
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Vista por años
    const datosAnuales = vistaAnual.map((r) => ({
      Año: r.año,
      'Suma Consumo Activa (kWh)': r.sumaConsumoActiva.toFixed(2),
      'Máx Maxímetro (kW)': r.maxMaximetro.toFixed(2),
      Periodos: r.periodosFacturados,
      Días: r.sumaDias,
      'Promedio/Día (kWh)': r.promedioConsumoPorDia.toFixed(2),
    }));
    const wsAnual = XLSX.utils.json_to_sheet(datosAnuales);
    XLSX.utils.book_append_sheet(workbook, wsAnual, 'Vista por años');

    // Hoja 2: Comparativa Mensual
    const datosMensuales = comparativaMensual.map(formatearRegistroComparativa);
    const wsMensual = XLSX.utils.json_to_sheet(datosMensuales, {
      header: ENCABEZADOS_COMPARATIVA_MENSUAL as string[],
    });
    wsMensual['!cols'] = [
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
      { wch: 8 },
      { wch: 28 },
      { wch: 14 },
      { wch: 18 },
      { wch: 40 },
      { wch: 8 },
      { wch: 6 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsMensual, 'Comparativa Mensual');

    // Hoja 3: Entrada datos (primeras 100 filas para no saturar)
    const datosLimitados = derivacionData.slice(0, 100);
    const wsEntrada = XLSX.utils.json_to_sheet(datosLimitados);
    XLSX.utils.book_append_sheet(workbook, wsEntrada, 'Entrada datos');

    // Descargar archivo
    XLSX.writeFile(workbook, nombreArchivo);
  } catch (error) {
    logger.error('Error al exportar análisis completo', error as Error);
    throw new Error('No se pudo exportar el análisis completo');
  }
};
