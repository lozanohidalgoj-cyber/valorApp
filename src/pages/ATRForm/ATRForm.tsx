import React from 'react'
import { Card, CardHeader } from '../../components/ui'
import { ATRFormFields } from './ATRFormFields'
import { ATRFormActions } from './ATRFormActions'
import { useATRFormPage } from './useATRFormPage'
import styles from './ATRForm.module.css'

export const ATRForm: React.FC = () => {
  const {
    formData,
    errors,
    isSubmitting,
    canSubmit,
    shouldShowFraudeTipo,
    updateField,
    handleSubmit,
    resetForm,
    navigateHome,
  } = useATRFormPage()

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <h3 className={styles.title}>Nuevo Registro ATR</h3>
          <p className={styles.subtitle}>
            Complete la información del registro de valoración energética
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* General error message */}
          {errors.general && (
            <div className={styles.errorAlert}>
              {errors.general}
            </div>
          )}

          <ATRFormFields
            formData={formData}
            errors={errors}
            shouldShowFraudeTipo={shouldShowFraudeTipo}
            onFieldChange={updateField}
          />

          <ATRFormActions
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
            onCancel={navigateHome}
            onReset={resetForm}
            showReset={true}
          />
        </form>
      </Card>
    </div>
  )
}