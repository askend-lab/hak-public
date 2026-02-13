// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import React from "react";

import { MoreIcon } from "../ui/Icons";
import { useDropdownPosition } from "@/hooks/useDropdownPosition";

interface RowMenuItem {
  label: string;
  onClick: (id: string) => void;
  danger?: boolean;
  icon?: React.ReactNode;
}

interface RowMenuProps {
  id: string;
  isOpen: boolean;
  items: RowMenuItem[];
  onOpen: (id: string) => void;
  onClose: () => void;
  "data-onboarding-target"?: string;
}

export function RowMenu({
  id,
  isOpen,
  items,
  onOpen,
  onClose,
  "data-onboarding-target": onboardingTarget,
}: RowMenuProps): React.ReactElement {
  const { anchorRef, menuRef, menuStyle } = useDropdownPosition({
    isOpen,
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Escape") {
      onClose();
      anchorRef.current?.focus();
    }
  };

  return (
    <div className="sentence-synthesis-item__menu-container">
      <button
        ref={anchorRef}
        className="sentence-synthesis-item__menu-button"
        aria-label="Rohkem valikuid"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => onOpen(id)}
        data-onboarding-target={onboardingTarget}
      >
        <MoreIcon size="2xl" />
      </button>
      {isOpen && (
        <>
          <div
            className="sentence-synthesis-item__menu-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            ref={menuRef}
            className={`sentence-synthesis-item__dropdown-menu${menuStyle ? " sentence-synthesis-item__dropdown-menu--fixed" : ""}`}
            style={menuStyle}
            role="menu"
            aria-label="Lausungi valikud"
            onKeyDown={handleKeyDown}
          >
            {items.map((item, index) => (
              <button
                key={index}
                className={`sentence-synthesis-item__menu-item ${item.danger ? "sentence-synthesis-item__menu-item--danger" : ""}`}
                role="menuitem"
                onClick={() => {
                  item.onClick(id);
                  onClose();
                }}
              >
                {item.icon && (
                  <span
                    className="sentence-synthesis-item__menu-item-icon"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                )}
                <div className="sentence-synthesis-item__menu-item-content">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
