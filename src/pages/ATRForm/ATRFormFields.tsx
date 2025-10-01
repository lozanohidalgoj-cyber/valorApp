import React from 'react'
import { Input, Select, Textarea } from '../../components/ui'
import { FRAUDE_TIPOS } from '../../types/atr'
import { ATRFormData } from '../../hooks/business/useATRForm'
import styles from './ATRFormFields.module.css'

interface ATRFormFieldsProps {
  formData: ATRFormData
  errors: Record<string, string>
  shouldShowFraudeTipo: boolean
  onFieldChange: <K extends keyof ATRFormData>(field: K, value: ATRFormData[K]) => void
}

export const ATRFormFields: React.FC<ATRFormFieldsProps> = ({
  formData,
  errors,
  shouldShowFraudeTipo,
  onFieldChange,
}) => {
  const gestionOptions = [
    { value: 'averia', label: '🔧 Avería' },
    { value: 'fraude', label: '⚠️ Fraude' },
  ]

  const valorTipoOptions = [
    { value: 'estimado', label: '~ Estimado (contador digital)' },
    { value: 'real', label: '✓ Real (verificado)' },
  ]

  const fraudeTipoOptions = FRAUDE_TIPOS.map(tipo => ({
    value: tipo.value,
    label: tipo.label,
  }))

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <Input
          label="Fecha del Registro"
          type="date"
          value={formData.fechaISO}
          onChange={e => onFieldChange('fechaISO', e.target.value)}
          error={errors.fechaISO}
          required
        />
        
        <Input
          label="ID del Cliente"
          value={formData.clienteId}
          onChange={e => onFieldChange('clienteId', e.target.value)}
          error={errors.clienteId}
          placeholder="Ej: CLI-001234"
          required
        />
      </div>

      <div className={styles.row}>
        <Select
          label="Tipo de Gestión"
          value={formData.gestion}
          onChange={e => onFieldChange('gestion', e.target.value as 'averia' | 'fraude')}
          options={gestionOptions}
          error={errors.gestion}
          required
        />

        {shouldShowFraudeTipo && (
          <Select
            label="Tipo de Fraude"
            value={formData.fraudeTipo || ''}
            onChange={e => onFieldChange('fraudeTipo', e.target.value as any)}
            options={fraudeTipoOptions}
            placeholder="Seleccione el tipo…"
            error={errors.fraudeTipo}
            required
          />
        )}
      </div>

      <div className={styles.row}>
        <Select
          label="Tipo de Valor"
          value={formData.valorTipo}
          onChange={e => onFieldChange('valorTipo', e.target.value as 'estimado' | 'real')}
          options={valorTipoOptions}
          error={errors.valorTipo}
          required
        />

        <Input
          label="Consumo (kWh)"
          type="number"
          min="0"
          step="0.01"
          value={formData.kWh.toString()}
          onChange={e => onFieldChange('kWh', parseFloat(e.target.value) || 0)}
          error={errors.kWh}
          placeholder="0.00"
          required
        />
      </div>

      <Textarea
        label="Notas y Observaciones"
        value={formData.notas || ''}
        onChange={e => onFieldChange('notas', e.target.value)}
        rows={3}
        placeholder="Información adicional sobre el registro..."
        error={errors.notas}
      />
    </div>
  )
}