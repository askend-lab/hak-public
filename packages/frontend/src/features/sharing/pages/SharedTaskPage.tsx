// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDataService } from "@/contexts/DataServiceContext";
import { Task } from "@/types/task";
import { useNotification } from "@/contexts/NotificationContext";
import { useSharedTaskAudio } from "@/features/sharing/hooks/useSharedTaskAudio";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useCopiedEntries } from "@/contexts/CopiedEntriesContext";
import { logger } from "@hak/shared";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import SentenceSynthesisItem from "@/features/synthesis/components/SentenceSynthesisItem";
import { PlayAllButton } from "@/components/ui/PlayAllButton";
import { PageLoadingState } from "@/components/ui/PageLoadingState";

export function SharedTaskPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const dataService = useDataService();
  const { setCopiedEntries } = useCopiedEntries();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    currentPlayingId,
    currentLoadingId,
    isPlayingAll,
    isLoadingPlayAll,
    handlePlayEntry,
    handlePlayAll,
  } = useSharedTaskAudio();

  useDocumentTitle(task?.name ? `Jagatud: ${task.name}` : undefined);

  useEffect(() => {
    async function loadTask(): Promise<void> {
      if (!token) {
        setError("Token puudub");
        setIsLoading(false);
        return;
      }

      try {
        const foundTask = await dataService.getTaskByShareToken(token);

        if (foundTask) {
          setTask(foundTask);
        } else {
          setError("Ülesannet ei leitud");
        }
      } catch (err) {
        logger.error("Failed to load shared task:", err);
        setError("Viga ülesande laadimisel");
      } finally {
        setIsLoading(false);
      }
    }

    void loadTask();
  }, [token, dataService]);

  const entries = task?.entries || [];

  const onPlayEntry = useCallback(
    (id: string) => {
      handlePlayEntry(id, entries);
    },
    [handlePlayEntry, entries],
  );

  const onPlayAll = useCallback(async () => {
    await handlePlayAll(entries);
  }, [handlePlayAll, entries]);

  const handleCopyToPlaylist = (): void => {
    if (!task?.entries) {return;}

    setCopiedEntries(task.entries);
    showNotification({ type: "success", message: "Laused kopeeritud!" });
    void navigate("/synthesis");
  };

  // Loading state
  if (isLoading) {
    return <PageLoadingState />;
  }

  // Error state
  if (error || !task) {
    return (
      <main className="shared-task-error">
        <h1>{error || "Ülesannet ei leitud"}</h1>
        <p>Jagamislink võib olla aegunud, tühistatud või vigane.</p>
      </main>
    );
  }

  return (
    <div className="page-layout">
      <a href="#main-content" className="skip-link">
        Liigu põhisisu juurde
      </a>
      <AppHeader
        isAuthenticated={false}
        user={null}
        onTasksClick={() => {}}
        onHelpClick={() => {}}
        onLoginClick={() => {
          void navigate("/");
        }}
      />

      <main id="main-content" tabIndex={-1} className="page-layout__main">
        <div className="page-header page-header--full">
          <div className="page-header__content">
            <h1 className="page-header__title">
              {task.name || "Ülesande nimi"}
            </h1>
            <p className="page-header__description">
              {task.description ||
                "Sisesta tekst või sõna, et kuulata selle hääldust ja uurida variante"}
            </p>
          </div>
          <div className="page-header__actions">
            <PlayAllButton
              isPlaying={isPlayingAll}
              isLoading={isLoadingPlayAll}
              disabled={entries.length === 0}
              onClick={() => { void onPlayAll(); }}
            />
          </div>
        </div>

        <div className="page-content">
          <aside className="shared-task-info-banner shared-task-info-banner--inline" aria-label="Jagatud ülesande teave">
            <div className="shared-task-info-banner-content">
              <div className="shared-task-info-banner-text">
                <div className="shared-task-info-banner-title">
                  Jagatud ülesanne
                </div>
                <div className="shared-task-info-banner-description">
                  Kopeeri laused, et neid muuta ja uusi versioone luua.
                  Jagamislink kehtib 90 päeva.
                </div>
              </div>
              <button
                className="button button--secondary"
                onClick={handleCopyToPlaylist}
                disabled={entries.length === 0}
              >
                Kopeeri
              </button>
            </div>
          </aside>

          <div className="shared-task-entries">
            {entries.length === 0 ? (
              <div className="shared-entries-empty">
                <p className="shared-entries-empty-description">
                  See ülesanne ei sisalda ühtegi lauset.
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <SentenceSynthesisItem
                  key={entry.id}
                  id={entry.id}
                  text={entry.text}
                  mode="readonly"
                  isPlaying={currentPlayingId === entry.id}
                  isLoading={currentLoadingId === entry.id}
                  onPlay={onPlayEntry}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="page-layout__footer page-footer--full">
        <Footer />
      </footer>
    </div>
  );
}
