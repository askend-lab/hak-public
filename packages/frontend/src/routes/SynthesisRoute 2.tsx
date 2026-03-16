// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { lazy, Suspense } from "react";
import { useOutletContext } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoadingState } from "@/components/ui/PageLoadingState";
import { SynthesisPageProvider } from "@/features/synthesis/contexts/SynthesisPageContext";
import SynthesisModals from "@/features/synthesis/components/SynthesisModals";
import type { AppLayoutContext } from "./types";

const SynthesisView = lazy(() => import("@/features/synthesis/components/SynthesisView"));

export default function SynthesisRoute() {
  const { synthesis, taskHandlers, showNotification, isAuthenticated, setShowLoginModal } =
    useOutletContext<AppLayoutContext>();

  return (
    <Suspense fallback={<PageLoadingState />}>
      <ErrorBoundary>
        <SynthesisPageProvider
          sentences={synthesis.sentences}
          setSentences={synthesis.setSentences}
          synthesis={synthesis}
          taskHandlers={taskHandlers}
          showNotification={showNotification}
          isAuthenticated={isAuthenticated}
          onLogin={() => setShowLoginModal(true)}
        >
          <SynthesisView />
          <SynthesisModals showNotification={showNotification} />
        </SynthesisPageProvider>
      </ErrorBoundary>
    </Suspense>
  );
}
