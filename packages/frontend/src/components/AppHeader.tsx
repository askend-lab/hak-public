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

function navClassName({ isActive }: { isActive: boolean }) {
  return `header-nav-link ${isActive ? "active" : ""}`;
}

function gatedClick(isAuth: boolean, handler: () => void) {
  return (e: React.MouseEvent) => { if (!isAuth) { e.preventDefault(); handler(); } };
}

export default function AppHeader({ isAuthenticated, user, onTasksClick, onHelpClick, onLoginClick }: AppHeaderProps) {
  return (
    <header className="page-layout__header">
      <div className="page-layout__header-content">
        <Link to="/" className="eki-logo">
          <img src="/icons/logo.png" alt="EKI Logo" />
        </Link>
        <nav className="header-nav">
          <NavLink to="/synthesis" className={navClassName} onClick={gatedClick(isAuthenticated, onLoginClick)}>
            Tekst kõneks
          </NavLink>
          <NavLink to="/tasks" className={navClassName} data-nav="tasks" onClick={gatedClick(isAuthenticated, onTasksClick)}>
            Ülesanded
          </NavLink>
        </nav>
        <div className="header-functions">
          {isAuthenticated && (
            <button className="header-help-button" onClick={onHelpClick} aria-label="Abi ja juhend" title="Näita juhendeid">
              <HelpIcon size="2xl" />
            </button>
          )}
          {isAuthenticated && user ? (
            <UserProfile user={user} />
          ) : (
            <button className="button button--primary" onClick={onLoginClick}>Logi sisse</button>
          )}
        </div>
      </div>
    </header>
  );
}
