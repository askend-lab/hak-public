// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import React from "react";

import { MoreIcon } from "@/components/ui/Icons";
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

function DropdownContent({ id, items, menuRef, menuStyle, onClose, onFocusAnchor }: {
  id: string; items: RowMenuItem[]; menuRef: React.RefObject<HTMLDivElement | null>;
  menuStyle: React.CSSProperties | undefined; onClose: () => void; onFocusAnchor: () => void;
}) {
  const cls = `sentence-synthesis-item__dropdown-menu${menuStyle ? " sentence-synthesis-item__dropdown-menu--fixed" : ""}`;
  return (
    <>
      <div className="sentence-synthesis-item__menu-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={menuRef} className={cls} style={menuStyle} role="menu" tabIndex={-1} aria-label="Lausungi valikud"
        onKeyDown={(e) => { if (e.key === "Escape") { onClose(); onFocusAnchor(); } }}>
        {items.map((item) => (
          <button key={item.label} className={`sentence-synthesis-item__menu-item ${item.danger ? "sentence-synthesis-item__menu-item--danger" : ""}`}
            role="menuitem" onClick={() => { item.onClick(id); onClose(); }}>
            {item.icon && <span className="sentence-synthesis-item__menu-item-icon" aria-hidden="true">{item.icon}</span>}
            <div className="sentence-synthesis-item__menu-item-content">{item.label}</div>
          </button>
        ))}
      </div>
    </>
  );
}

export function RowMenu({ id, isOpen, items, onOpen, onClose, "data-onboarding-target": onboardingTarget }: RowMenuProps): React.ReactElement {
  const { anchorRef, menuRef, menuStyle } = useDropdownPosition({ isOpen });
  return (
    <div className="sentence-synthesis-item__menu-container">
      <button ref={anchorRef} className="sentence-synthesis-item__menu-button" aria-label="Rohkem valikuid"
        aria-haspopup="menu" aria-expanded={isOpen} onClick={() => onOpen(id)} data-onboarding-target={onboardingTarget}>
        <MoreIcon size="2xl" />
      </button>
      {isOpen && <DropdownContent id={id} items={items} menuRef={menuRef} menuStyle={menuStyle} onClose={onClose} onFocusAnchor={() => anchorRef.current?.focus()} />}
    </div>
  );
}
