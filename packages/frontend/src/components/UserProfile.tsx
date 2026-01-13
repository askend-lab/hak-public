/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { useAuth, User } from '@/contexts/AuthContext';
import { ChevronDownIcon } from './ui/Icons';

interface UserProfileProps {
  user: User;
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
          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        <div className="user-profile__info">
          <div className="user-profile__name">{user.name}</div>
          <div className="user-profile__id">{user.id}</div>
        </div>
        <ChevronDownIcon size="md" className={`user-profile__arrow ${isDropdownOpen ? 'user-profile__arrow--open' : ''}`} />
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
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="user-profile__details">
                <div className="user-profile__name--large">{user.name}</div>
                <div className="user-profile__email">{user.email}</div>
                <div className="user-profile__id--formatted">Isikukood: {user.id}</div>
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