import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App'
import { ErrorBoundary } from './components'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { SpecsPage } from './pages/SpecsPage'
import { TasksPage } from './pages/TasksPage'
import { AuthProvider, ProtectedRoute } from './services/auth'
import { AuthStorage } from './services/auth/storage'
import { setAuthTokenGetter } from './services/tasks'
import './i18n'
import './styles/main.scss'
import './styles/eki/main.scss'

setAuthTokenGetter(() => AuthStorage.getIdToken())

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/specs" element={<SpecsPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
