import { useState, useEffect } from "react";

declare const __BUILD_INFO__: {
  commitHash: string;
  commitMessage: string;
  branch: string;
  commitDate: string;
  buildTime: string;
  workingDir: string;
};

interface RuntimeBuildInfo {
  buildId?: string | undefined;
  commitHash: string;
  commitHashFull?: string | undefined;
  branch: string;
  message?: string | undefined;
  builtAt?: string | undefined;
  deployedAt?: string | undefined;
  environment?: string | undefined;
}

const buildTimeInfo =
  typeof __BUILD_INFO__ !== "undefined"
    ? __BUILD_INFO__
    : {
        commitHash: "dev",
        commitMessage: "",
        branch: "local",
        commitDate: "",
        buildTime: "",
        workingDir: "",
      };

function formatDateTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("et-EE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const isLocalDev = (): boolean =>
  typeof window !== "undefined" && window.location.hostname === "localhost";

const Row = ({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div className="build-info-row">
    <span className="build-info-label">{label}</span>
    <span className={`build-info-value ${className ?? ""}`}>{value}</span>
  </div>
);

function useBuildInfo(): RuntimeBuildInfo {
  const [runtimeInfo, setRuntimeInfo] = useState<RuntimeBuildInfo | null>(null);

  useEffect(() => {
    if (isLocalDev()) return;
    fetch("/build-info.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setRuntimeInfo(data))
      .catch(() => {});
  }, []);

  if (runtimeInfo) {
    return {
      buildId: runtimeInfo.buildId,
      commitHash: runtimeInfo.commitHash || buildTimeInfo.commitHash,
      commitHashFull: runtimeInfo.commitHashFull,
      branch: runtimeInfo.branch || buildTimeInfo.branch,
      message: runtimeInfo.message || buildTimeInfo.commitMessage,
      builtAt: runtimeInfo.builtAt || buildTimeInfo.buildTime,
      deployedAt: runtimeInfo.deployedAt,
      environment: runtimeInfo.environment,
    };
  }

  return {
    commitHash: buildTimeInfo.commitHash,
    branch: buildTimeInfo.branch,
    message: buildTimeInfo.commitMessage,
    builtAt: buildTimeInfo.buildTime,
  };
}

const BuildInfoModal = ({
  info,
  onClose,
}: {
  info: RuntimeBuildInfo;
  onClose: () => void;
}) => (
  <div className="build-info-overlay" onClick={onClose}>
    <div className="build-info-modal" onClick={(e) => e.stopPropagation()}>
      <div className="build-info-modal__header">
        <h3>Build Info</h3>
        <button className="build-info-modal__close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="build-info-modal__content">
        {info.buildId && (
          <Row label="Build" value={<code>{info.buildId}</code>} />
        )}
        <Row label="Hash" value={<code>{info.commitHash}</code>} />
        <Row label="Branch" value={info.branch} />
        <Row
          label="Message"
          value={info.message || "—"}
          className="build-info-message"
        />
        <Row label="Built" value={formatDateTime(info.builtAt || "")} />
        {info.deployedAt && (
          <Row label="Deployed" value={formatDateTime(info.deployedAt)} />
        )}
        {isLocalDev() && buildTimeInfo.workingDir && (
          <Row
            label="Directory"
            value={buildTimeInfo.workingDir}
            className="build-info-path"
          />
        )}
      </div>
    </div>
  </div>
);

export default function BuildInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const info = useBuildInfo();
  return (
    <>
      <button
        className="build-info-button"
        onClick={() => setIsOpen(true)}
        title="Build info"
      >
        <span className="build-info-hash">{info.commitHash}</span>
      </button>
      {isOpen && (
        <BuildInfoModal info={info} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
