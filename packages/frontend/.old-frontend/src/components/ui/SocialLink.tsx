interface SocialLinkProps {
  href: string
  icon: string
  label: string
}

export function SocialLink({ href, icon, label }: SocialLinkProps) {
  return (
    <li className="social-link">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="social-link__anchor"
      >
        <span className="social-link__icon">{icon}</span>
        {label}
      </a>
    </li>
  )
}
