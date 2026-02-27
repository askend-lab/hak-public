// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { logger } from "@hak/shared";
import BaseModal from "@/components/BaseModal";

interface ShareTaskModalProps {
  isOpen: boolean;
  shareToken: string;
  taskName: string;
  onClose: () => void;
  onRevoke?: (() => Promise<void>) | undefined;
}

function ShareActions({ shareUrl, onRevoke, onClose }: { shareUrl: string; onRevoke?: (() => Promise<void>) | undefined; onClose: () => void }) {
  const { showNotification } = useNotification();
  const [isCopying, setIsCopying] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const handleCopy = async () => {
    setIsCopying(true);
    try { await navigator.clipboard.writeText(shareUrl); showNotification({ type: "success", message: "Jagamislink kopeeritud!", color: "success" }); }
    catch (e) { logger.error("Failed to copy share link:", e); showNotification({ type: "error", message: "Viga lingi kopeerimisel" }); }
    finally { setIsCopying(false); }
  };
  const handleRevoke = async () => {
    if (!onRevoke) {return;}
    setIsRevoking(true);
    try { await onRevoke(); showNotification({ type: "success", message: "Jagamine tühistatud" }); onClose(); }
    catch (e) { logger.error("Failed to revoke share:", e); showNotification({ type: "error", message: "Viga jagamise tühistamisel" }); }
    finally { setIsRevoking(false); }
  };
  return (
    <div className="share-task-modal__actions">
      <button onClick={() => { void handleCopy(); }} disabled={isCopying} className="button button--primary" type="button">{isCopying ? "Kopeeritud!" : "Kopeeri"}</button>
      {onRevoke && <button onClick={() => { void handleRevoke(); }} disabled={isRevoking} className="button button--danger" type="button">{isRevoking ? "Tühistamine..." : "Tühista jagamine"}</button>}
    </div>
  );
}

export default function ShareTaskModal({ isOpen, shareToken, taskName, onClose, onRevoke }: ShareTaskModalProps) {
  if (!isOpen) {return null;}
  const shareUrl = `${window.location.origin}/shared/task/${shareToken}`;
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`Jaga ülesanne: ${taskName}`} size="medium" className="share-task-modal">
      <p className="share-task-modal__description">Kopeeri ja jaga seda linki, et teised saaksid ülesannet vaadata. Sisselogimine pole vajalik.</p>
      <div className="share-task-modal__field">
        <label htmlFor="share-url" className="share-task-modal__label">Jagamislink</label>
        <input id="share-url" type="text" value={shareUrl} readOnly className="share-task-modal__input" />
      </div>
      <p className="share-task-modal__expiry">Jagamislink kehtib 90 päeva.</p>
      <ShareActions shareUrl={shareUrl} onRevoke={onRevoke} onClose={onClose} />
    </BaseModal>
  );
}
