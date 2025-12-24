import { colors, gap, textDecoration } from '../../styles/colors'

interface FooterLinkProps {
  href: string
  children: string
}

export function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li style={{ marginBottom: gap.sm }}>
      <a href={href} style={{ fontSize: '0.8125rem', color: colors.textSecondary, textDecoration: textDecoration.none }}>
        {children}
      </a>
    </li>
  )
}
