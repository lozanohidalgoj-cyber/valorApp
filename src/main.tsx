import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { StoreProvider } from './state/StoreContext'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>,
)
