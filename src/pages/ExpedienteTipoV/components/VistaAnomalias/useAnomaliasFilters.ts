/**
 * Hook para manejo de filtros de anomalías
 */
import { useState, useMemo, useCallback } from 'react';
import type { ConsumoMensual, DerivacionData } from '../../../../types';

interface UseAnomaliasFiltersProps {
  datos: ConsumoMensual[];
  detallesPorPeriodo: Record<string, DerivacionData[]>;
}

/**
 * Clasifica el tipo de comportamiento según variación porcentual
 */
const clasificarComportamiento = (variacion: number): string => {
  if (variacion < -25) return 'Descenso crítico';
  if (variacion < -10) return 'Descenso moderado';
  if (variacion < -5) return 'Descenso leve';
  if (variacion > 25) return 'Aumento significativo';
  if (variacion > 10) return 'Aumento moderado';
  if (Math.abs(variacion) <= 5) return 'Normal';
  return 'Sin cambio';
};

/**
 * Parsea fecha en formato dd/mm/yyyy a timestamp
 */
const parseFecha = (fechaStr: string): number => {
  const partes = fechaStr.split('/');
  if (partes.length !== 3) return 0;
  const [dia, mes, anio] = partes.map(Number);
  return new Date(anio, mes - 1, dia).getTime();
};

/**
 * Hook que encapsula lógica de filtrado de anomalías
 */
export const useAnomaliasFilters = ({ datos, detallesPorPeriodo }: UseAnomaliasFiltersProps) => {
  const [fechaDesdeFilter, setFechaDesdeFilter] = useState<string>('');
  const [fechaHastaFilter, setFechaHastaFilter] = useState<string>('');
  const [tipoComportamientoFilter, setTipoComportamientoFilter] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Extraer tipos de comportamiento únicos
  const tiposComportamientoUnicos = useMemo(() => {
    const tipos = new Set<string>();

    datos.forEach((registro) => {
      const variacion = registro.variacionPorcentual ?? 0;
      tipos.add(clasificarComportamiento(variacion));
    });

    return Array.from(tipos).sort((a, b) => a.localeCompare(b, 'es'));
  }, [datos]);

  // Aplicar filtros
  const aplicarFiltros = useCallback(
    (registros: ConsumoMensual[]) => {
      return registros.filter((registro) => {
        // Filtro por tipo de comportamiento
        if (tipoComportamientoFilter.length > 0) {
          const variacion = registro.variacionPorcentual ?? 0;
          const tipoRegistro = clasificarComportamiento(variacion);

          if (!tipoComportamientoFilter.includes(tipoRegistro)) {
            return false;
          }
        }

        // Filtro por rango de fechas
        if (fechaDesdeFilter || fechaHastaFilter) {
          const periodoRegistros = detallesPorPeriodo[registro.periodo] || [];
          if (periodoRegistros.length === 0) return true;

          const fechasDesde = periodoRegistros
            .map((r) => {
              const val = (r as unknown as Record<string, unknown>)['Fecha desde'];
              return typeof val === 'string' ? val.trim() : '';
            })
            .filter(Boolean);

          const fechasHasta = periodoRegistros
            .map((r) => {
              const val = (r as unknown as Record<string, unknown>)['Fecha hasta'];
              return typeof val === 'string' ? val.trim() : '';
            })
            .filter(Boolean);

          let minDesde = Number.MAX_SAFE_INTEGER;
          let maxHasta = Number.MIN_SAFE_INTEGER;

          fechasDesde.forEach((f) => {
            const t = parseFecha(f);
            if (t > 0 && t < minDesde) minDesde = t;
          });

          fechasHasta.forEach((f) => {
            const t = parseFecha(f);
            if (t > 0 && t > maxHasta) maxHasta = t;
          });

          if (minDesde === Number.MAX_SAFE_INTEGER || maxHasta === Number.MIN_SAFE_INTEGER) {
            return true;
          }

          // Comparar con filtros
          if (fechaDesdeFilter) {
            const filtroDesdeTs = parseFecha(fechaDesdeFilter);
            if (filtroDesdeTs > 0 && maxHasta < filtroDesdeTs) {
              return false;
            }
          }

          if (fechaHastaFilter) {
            const filtroHastaTs = parseFecha(fechaHastaFilter);
            if (filtroHastaTs > 0 && minDesde > filtroHastaTs) {
              return false;
            }
          }
        }

        return true;
      });
    },
    [tipoComportamientoFilter, fechaDesdeFilter, fechaHastaFilter, detallesPorPeriodo]
  );

  // Toggle tipo de comportamiento
  const toggleTipoComportamiento = useCallback((tipo: string) => {
    setTipoComportamientoFilter((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  }, []);

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setFechaDesdeFilter('');
    setFechaHastaFilter('');
    setTipoComportamientoFilter([]);
  }, []);

  return {
    fechaDesdeFilter,
    setFechaDesdeFilter,
    fechaHastaFilter,
    setFechaHastaFilter,
    tipoComportamientoFilter,
    setTipoComportamientoFilter,
    isDropdownOpen,
    setIsDropdownOpen,
    tiposComportamientoUnicos,
    aplicarFiltros,
    toggleTipoComportamiento,
    resetFilters,
  };
};
