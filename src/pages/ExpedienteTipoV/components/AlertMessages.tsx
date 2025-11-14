/**
 * Componente de mensajes de alerta (error/éxito)
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
        <div className="expediente-alert expediente-alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="expediente-alert expediente-alert-success">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}
    </>
  );
};

export const AlertMessages = memo(AlertMessagesComponent);
