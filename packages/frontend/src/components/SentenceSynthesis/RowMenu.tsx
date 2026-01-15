 
'use client';

import React from 'react';

import { useRef, useEffect, useState } from 'react';
import { MoreIcon } from '../ui/Icons';

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
  'data-onboarding-target'?: string;
}

export function RowMenu({
  id,
  isOpen,
  items,
  onOpen,
  onClose,
  'data-onboarding-target': onboardingTarget
}: RowMenuProps): React.ReactElement {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (isOpen && menuButtonRef.current) {
      const updatePosition = (): void => {
        if (menuButtonRef.current) {
          const rect = menuButtonRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right,
          });
        }
      };

      updatePosition();

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return (): void => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      setDropdownPosition(null);
    }
    return undefined;
  }, [isOpen]);

  return (
    <div className="sentence-synthesis-item__menu-container">
      <button
        ref={menuButtonRef}
        className="sentence-synthesis-item__menu-button"
        aria-label="More options"
        onClick={() => onOpen(id)}
        data-onboarding-target={onboardingTarget}
      >
        <MoreIcon size="2xl" />
      </button>
      {isOpen && dropdownPosition && (
        <>
          <div
            className="sentence-synthesis-item__menu-backdrop"
            onClick={onClose}
          />
          <div
            className="sentence-synthesis-item__dropdown-menu sentence-synthesis-item__dropdown-menu--fixed"
            style={{ top: `${dropdownPosition.top}px`, right: `${dropdownPosition.right}px` }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                className={`sentence-synthesis-item__menu-item ${item.danger ? 'sentence-synthesis-item__menu-item--danger' : ''}`}
                onClick={() => {
                  item.onClick(id);
                  onClose();
                }}
              >
                {item.icon && (
                  <span className="sentence-synthesis-item__menu-item-icon">{item.icon}</span>
                )}
                <div className="sentence-synthesis-item__menu-item-content">{item.label}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
