interface UserAvatarProps {
  initials: string
  name: string
  email?: string
}

export function UserAvatar({ initials, name, email }: UserAvatarProps) {
  return (
    <div className="user-avatar">
      <div className="user-avatar__circle">{initials}</div>
      <div className="user-avatar__info">
        <span className="user-avatar__name">{name}</span>
        {email && <span className="user-avatar__email">{email}</span>}
      </div>
    </div>
  )
}
