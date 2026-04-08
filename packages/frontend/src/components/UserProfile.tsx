// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth, type User } from "@/features/auth/services";
import { ChevronDownIcon } from "./ui/Icons";

interface UserProfileProps {
  user: User;
}

function getInitials(user: User): string {
  const name = user.name ?? user.email?.split("@")[0] ?? "";
  return (
    name
      .split(" ")
      .map((n) => n[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}

function getDisplayName(user: User): string {
  return user.name ?? user.email?.split("@")[0] ?? "User";
}

function trapTabFocus(e: KeyboardEvent, dropdownRef: React.RefObject<HTMLDivElement | null>): void {
  /* c8 ignore start -- focus trap requires real browser */
  const focusable = dropdownRef.current?.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!focusable?.length) {return;}
  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  /* c8 ignore stop */
}

function useDropdownKeyboard(isOpen: boolean, dropdownRef: React.RefObject<HTMLDivElement | null>, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen || !dropdownRef.current) {return;}
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab") { trapTabFocus(e, dropdownRef); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose, dropdownRef]);
}

function ProfileDropdown({ user, dropdownRef, onLogout, onClose }: { user: User; dropdownRef: React.RefObject<HTMLDivElement | null>; onLogout: () => void; onClose: () => void }) {
  return (
    <>
      <div className="user-profile__backdrop" onClick={onClose} role="presentation" />
      <div ref={dropdownRef} className="user-profile__dropdown" role="menu">
        <div className="user-profile__header">
          <div className="user-profile__avatar user-profile__avatar--large">{getInitials(user)}</div>
          <div className="user-profile__details">
            <div className="user-profile__name--large">{getDisplayName(user)}</div>
            {user.email && <div className="user-profile__email">{user.email}</div>}
          </div>
        </div>
        <div className="user-profile__actions">
          <button onClick={onLogout} className="user-profile__action-button user-profile__action-button--danger" role="menuitem">
            <div className="user-profile__action-button-content">Logi välja</div>
          </button>
        </div>
      </div>
    </>
  );
}

export default function UserProfile({ user }: UserProfileProps) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => { setIsOpen(false); triggerRef.current?.focus(); }, []);
  const handleLogout = () => { void logout(); setIsOpen(false); };
  useDropdownKeyboard(isOpen, dropdownRef, close);
  const arrowCls = `user-profile__arrow ${isOpen ? "user-profile__arrow--open" : ""}`;

  return (
    <div className="user-profile">
      <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="user-profile__button" aria-expanded={isOpen} aria-haspopup="true" aria-label="Kasutaja profiil">
        <div className="user-profile__avatar">{getInitials(user)}</div>
        <div className="user-profile__info"><div className="user-profile__name">{getDisplayName(user)}</div></div>
        <ChevronDownIcon size="md" className={arrowCls} />
      </button>
      {isOpen && <ProfileDropdown user={user} dropdownRef={dropdownRef} onLogout={handleLogout} onClose={close} />}
    </div>
  );
}
