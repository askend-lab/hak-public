import { useState } from 'react';

declare const __BUILD_INFO__: { commitHash: string; commitMessage: string; branch: string; commitDate: string; buildTime: string; workingDir: string };

const buildInfo = typeof __BUILD_INFO__ !== 'undefined' ? __BUILD_INFO__ : { commitHash: 'dev', commitMessage: '', branch: 'local', commitDate: '', buildTime: '', workingDir: '' };

function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const isLocalDev = (): boolean => typeof window !== 'undefined' && window.location.hostname === 'localhost';

const Row = ({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) => (
  <div className="build-info-row"><span className="build-info-label">{label}</span><span className={`build-info-value ${className ?? ''}`}>{value}</span></div>
);

const BuildInfoModal = ({ onClose }: { onClose: () => void }) => (
  <div className="build-info-overlay" onClick={onClose}>
    <div className="build-info-modal" onClick={(e) => e.stopPropagation()}>
      <div className="build-info-modal__header"><h3>Build Info</h3><button className="build-info-modal__close" onClick={onClose}>×</button></div>
      <div className="build-info-modal__content">
        <Row label="Hash" value={<code>{buildInfo.commitHash}</code>} />
        <Row label="Branch" value={buildInfo.branch} />
        <Row label="Message" value={buildInfo.commitMessage || '—'} className="build-info-message" />
        <Row label="Committed" value={formatDateTime(buildInfo.commitDate)} />
        <Row label="Built" value={formatDateTime(buildInfo.buildTime)} />
        {isLocalDev() && buildInfo.workingDir && <Row label="Directory" value={buildInfo.workingDir} className="build-info-path" />}
      </div>
    </div>
  </div>
);

export default function BuildInfo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button className="build-info-button" onClick={() => setIsOpen(true)} title="Build info"><span className="build-info-hash">{buildInfo.commitHash}</span></button>
      {isOpen && <BuildInfoModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
