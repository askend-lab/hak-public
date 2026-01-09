import { useState, useCallback } from 'react';

import { Modal } from '../ui/Modal';

interface ShareTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskName: string;
}

export function ShareTaskModal({ isOpen, onClose, taskId, taskName }: ShareTaskModalProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/shared/${taskId}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const copyBtnClasses = ['share-task-modal__copy-btn', copied && 'share-task-modal__copy-btn--copied'].filter(Boolean).join(' ')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Task">
      <div className="share-task-modal">
        <p className="share-task-modal__description">
          Share "{taskName}" with others using this link:
        </p>
        
        <div className="share-task-modal__input-group">
          <input type="text" value={shareUrl} readOnly className="share-task-modal__input" />
          <button onClick={handleCopy} className={copyBtnClasses}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <p className="share-task-modal__note">
          Anyone with this link can view the task entries and play audio.
        </p>
      </div>
    </Modal>
  );
}
