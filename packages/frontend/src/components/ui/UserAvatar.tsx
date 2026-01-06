import { useState, useRef, useEffect } from 'react'

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

interface UserAvatarProps {
  initials: string
  name: string
  email?: string
  idCode?: string
  onReset?: () => void
  onLogout?: () => void
}

export function UserAvatar({ initials, name, email, idCode, onReset, onLogout }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="user-avatar" ref={menuRef}>
      <button 
        className="user-avatar__button" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="user-avatar__circle">{initials}</div>
        <div className="user-avatar__info">
          <span className="user-avatar__name">{name}</span>
          {email && <span className="user-avatar__email">{email}</span>}
        </div>
      </button>
      {isOpen && (
        <div className="user-avatar__dropdown">
          <div className="user-avatar__dropdown-header">
            <div className="user-avatar__dropdown-circle">{initials}</div>
            <div className="user-avatar__dropdown-info">
              <span className="user-avatar__dropdown-name">{name}</span>
              {email && <span className="user-avatar__dropdown-email">{email}</span>}
              {idCode && <span className="user-avatar__dropdown-idcode">Isikukood: {idCode}</span>}
            </div>
          </div>
          {onReset && (
            <button 
              className="user-avatar__dropdown-action" 
              onClick={() => { onReset(); setIsOpen(false); }}
              type="button"
            >
              <TrashIcon />
              Kustuta kohalikud andmed
            </button>
          )}
          {onLogout && (
            <button 
              className="user-avatar__dropdown-action user-avatar__dropdown-action--logout" 
              onClick={() => { onLogout(); setIsOpen(false); }}
              type="button"
            >
              <LogoutIcon />
              Logi välja
            </button>
          )}
        </div>
      )}
    </div>
  )
}
