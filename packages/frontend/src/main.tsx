import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App'
import { ErrorBoundary } from './components'
import { SpecsPage } from './pages/SpecsPage'
import { TasksPage } from './pages/TasksPage'
import { AuthProvider } from './services/auth'
import './i18n'
import './styles/main.scss'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/specs" element={<SpecsPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
