import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { OnboardingProvider } from './contexts/OnboardingContext'
import './styles/main.scss'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <OnboardingProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </OnboardingProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
