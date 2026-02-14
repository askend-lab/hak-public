// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN ?? "",
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 0.1,
});

import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./features/auth/services";
import { NotificationProvider } from "./contexts/NotificationContext";
import { OnboardingProvider } from "./features/onboarding/contexts/OnboardingContext";
const AuthCallbackPage = lazy(() => import("./features/auth/pages/AuthCallbackPage").then(m => ({ default: m.AuthCallbackPage })));
const SharedTaskPage = lazy(() => import("./features/sharing/pages/SharedTaskPage").then(m => ({ default: m.SharedTaskPage })));
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
              <Suspense fallback={<div className="app-loader"><div className="loader-spinner app-loader__spinner" /></div>}>
                <Routes>
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
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
