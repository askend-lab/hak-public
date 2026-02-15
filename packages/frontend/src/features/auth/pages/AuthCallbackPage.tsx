// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services";
import { logger } from "@hak/shared";
import { PageLoadingState } from "@/components/ui/PageLoadingState";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { handleCodeCallback, handleTaraTokens } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    async function processCallback() {
      if (processedRef.current) return;
      processedRef.current = true;

      const queryParams = new URLSearchParams(window.location.search);

      // Handle TARA auth success — tokens are in Secure cookies, not URL params
      const authStatus = queryParams.get("auth");
      if (authStatus === "success") {
        const cookies = document.cookie.split(";").reduce(
          (acc, c) => {
            const parts = c.trim().split("=");
            const k = parts[0] ?? "";
            acc[k] = parts.slice(1).join("=");
            return acc;
          },
          {} as Record<string, string>,
        );

        const accessToken = cookies["hak_access_token"];
        const idToken = cookies["hak_id_token"];

        if (accessToken && idToken) {
          const success = handleTaraTokens({ accessToken, idToken });
          if (success) {
            navigate("/", { replace: true });
            return;
          }
        }
        setError("TARA autentimise viga. Palun proovi uuesti.");
        return;
      }

      // Handle Cognito code flow (Google/Facebook)
      const code = queryParams.get("code");
      if (code) {
        const success = await handleCodeCallback(code);
        if (success) {
          navigate("/", { replace: true });
          return;
        } else {
          setError("Autentimise viga. Palun proovi uuesti.");
          return;
        }
      }

      const errorParam = queryParams.get("error");
      const errorDescription = queryParams.get("error_description");
      if (errorParam) {
        logger.error("Auth callback error:", errorParam, errorDescription);
        setError("Autentimise viga. Palun proovi uuesti.");
        return;
      }

      navigate("/", { replace: true });
    }

    void processCallback();
  }, [handleCodeCallback, handleTaraTokens, navigate]);

  if (error) {
    return (
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: "1rem",
        }}
      >
        <p style={{ color: "var(--color-error, red)" }}>
          Sisselogimine ebaõnnestus: {error}
        </p>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="button button--primary"
        >
          Tagasi avalehele
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <PageLoadingState message="Sisenen..." />
    </main>
  );
}
