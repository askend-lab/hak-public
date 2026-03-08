// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { NavLink, Link } from "react-router-dom";
import UserProfile from "./UserProfile";
import { HelpIcon } from "./ui/Icons";
import type { User } from "@/features/auth/services";

interface AppHeaderProps {
  isAuthenticated: boolean;
  user: User | null;
  onTasksClick: () => void;
  onHelpClick: () => void;
  onLoginClick: () => void;
}

export default function AppHeader({
  isAuthenticated,
  user,
  onTasksClick,
  onHelpClick,
  onLoginClick,
}: AppHeaderProps) {
  const handleTasksClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      onTasksClick();
    }
  };

  return (
    <header className="page-layout__header">
      <div className="page-layout__header-content">
        <Link to="/synthesis" className="eki-logo">
          <img src="/icons/logo.svg" alt="EKI Logo" />
        </Link>
        <nav className="header-nav">
          <NavLink
            to="/synthesis"
            className={({ isActive }) =>
              `header-nav-link ${isActive ? "active" : ""}`
            }
          >
            Tekst kõneks
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `header-nav-link ${isActive ? "active" : ""}`
            }
            data-nav="tasks"
            onClick={handleTasksClick}
          >
            Ülesanded
          </NavLink>
        </nav>
        <div className="header-functions">
          <button
            className="header-help-button"
            onClick={onHelpClick}
            aria-label="Abi ja juhend"
            title="Näita juhendeid"
          >
            <HelpIcon size="2xl" />
          </button>
          {isAuthenticated && user ? (
            <UserProfile user={user} />
          ) : (
            <button className="button button--primary" onClick={onLoginClick}>
              Logi sisse
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
