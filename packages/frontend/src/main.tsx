// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import * as Sentry from "@sentry/react";

import { hasTrackingConsent } from "./components/CookieConsent";

import AppLayout from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./features/auth/services";
import { NotificationProvider } from "./contexts/NotificationContext";
import { OnboardingProvider } from "./features/onboarding/contexts/OnboardingContext";
import { DataServiceProvider } from "./contexts/DataServiceContext";
import { CopiedEntriesProvider } from "./contexts/CopiedEntriesContext";
import { initActivityListeners } from "./features/synthesis/utils/warmAudioWorker";
import "./styles/main.scss";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN ?? "",
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD && hasTrackingConsent(),
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  tracesSampleRate: 0.1,
});
const AuthCallbackPage = lazy(() => import("./features/auth/pages/AuthCallbackPage").then(m => ({ default: m.AuthCallbackPage })));
const SharedTaskPage = lazy(() => import("./features/sharing/pages/SharedTaskPage").then(m => ({ default: m.SharedTaskPage })));
const SynthesisRoute = lazy(() => import("./routes/SynthesisRoute"));
const TasksRoute = lazy(() => import("./routes/TasksRoute"));
const SpecsRoute = lazy(() => import("./routes/SpecsRoute"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const AccessibilityPage = lazy(() => import("./pages/AccessibilityPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const RoleSelectionRoute = lazy(() => import("./features/onboarding/components").then(m => ({ default: m.RoleSelectionContent })));

// Initialize warm-up activity listeners (mouse/keyboard/touch → keep Lambda warm)
initActivityListeners();

// Enable accessibility checking in development mode
if (import.meta.env.DEV) {
  void import("./utils/a11y-dev").then(({ initA11yDevMode }) => { // eslint-disable-line promise/always-return -- fire-and-forget dev-only init
    void initA11yDevMode();
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) {throw new Error("Root element not found");}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <DataServiceProvider>
          <NotificationProvider>
            <OnboardingProvider>
              <BrowserRouter>
              <CopiedEntriesProvider>
              <Suspense fallback={<div className="app-loader"><div className="loader-spinner app-loader__spinner" /></div>}>
                <Routes>
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route
                    path="/shared/task/:token"
                    element={<SharedTaskPage />}
                  />
                  <Route element={<AppLayout />}>
                    <Route index element={<SynthesisRoute />} />
                    <Route path="synthesis" element={<SynthesisRoute />} />
                    <Route path="tasks" element={<TasksRoute />} />
                    <Route path="tasks/:taskId" element={<TasksRoute />} />
                    <Route path="specs" element={<SpecsRoute />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="role-selection" element={<RoleSelectionRoute />} />
                    <Route path="accessibility" element={<AccessibilityPage />} />
                    <Route path="privacy" element={<PrivacyPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
              </CopiedEntriesProvider>
              </BrowserRouter>
            </OnboardingProvider>
          </NotificationProvider>
        </DataServiceProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
