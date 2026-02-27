// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { useEffect, useRef, useId } from "react";
import { CloseIcon } from "./ui/Icons";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | null;
  showCloseButton?: boolean;
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  preventBackdropClose?: boolean;
}

const ModalHeader = ({
  title,
  showCloseButton,
  onClose,
  headerClasses,
  titleId,
}: {
  title?: string | null | undefined;
  showCloseButton: boolean;
  onClose: () => void;
  headerClasses: string;
  titleId: string;
}) => (
  <div className={headerClasses}>
    {title && (
      <h2 id={titleId} className="base-modal__title">
        {title}
      </h2>
    )}
    {showCloseButton && (
      <button
        onClick={onClose}
        className="base-modal__close"
        aria-label="Sulge"
        type="button"
      >
        <CloseIcon size="2xl" />
      </button>
    )}
  </div>
);

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusBoundary(modalRef: React.RefObject<HTMLDivElement | null>): { first: HTMLElement; last: HTMLElement } | null {
  if (!modalRef.current) {return null;}
  const els = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  const first = els[0];
  const last = els[els.length - 1];
  return first && last ? { first, last } : null;
}

function handleTabTrap(e: KeyboardEvent, modalRef: React.RefObject<HTMLDivElement | null>): void {
  if (e.key !== "Tab") {return;}
  const bounds = getFocusBoundary(modalRef);
  if (!bounds) {return;}
  if (e.shiftKey && document.activeElement === bounds.first) { e.preventDefault(); bounds.last.focus(); }
  else if (!e.shiftKey && document.activeElement === bounds.last) { e.preventDefault(); bounds.first.focus(); }
}

function useModalFocusTrap(isOpen: boolean, onClose: () => void) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!isOpen) {return;}
    previousFocusRef.current = document.activeElement as HTMLElement;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") {onCloseRef.current();} };
    const onTab = (e: KeyboardEvent) => { handleTabTrap(e, modalRef); };
    document.addEventListener("keydown", onEsc);
    document.addEventListener("keydown", onTab);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => { modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus(); });
    return () => { document.removeEventListener("keydown", onEsc); document.removeEventListener("keydown", onTab); document.body.style.overflow = prev; previousFocusRef.current?.focus(); };
  }, [isOpen]);

  return modalRef;
}

function resolveModalDefaults(props: BaseModalProps) {
  return {
    showCloseButton: props.showCloseButton ?? true,
    size: props.size ?? "medium",
    className: props.className ?? "",
    headerClassName: props.headerClassName ?? "",
    contentClassName: props.contentClassName ?? "",
  };
}

function ModalBody({ modalRef, props, titleId }: { modalRef: React.RefObject<HTMLDivElement | null>; props: BaseModalProps; titleId: string }) {
  const d = resolveModalDefaults(props);
  const showHeader = props.title !== null || d.showCloseButton;
  const labelledBy = props.title ? titleId : undefined;
  return (
    <div ref={modalRef} className={`base-modal base-modal--${d.size} ${d.className}`.trim()} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      {showHeader && <ModalHeader title={props.title} showCloseButton={d.showCloseButton} onClose={props.onClose} headerClasses={`base-modal__header ${d.headerClassName}`.trim()} titleId={titleId} />}
      <div className={`base-modal__content ${d.contentClassName}`.trim()}>{props.children}</div>
    </div>
  );
}

export default function BaseModal(props: BaseModalProps) {
  const { isOpen, onClose, preventBackdropClose = false } = props;
  const modalRef = useModalFocusTrap(isOpen, onClose);
  const titleId = useId();
  if (!isOpen) {return null;}
  const onBackdrop = (e: React.MouseEvent) => { if (!preventBackdropClose && e.target === e.currentTarget) {onClose();} };
  return (
    <>
      <div className="base-modal__backdrop" onClick={onBackdrop} aria-hidden="true" />
      <ModalBody modalRef={modalRef} props={props} titleId={titleId} />
    </>
  );
}
