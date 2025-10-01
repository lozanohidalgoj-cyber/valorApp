import React from 'react'
import { Button, Input } from '../../components/ui'
import { UI_TEXT } from '../../constants'
import styles from './LoginForm.module.css'

interface LoginFormProps {
  username: string
  password: string
  remember: boolean
  isLoading: boolean
  canSubmit: boolean
  errors: {
    username?: string
    password?: string
    general?: string
  }
  displayError?: string | null
  onUsernameChange: (_value: string) => void
  onPasswordChange: (_value: string) => void
  onRememberChange: (_value: boolean) => void
  onSubmit: (_event: React.FormEvent) => void
  onRegisterClick: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  username,
  password,
  remember,
  isLoading,
  canSubmit,
  errors,
  displayError,
  onUsernameChange,
  onPasswordChange,
  onRememberChange,
  onSubmit,
  onRegisterClick,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <Input
        label="Usuario"
        type="text"
        value={username}
        onChange={e => onUsernameChange(e.target.value)}
        error={errors.username}
        placeholder={UI_TEXT.LOGIN.USERNAME_PLACEHOLDER}
        autoFocus
        required
      />

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={e => onPasswordChange(e.target.value)}
        error={errors.password}
        placeholder={UI_TEXT.LOGIN.PASSWORD_PLACEHOLDER}
        required
      />

      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="remember"
          checked={remember}
          onChange={e => onRememberChange(e.target.checked)}
          className={styles.checkbox}
        />
        <label htmlFor="remember" className={styles.checkboxLabel}>
          {UI_TEXT.LOGIN.REMEMBER_LABEL}
        </label>
      </div>

      {displayError && (
        <div className={styles.errorMessage}>
          {displayError}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        disabled={!canSubmit}
        className={styles.submitButton}
      >
        {isLoading ? UI_TEXT.LOADING.LOGIN : UI_TEXT.LOGIN.TITLE}
      </Button>

      <div className={styles.registerLink}>
        <button
          type="button"
          onClick={onRegisterClick}
          className={styles.linkButton}
        >
          {UI_TEXT.LOGIN.REGISTER_LINK}
        </button>
      </div>
    </form>
  )
}