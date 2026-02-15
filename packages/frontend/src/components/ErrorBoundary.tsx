// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@hak/shared";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Midagi läks valesti</h2>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>
            Tekkis ootamatu viga
          </p>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              aria-label="Proovi lehte uuesti laadida"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid #ccc",
                cursor: "pointer",
                background: "#fff",
              }}
            >
              Proovi uuesti
            </button>
            <a
              href="/"
              aria-label="Mine avalehele"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid #ccc",
                textDecoration: "none",
                color: "inherit",
                background: "#fff",
              }}
            >
              Avalehele
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
