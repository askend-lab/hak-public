// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { useEffect } from "react";
import { CloseIcon } from "./ui/Icons";

export type NotificationType = "success" | "error" | "warning" | "info";
export type NotificationColor =
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "neutral";
export interface NotificationAction {
  label: string;
  onClick: () => void;
}
interface NotificationProps {
  type: NotificationType;
  color?: NotificationColor | undefined;
  message: string;
  description?: string | undefined;
  action?: NotificationAction | undefined;
  duration?: number | undefined;
  onClose: () => void;
}

const typeToColorMap: Record<NotificationType, NotificationColor> = {
  success: "success",
  error: "danger",
  warning: "warning",
  info: "primary",
};

function NotificationBody({ description, action, onClose }: { description?: string | undefined; action?: NotificationAction | undefined; onClose: () => void }) {
  if (!description && !action) {return null;}
  const handleAction = () => { action?.onClick(); onClose(); };
  return (
    <p>
      {description}
      {description && action && " "}
      {action && <button className="notification-action-link" onClick={handleAction}>{action.label}</button>}
    </p>
  );
}

export default function Notification({ type, color, message, description, action, duration = 4000, onClose }: NotificationProps) {
  useEffect(() => {
    if (duration > 0) { const t = setTimeout(onClose, duration); return () => clearTimeout(t); }
    return undefined;
  }, [duration, onClose]);
  const resolvedColor = color ?? typeToColorMap[type];
  const role = type === "error" ? "alert" : "status";
  return (
    <div className={`modal modal--small modal--${resolvedColor}--outlined modal--outlined notification-toast`} role={role}>
      <div className="modal__top">
        <p className="notification__message">{message}</p>
        <button onClick={onClose} aria-label="Sulge teade"><CloseIcon size="2xl" /></button>
      </div>
      <NotificationBody description={description} action={action} onClose={onClose} />
    </div>
  );
}
