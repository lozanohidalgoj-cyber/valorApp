/**
 * Mensajes de alerta para SaldoATR
 * Memoizado para evitar re-renders innecesarios
 */

import { memo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AlertMessagesProps {
  error: string | null;
  success: string | null;
}

const AlertMessagesComponent = ({ error, success }: AlertMessagesProps) => {
  if (!error && !success) return null;

  return (
    <>
      {error && (
        <div className="saldoatr-alert error">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="saldoatr-alert success">
          <CheckCircle size={18} /> {success}
        </div>
      )}
    </>
  );
};

export const AlertMessages = memo(AlertMessagesComponent);
