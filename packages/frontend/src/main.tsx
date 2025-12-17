import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './services/auth'
import App from './App'
import './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
