import { colors, gap, borderRadius, fontWeight, lineHeight, fontSize } from '../../styles/colors'

interface UserAvatarProps {
  initials: string
  name: string
  id: string
}

export function UserAvatar({ initials, name, id }: UserAvatarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: gap.md }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: borderRadius.round,
        backgroundColor: colors.primary,
        color: colors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
      }}>
        {initials}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: lineHeight.tight }}>
        <span style={{
          fontSize: fontSize.base,
          fontWeight: fontWeight.semibold,
          color: colors.primary,
        }}>
          {name}
        </span>
        <span style={{
          fontSize: fontSize.sm,
          color: colors.gray,
        }}>
          {id}
        </span>
      </div>
    </div>
  )
}
