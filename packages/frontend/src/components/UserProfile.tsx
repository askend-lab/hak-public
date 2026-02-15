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

export default function UserProfile({ user }: UserProfileProps) {
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (!isDropdownOpen || !dropdownRef.current) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeDropdown(); return; }
      /* c8 ignore start -- focus trap requires real browser */
      if (e.key !== "Tab") return;
      const focusable = dropdownRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
      /* c8 ignore stop */
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isDropdownOpen, closeDropdown]);

  return (
    <div className="user-profile">
      <button
        ref={triggerRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="user-profile__button"
        aria-expanded={isDropdownOpen}
        aria-label="Kasutaja profiil"
      >
        <div className="user-profile__avatar">{getInitials(user)}</div>
        <div className="user-profile__info">
          <div className="user-profile__name">{getDisplayName(user)}</div>
        </div>
        <ChevronDownIcon
          size="md"
          className={`user-profile__arrow ${isDropdownOpen ? "user-profile__arrow--open" : ""}`}
        />
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="user-profile__backdrop"
            onClick={closeDropdown}
            role="presentation"
          />
          <div ref={dropdownRef} className="user-profile__dropdown" role="menu">
            <div className="user-profile__header">
              <div className="user-profile__avatar user-profile__avatar--large">
                {getInitials(user)}
              </div>
              <div className="user-profile__details">
                <div className="user-profile__name--large">
                  {getDisplayName(user)}
                </div>
                <div className="user-profile__email">{user.email}</div>
              </div>
            </div>

            <div className="user-profile__actions">
              <button
                onClick={handleLogout}
                className="user-profile__action-button user-profile__action-button--danger"
              >
                <div className="user-profile__action-button-content">
                  Logi välja
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
