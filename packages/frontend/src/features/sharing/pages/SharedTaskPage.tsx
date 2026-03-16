// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDataService } from "@/contexts/DataServiceContext";
import { Task } from "@/types/task";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/features/auth/services";
import { saveReturnUrl } from "@/features/auth/services/storage";
import { useSharedTaskAudio } from "@/features/sharing/hooks/useSharedTaskAudio";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useCopiedEntries } from "@/contexts/CopiedEntriesContext";
import { logger } from "@hak/shared";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import LoginModal from "@/features/auth/components/LoginModal";
import SentenceSynthesisItem from "@/features/synthesis/components/SentenceSynthesisItem";
import { PlayAllButton } from "@/components/ui/PlayAllButton";
import { PageLoadingState } from "@/components/ui/PageLoadingState";

function useSharedTaskData(token: string | undefined) {
  const dataService = useDataService();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTask(): Promise<void> {
      if (!token) { setError("Token puudub"); setIsLoading(false); return; }
      try {
        const foundTask = await dataService.getTaskByShareToken(token);
        if (foundTask) { setTask(foundTask); }
        else { setError("Ülesannet ei leitud"); }
      } catch (err) {
        logger.error("Failed to load shared task:", err);
        setError("Viga ülesande laadimisel");
      } finally { setIsLoading(false); }
    }
    void loadTask();
  }, [token, dataService]);

  return { task, isLoading, error };
}

function InfoBanner({ onCopy, disabled }: { onCopy: () => void; disabled: boolean }) {
  return (
    <aside className="shared-task-info-banner shared-task-info-banner--inline" aria-label="Jagatud ülesande teave">
      <div className="shared-task-info-banner-content">
        <div className="shared-task-info-banner-text">
          <div className="shared-task-info-banner-title">Jagatud ülesanne</div>
          <div className="shared-task-info-banner-description">Kopeeri laused, et neid muuta ja uusi versioone luua. Jagamislink kehtib 90 päeva.</div>
        </div>
        <button className="button button--secondary" onClick={onCopy} disabled={disabled}>Kopeeri</button>
      </div>
    </aside>
  );
}

function EntryList({ entries, audio, onPlay }: { entries: Task["entries"]; audio: ReturnType<typeof useSharedTaskAudio>; onPlay: (id: string) => void }) {
  if (entries.length === 0) { return <div className="shared-entries-empty"><p className="shared-entries-empty-description">See ülesanne ei sisalda ühtegi lauset.</p></div>; }
  return <>{entries.map((e) => <SentenceSynthesisItem key={e.id} id={e.id} text={e.text} mode="readonly" isPlaying={audio.currentPlayingId === e.id} isLoading={audio.currentLoadingId === e.id} onPlay={onPlay} />)}</>;
}

function useSharedPageActions(task: Task | null) {
  const navigate = useNavigate();
  const { isAuthenticated, user, showLoginModal, setShowLoginModal } = useAuth();
  const { showNotification } = useNotification();
  const { setCopiedEntries } = useCopiedEntries();
  const audio = useSharedTaskAudio();
  const entries = task?.entries || [];
  const onPlayEntry = useCallback((id: string) => { audio.handlePlayEntry(id, entries); }, [audio.handlePlayEntry, entries]);
  const onPlayAll = useCallback(async () => { await audio.handlePlayAll(entries); }, [audio.handlePlayAll, entries]);
  const handleCopy = (): void => {
    if (!task?.entries) { return; }
    if (!isAuthenticated) { saveReturnUrl(); setShowLoginModal(true); return; }
    setCopiedEntries(task.entries);
    showNotification({ type: "success", message: "Laused kopeeritud!" });
    void navigate("/synthesis");
  };
  return { navigate, isAuthenticated, user, showLoginModal, setShowLoginModal, audio, entries, onPlayEntry, onPlayAll, handleCopy };
}

function SharedTaskError({ message }: { message: string }) {
  return <main className="shared-task-error"><h1>{message}</h1><p>Jagamislink võib olla aegunud, tühistatud või vigane.</p></main>;
}

interface SharedTaskContentProps {
  task: Task; audio: ReturnType<typeof useSharedTaskAudio>;
  entries: Task["entries"]; onPlayEntry: (id: string) => void;
  onPlayAll: () => Promise<void>; onCopy: () => void;
  isAuthenticated: boolean; user: ReturnType<typeof useAuth>["user"];
  showLoginModal: boolean; setShowLoginModal: (v: boolean) => void;
}

function SharedTaskContent({ task, audio, entries, onPlayEntry, onPlayAll, onCopy, isAuthenticated, user, showLoginModal, setShowLoginModal }: SharedTaskContentProps) {
  const onLogin = () => setShowLoginModal(true);
  return (
    <div className="page-layout">
      <a href="#main-content" className="skip-link">Liigu põhisisu juurde</a>
      <AppHeader isAuthenticated={isAuthenticated} user={user} onTasksClick={onLogin} onHelpClick={() => {}} onLoginClick={onLogin} />
      <main id="main-content" tabIndex={-1} className="page-layout__main">
        <div className="page-header page-header--full">
          <div className="page-header__content">
            <h1 className="page-header__title">{task.name || "Ülesande nimi"}</h1>
            <p className="page-header__description">{task.description || "Sisesta tekst või sõna, et kuulata selle hääldust ja uurida variante"}</p>
          </div>
          <div className="page-header__actions">
            <PlayAllButton isPlaying={audio.isPlayingAll} isLoading={audio.isLoadingPlayAll} disabled={entries.length === 0} onClick={() => { void onPlayAll(); }} />
          </div>
        </div>
        <div className="page-content">
          <InfoBanner onCopy={onCopy} disabled={entries.length === 0} />
          <div className="shared-task-entries"><EntryList entries={entries} audio={audio} onPlay={onPlayEntry} /></div>
        </div>
      </main>
      <footer className="page-layout__footer page-footer--full"><Footer /></footer>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

export function SharedTaskPage() {
  const { token } = useParams<{ token: string }>();
  const { task, isLoading, error } = useSharedTaskData(token);
  const { audio, entries, onPlayEntry, onPlayAll, handleCopy, isAuthenticated, user, showLoginModal, setShowLoginModal } = useSharedPageActions(task);
  useDocumentTitle(task?.name ? `Jagatud: ${task.name}` : undefined);

  if (isLoading) {return <PageLoadingState />;}
  if (error || !task) { return <SharedTaskError message={error || "Ülesannet ei leitud"} />; }
  return <SharedTaskContent task={task} audio={audio} entries={entries} onPlayEntry={onPlayEntry} onPlayAll={onPlayAll}
    onCopy={handleCopy} isAuthenticated={isAuthenticated} user={user} showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />;
}
