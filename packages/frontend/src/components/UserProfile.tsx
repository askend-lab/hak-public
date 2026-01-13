/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { useAuth, type User } from '@/services/auth';

interface UserProfileProps {
  user: User;
}

function getInitials(user: User): string {
  const name = user.name ?? user.email?.split('@')[0] ?? '';
  return name.split(' ').map(n => n[0] ?? '').join('').toUpperCase() || '?';
}

function getDisplayName(user: User): string {
  return user.name ?? user.email?.split('@')[0] ?? 'User';
}

export default function UserProfile({ user }: UserProfileProps) {
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const handleClearLocalStorage = () => {
    if (window.confirm('Kas oled kindel, et soovid kõik kohaliku salvestuse andmed kustutada? See taastab rakenduse algsesse olekusse mock-andmetega.')) {
      // Clear all localStorage data
      localStorage.clear();
      
      // Close dropdown
      setIsDropdownOpen(false);
      
      // Refresh the page to reset application state
      window.location.reload();
    }
  };

  return (
    <div className="user-profile">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="user-profile__button"
      >
        <div className="user-profile__avatar">
          {getInitials(user)}
        </div>
        <div className="user-profile__info">
          <div className="user-profile__name">{getDisplayName(user)}</div>
          <div className="user-profile__id">{user.id}</div>
        </div>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`user-profile__arrow ${isDropdownOpen ? 'user-profile__arrow--open' : ''}`}
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          <div 
            className="user-profile__backdrop" 
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="user-profile__dropdown">
            <div className="user-profile__header">
              <div className="user-profile__avatar user-profile__avatar--large">
                {getInitials(user)}
              </div>
              <div className="user-profile__details">
                <div className="user-profile__name--large">{getDisplayName(user)}</div>
                <div className="user-profile__email">{user.email}</div>
                <div className="user-profile__id--formatted">ID: {user.id}</div>
              </div>
            </div>
            
            <div className="user-profile__actions">
              <button
                onClick={handleClearLocalStorage}
                className="user-profile__action-button"
                title="Taasta rakendus algsesse olekusse"
              >
                <div className="user-profile__action-button-content">
                  Kustuta kohalikud andmed
                </div>
              </button>
              
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