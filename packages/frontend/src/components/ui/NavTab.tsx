interface NavTabProps {
  label: string
  isActive: boolean
  onClick: () => void
}

export function NavTab({ label, isActive, onClick }: NavTabProps) {
  const classes = ['nav-tab', isActive && 'nav-tab--active'].filter(Boolean).join(' ')
  
  return (
    <button className={classes} onClick={onClick}>
      {label}
    </button>
  )
}
