import { useState, useCallback, useRef, useEffect } from 'react';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger: React.ReactNode;
  ariaLabel?: string;
}

export function DropdownMenu({ items, trigger, ariaLabel }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleItemClick = useCallback((item: DropdownMenuItem) => {
    item.onClick();
    handleClose();
  }, [handleClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  return (
    <div className="menu-container" ref={menuRef}>
      <button
        className="menu-button"
        aria-label={ariaLabel ?? 'Rohkem valikuid'}
        onClick={handleToggle}
      >
        {trigger}
      </button>

      {isOpen && (
        <>
          <div className="menu-backdrop" onClick={handleClose} />
          <div className="dropdown-menu">
            {items.map((item, index) => (
              <button
                key={index}
                className={`menu-item ${item.danger ? 'menu-item-danger' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <div className="menu-item-content">{item.label}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function MoreOptionsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
