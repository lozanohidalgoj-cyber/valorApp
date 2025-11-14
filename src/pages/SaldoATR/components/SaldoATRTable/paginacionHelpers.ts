/**
 * Helpers para paginación de tabla
 */

/**
 * Genera array de números de página con elipsis para navegación
 * @param currentPage - Página actual
 * @param totalPages - Total de páginas
 * @returns Array con números de página y elipsis
 */
export const generarNumerosPagina = (
  currentPage: number,
  totalPages: number
): (number | string)[] => {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];

  // Páginas iniciales
  if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, '...', totalPages);
    return pages;
  }

  // Páginas finales
  if (currentPage >= totalPages - 2) {
    pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    return pages;
  }

  // Páginas del medio
  pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
  return pages;
};
