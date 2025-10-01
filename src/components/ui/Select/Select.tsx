import React from 'react'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder,
  className = '',
  ...props
}) => {
  const selectClasses = [
    styles.select,
    error && styles.error,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      
      <select
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <span className={styles.errorText}>
          {error}
        </span>
      )}
      
      {helperText && !error && (
        <span className={styles.helperText}>
          {helperText}
        </span>
      )}
    </div>
  )
}