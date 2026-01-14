import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

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
