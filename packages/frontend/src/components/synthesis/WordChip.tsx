interface WordChipProps {
  word: string
  onClick: (word: string) => void
  isSelected?: boolean
}

export function WordChip({ word, onClick, isSelected }: WordChipProps) {
  const classes = ['word-chip', isSelected && 'word-chip--selected'].filter(Boolean).join(' ')
  
  return (
    <span 
      className={classes}
      data-word={word}
      onClick={() => onClick(word)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(word); }}
    >
      {word}
    </span>
  )
}
