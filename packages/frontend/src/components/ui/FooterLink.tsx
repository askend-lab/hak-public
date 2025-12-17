import { colors } from '../../styles/colors'

interface FooterLinkProps {
  href: string
  children: string
}

export function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li style={{ marginBottom: '0.5rem' }}>
      <a href={href} style={{ fontSize: '0.8125rem', color: colors.textSecondary, textDecoration: 'none' }}>
        {children}
      </a>
    </li>
  )
}

export default FooterLink
