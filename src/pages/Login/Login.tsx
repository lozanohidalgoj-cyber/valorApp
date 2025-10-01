import React from 'react'
import { Card } from '../../components/ui'
import { UI_TEXT } from '../../constants'
import { LoginHeader } from './LoginHeader'
import { LoginForm } from './LoginForm'
import { useLogin } from './useLogin'
import styles from './Login.module.css'

export const Login: React.FC = () => {
  const {
    formData,
    errors,
    isLoading,
    canSubmit,
    displayError,
    setUsername,
    setPassword,
    setRemember,
    handleSubmit,
    goToRegister,
  } = useLogin()

  return (
    <div className={styles.container}>
      <div className={styles.brand}>ayesa</div>
      
      <Card className={styles.card}>
        <LoginHeader />
        
        <LoginForm
          username={formData.username}
          password={formData.password}
          remember={formData.remember}
          isLoading={isLoading}
          canSubmit={canSubmit}
          errors={errors}
          displayError={displayError}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onRememberChange={setRemember}
          onSubmit={handleSubmit}
          onRegisterClick={goToRegister}
        />
      </Card>
    </div>
  )
}