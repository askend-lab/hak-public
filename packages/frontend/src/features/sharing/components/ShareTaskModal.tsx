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
}

export default function ShareTaskModal({
  isOpen,
  shareToken,
  taskName,
  onClose,
}: ShareTaskModalProps) {
  const { showNotification } = useNotification();
  const [isCopying, setIsCopying] = useState(false);
  if (!isOpen) return null;
  const shareUrl = `${window.location.origin}/shared/task/${shareToken}`;
  const handleCopyLink = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      showNotification({
        type: "success",
        message: "Jagamislink kopeeritud!",
        color: "success",
      });
    } catch (e) {
      logger.error("Failed to copy share link:", e);
      showNotification({ type: "error", message: "Viga lingi kopeerimisel" });
    } finally {
      setIsCopying(false);
    }
  };
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Jaga ülesanne: ${taskName}`}
      size="medium"
      className="share-task-modal"
    >
      <p className="share-task-modal__description">
        Kopeeri ja jaga seda linki, et teised saaksid ülesannet vaadata.
        Sisselogimine pole vajalik.
      </p>
      <div className="share-task-modal__field">
        <label htmlFor="share-url" className="share-task-modal__label">
          Jagamislink
        </label>
        <input
          id="share-url"
          type="text"
          value={shareUrl}
          readOnly
          className="share-task-modal__input"
        />
      </div>
      <div className="share-task-modal__actions">
        <button
          onClick={handleCopyLink}
          disabled={isCopying}
          className="button button--primary"
          type="button"
        >
          {isCopying ? "Kopeeritud!" : "Kopeeri"}
        </button>
      </div>
    </BaseModal>
  );
}
