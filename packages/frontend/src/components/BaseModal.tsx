// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

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

export default function BaseModal({
  isOpen,
  onClose,
  title,
  showCloseButton = true,
  size = "medium",
  children,
  className = "",
  headerClassName = "",
  contentClassName = "",
  preventBackdropClose = false,
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  // Keep the onClose ref updated to avoid stale closures
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };

    // Focus trap - keep focus within modal
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTabKey);
    document.body.style.overflow = "hidden";

    // Focus the modal or first focusable element
    requestAnimationFrame(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTabKey);
      document.body.style.overflow = "unset";

      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!preventBackdropClose && e.target === e.currentTarget) onClose();
  };
  const modalClasses = `base-modal base-modal--${size} ${className}`.trim();

  return (
    <>
      <div
        className="base-modal__backdrop"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {(title !== null || showCloseButton) && (
          <ModalHeader
            title={title}
            showCloseButton={showCloseButton}
            onClose={onClose}
            headerClasses={`base-modal__header ${headerClassName}`.trim()}
            titleId={titleId}
          />
        )}
        <div className={`base-modal__content ${contentClassName}`.trim()}>
          {children}
        </div>
      </div>
    </>
  );
}
