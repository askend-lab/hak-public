interface PlayButtonProps {
  onClick: () => void
  isActive?: boolean
  isLoading?: boolean
  isPlaying?: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function PlayButton({ 
  onClick, 
  isActive = false, 
  isLoading = false, 
  isPlaying = false,
  disabled = false,
  size = 'medium',
  className = ''
}: PlayButtonProps) {
  const classes = [
    'play-button',
    isActive && 'play-button--active',
    isLoading && 'play-button--loading',
    isPlaying && 'play-button--playing',
    `play-button--${size}`,
    className
  ].filter(Boolean).join(' ')

  const isDisabled = disabled || isLoading || (!isActive && !isPlaying)

  return (
    <button 
      onClick={onClick} 
      disabled={isDisabled} 
      className={classes}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isLoading ? (
        <LoadingIcon />
      ) : isPlaying ? (
        <PauseIcon />
      ) : (
        <PlayIcon />
      )}
    </button>
  )
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5.14V19.14L19 12.14L8 5.14Z" fill="currentColor"/>
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="6" width="3" height="12" fill="currentColor" rx="1" />
      <rect x="14" y="6" width="3" height="12" fill="currentColor" rx="1" />
    </svg>
  )
}

function LoadingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="25" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>
  )
}
