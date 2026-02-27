// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services";
import { logger } from "@hak/shared";
import { PageLoadingState } from "@/components/ui/PageLoadingState";

function parseCookies(): Record<string, string> {
  return document.cookie.split(";").reduce(
    (acc, c) => {
      const parts = c.trim().split("=");
      const k = parts[0] ?? "";
      acc[k] = parts.slice(1).join("="); // eslint-disable-line no-param-reassign -- reduce accumulator pattern
      return acc;
    },
    {} as Record<string, string>,
  );
}

function tryTaraAuth(handleTaraTokens: ReturnType<typeof useAuth>["handleTaraTokens"]): boolean {
  const cookies = parseCookies();
  const accessToken = cookies["hak_access_token"];
  const idToken = cookies["hak_id_token"];
  return Boolean(accessToken && idToken && handleTaraTokens({ accessToken, idToken }));
}

interface CallbackDeps { handleCodeCallback: (code: string) => Promise<boolean>; handleTaraTokens: ReturnType<typeof useAuth>["handleTaraTokens"]; navigate: ReturnType<typeof useNavigate> }

function handleTara(deps: CallbackDeps): string | null {
  if (tryTaraAuth(deps.handleTaraTokens)) { void deps.navigate("/", { replace: true }); return null; }
  return "TARA autentimise viga. Palun proovi uuesti.";
}

async function handleCodeFlow(deps: CallbackDeps, code: string): Promise<string | null> {
  const ok = await deps.handleCodeCallback(code);
  if (ok) { void deps.navigate("/", { replace: true }); return null; }
  return "Autentimise viga. Palun proovi uuesti.";
}

async function processAuthCallback(deps: CallbackDeps): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  if (params.get("auth") === "success") {return handleTara(deps);}
  const code = params.get("code");
  if (code) {return handleCodeFlow(deps, code);}
  if (params.get("error")) {
    logger.error("Auth callback error:", params.get("error"), params.get("error_description"));
    return "Autentimise viga. Palun proovi uuesti.";
  }
  void deps.navigate("/", { replace: true });
  return null;
}

const centerStyle: React.CSSProperties = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" };

function AuthError({ error, onHome }: { error: string; onHome: () => void }) {
  return (
    <main style={{ ...centerStyle, flexDirection: "column", gap: "1rem" }}>
      <p style={{ color: "var(--color-error, red)" }}>Sisselogimine ebaõnnestus: {error}</p>
      <button onClick={onHome} className="button button--primary">Tagasi avalehele</button>
    </main>
  );
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { handleCodeCallback, handleTaraTokens } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) {return;}
    processedRef.current = true;
    void processAuthCallback({ handleCodeCallback, handleTaraTokens, navigate }).then((err) => { if (err) {setError(err);} return undefined; });
  }, [handleCodeCallback, handleTaraTokens, navigate]);

  if (error) { return <AuthError error={error} onHome={() => { void navigate("/", { replace: true }); }} />; }
  return <main style={centerStyle}><PageLoadingState message="Sisenen..." /></main>;
}
