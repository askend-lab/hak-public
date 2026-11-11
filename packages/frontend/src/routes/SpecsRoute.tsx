// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoadingState } from "@/components/ui/PageLoadingState";

const SpecsPage = lazy(() => import("@/components/SpecsPage"));

export default function SpecsRoute() {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<PageLoadingState />}>
      <ErrorBoundary>
        <SpecsPage onBack={() => { void navigate("/synthesis"); }} />
      </ErrorBoundary>
    </Suspense>
  );
}
