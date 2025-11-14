/**
 * Hook personalizado para manejar la carga y procesamiento de archivos de derivación
 */

import { useState, useCallback } from 'react';
import type { DerivacionData } from '../../../types';
import {
  importarArchivoDerivacion,
  formatearErroresImportacion,
  COLUMNAS_PERMITIDAS,
} from '../../../services/importDerivacionService';

interface UseFileLoaderReturn {
  data: DerivacionData[];
  columns: string[];
  loaded: boolean;
  error: string | null;
  loadFile: (file: File) => Promise<void>;
  resetData: () => void;
  setData: (newData: DerivacionData[], newColumns: string[]) => void;
  setLoaded: (isLoaded: boolean) => void;
}

export const useFileLoader = (): UseFileLoaderReturn => {
  const [data, setData] = useState<DerivacionData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFile = useCallback(async (file: File): Promise<void> => {
    setError(null);
    setLoaded(false);
    try {
      const resultado = await importarArchivoDerivacion(file);

      if (!resultado.exito || resultado.datos.length === 0) {
        const mensajeError =
          formatearErroresImportacion(resultado.errores) ||
          'No se pudo importar el archivo seleccionado';
        setData([]);
        setColumns([]);
        setLoaded(false);
        setError(mensajeError);
        throw new Error(mensajeError);
      }

      const columnasPresentes = new Set<string>();
      resultado.datos.forEach((registro) => {
        Object.keys(registro).forEach((columna) => {
          if (columna) {
            columnasPresentes.add(columna);
          }
        });
      });

      const columnasOrdenadas = (COLUMNAS_PERMITIDAS as readonly string[]).filter((columna) =>
        columnasPresentes.has(columna)
      );

      const columnasExtras = Array.from(columnasPresentes).filter(
        (columna) => !(COLUMNAS_PERMITIDAS as readonly string[]).includes(columna)
      );

      const columnasFinales = [...columnasOrdenadas, ...columnasExtras.sort()];

      setColumns(columnasFinales);
      setData(resultado.datos);
      setLoaded(true);

      if (resultado.advertencias.length > 0) {
        setError(resultado.advertencias.join('\n'));
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido al importar';
      setError(mensaje);
      setData([]);
      setColumns([]);
      setLoaded(false);
      throw err instanceof Error ? err : new Error(mensaje);
    }
  }, []);

  const resetData = useCallback(() => {
    setData([]);
    setColumns([]);
    setLoaded(false);
    setError(null);
  }, []);

  const updateData = useCallback((newData: DerivacionData[], newColumns: string[]) => {
    setData(newData);
    setColumns(newColumns);
  }, []);

  const updateLoaded = useCallback((isLoaded: boolean) => {
    setLoaded(isLoaded);
  }, []);

  return {
    data,
    columns,
    loaded,
    error,
    loadFile,
    resetData,
    setData: updateData,
    setLoaded: updateLoaded,
  };
};
