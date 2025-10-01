import React from 'react'
import { Button } from '../../components/ui'
import styles from './ATRFormActions.module.css'

interface ATRFormActionsProps {
  canSubmit: boolean
  isSubmitting: boolean
  onCancel: () => void
  onReset?: () => void
  showReset?: boolean
}

export const ATRFormActions: React.FC<ATRFormActionsProps> = ({
  canSubmit,
  isSubmitting,
  onCancel,
  onReset,
  showReset = false,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.leftActions}>
        {showReset && onReset && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onReset}
            disabled={isSubmitting}
          >
            Limpiar
          </Button>
        )}
      </div>

      <div className={styles.rightActions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!canSubmit}
        >
          💾 Guardar Registro
        </Button>
      </div>
    </div>
  )
}