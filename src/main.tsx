import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { StoreProvider } from './state/StoreContextNew'
import { AuthProvider } from './auth/AuthContextNew'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </AuthProvider>
  </React.StrictMode>,
)
