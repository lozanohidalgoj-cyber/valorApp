/**
 * Helpers para VistaAnomalias
 * Funciones auxiliares de scroll y clasificación
 */

/**
 * Hace scroll suave a un periodo específico en la tabla
 * @param tableRef - Referencia a la tabla
 * @param periodo - Periodo en formato YYYY-MM
 */
export const scrollToPeriodo = (
  tableRef: React.RefObject<HTMLTableElement | null>,
  periodo: string
): void => {
  if (!tableRef.current) return;

  const row = tableRef.current.querySelector(`[data-periodo="${periodo}"]`) as HTMLElement;
  if (!row) return;

  // Scroll en el contenedor de la tabla
  const tableWrapper = tableRef.current.closest(
    '.expediente-anomalias__table-wrapper'
  ) as HTMLElement;

  if (tableWrapper) {
    const rowTop = row.offsetTop;
    const rowHeight = row.offsetHeight;
    const containerHeight = tableWrapper.clientHeight;
    const scrollTo = rowTop - containerHeight / 2 + rowHeight / 2;

    tableWrapper.scrollTo({ top: scrollTo, behavior: 'smooth' });
  }

  // Scroll del viewport
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Highlight temporal
  row.classList.add('expediente-anomalias__row--highlighted');
  setTimeout(() => {
    row.classList.remove('expediente-anomalias__row--highlighted');
  }, 3000);
};

/**
 * Clasifica el comportamiento según variación porcentual
 * @param variacion - Variación porcentual
 * @returns Tipo de comportamiento
 */
export const clasificarComportamiento = (variacion: number): string => {
  if (variacion < -25) return 'Descenso crítico';
  if (variacion < -10) return 'Descenso moderado';
  if (variacion < -5) return 'Descenso leve';
  if (variacion > 25) return 'Aumento significativo';
  if (variacion > 10) return 'Aumento moderado';
  if (Math.abs(variacion) <= 5) return 'Normal';
  return 'Sin cambio';
};

/**
 * Obtiene clase CSS según tipo de comportamiento
 * @param tipo - Tipo de comportamiento
 * @returns Clase CSS
 */
export const obtenerClaseComportamiento = (tipo: string): string => {
  const mapaClases: Record<string, string> = {
    'Descenso crítico': 'descenso-critico',
    'Descenso moderado': 'descenso-moderado',
    'Descenso leve': 'descenso-leve',
    'Aumento significativo': 'aumento-significativo',
    'Aumento moderado': 'aumento-moderado',
    Normal: 'normal',
    'Sin cambio': 'sin-cambio',
  };

  return mapaClases[tipo] ?? '';
};
