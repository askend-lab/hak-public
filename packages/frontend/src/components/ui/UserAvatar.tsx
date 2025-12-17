import { colors } from '../../styles/colors'

interface UserAvatarProps {
  initials: string
  name: string
  id: string
}

export function UserAvatar({ initials, name, id }: UserAvatarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#2D5A7B',
        color: colors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
        fontWeight: 600,
      }}>
        {initials}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: colors.primary,
        }}>
          {name}
        </span>
        <span style={{
          fontSize: '0.75rem',
          color: colors.gray,
        }}>
          {id}
        </span>
      </div>
    </div>
  )
}

export default UserAvatar
