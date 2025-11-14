/**
 * Barra de acciones para importar archivos
 */

import { Upload } from 'lucide-react';
import type { RefObject, ChangeEvent } from 'react';

interface ImportActionsProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const ImportActions = ({ inputRef, onFileChange }: ImportActionsProps) => {
  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="saldoatr-actions">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      <button className="saldoatr-import-btn" onClick={handleClick}>
        <Upload size={20} /> Importar Saldo ATR
      </button>
      <span className="saldoatr-note">
        Importa el archivo <strong>Saldo ATR.csv</strong> (14 columnas). Se actualizarán
        automáticamente las columnas A, C, G, H, I, J y P según el mapeo definido.
      </span>
    </div>
  );
};
