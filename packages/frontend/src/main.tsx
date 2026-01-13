import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App'
import { AuthProvider } from './services/auth'
import { NotificationProvider } from './contexts/NotificationContext'
import { OnboardingProvider } from './contexts/OnboardingContext'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import './styles/main.scss'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <OnboardingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="*" element={<App />} />
            </Routes>
          </BrowserRouter>
        </OnboardingProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
