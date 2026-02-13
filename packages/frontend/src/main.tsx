// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN ?? "",
  environment: import.meta.env.MODE,
  enabled: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./features/auth/services";
import { NotificationProvider } from "./contexts/NotificationContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
const AuthCallbackPage = lazy(() => import("./features/auth/pages/AuthCallbackPage").then(m => ({ default: m.AuthCallbackPage })));
const DebugPage = lazy(() => import("./pages/DebugPage").then(m => ({ default: m.DebugPage })));
const SharedTaskPage = lazy(() => import("./pages/SharedTaskPage").then(m => ({ default: m.SharedTaskPage })));
import "./styles/main.scss";

// Enable accessibility checking in development mode
if (import.meta.env.DEV) {
  import("./utils/a11y-dev").then(({ initA11yDevMode }) => {
    initA11yDevMode();
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <OnboardingProvider>
            <BrowserRouter>
              <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="loader-spinner" style={{ width: 48, height: 48 }} /></div>}>
                <Routes>
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/debug-x7k9m" element={<DebugPage />} />
                  <Route
                    path="/shared/task/:token"
                    element={<SharedTaskPage />}
                  />
                  <Route path="*" element={<App />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </OnboardingProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
// Build 20260209115004
