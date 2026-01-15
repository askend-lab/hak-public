import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://74c44413767ff0bf2853d9f0e4f4b9d4@o4510500722376704.ingest.de.sentry.io/4510709250261072',
  environment: import.meta.env.MODE,
  enabled: true,
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
import { DebugPage } from './pages/DebugPage'
import { SharedTaskPage } from './pages/SharedTaskPage'
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
              <Route path="/debug-x7k9m" element={<DebugPage />} />
              <Route path="/shared/task/:token" element={<SharedTaskPage />} />
              <Route path="*" element={<App />} />
            </Routes>
          </BrowserRouter>
        </OnboardingProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
