import { colors, gap, textDecoration, borderRadius } from '../../styles/colors'

interface SocialLinkProps {
  href: string
  icon: string
  label: string
}

export function SocialLink({ href, icon, label }: SocialLinkProps) {
  return (
    <li style={{ marginBottom: gap.sm }}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: gap.sm,
          fontSize: '0.8125rem',
          color: colors.textSecondary,
          textDecoration: textDecoration.none,
        }}
      >
        <span style={{
          width: '20px',
          height: '20px',
          backgroundColor: colors.primary,
          borderRadius: borderRadius.small,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.white,
          fontSize: '0.625rem',
        }}>
          {icon}
        </span>
        {label}
      </a>
    </li>
  )
}
