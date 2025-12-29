interface FooterLinkProps {
  href: string
  children: string
}

export function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li className="footer-link">
      <a href={href} className="footer-link__anchor">
        {children}
      </a>
    </li>
  )
}
