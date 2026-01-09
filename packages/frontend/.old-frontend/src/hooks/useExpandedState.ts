import { useState } from 'react'

interface ExpandedStateResult<T> {
  expanded: Set<T>;
  toggle: (item: T) => void;
  setExpanded: React.Dispatch<React.SetStateAction<Set<T>>>;
}

export function useExpandedState<T>(): ExpandedStateResult<T> {
  const [expanded, setExpanded] = useState<Set<T>>(new Set())
  
  const toggle = (item: T): void => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(item)) {
      newExpanded.delete(item)
    } else {
      newExpanded.add(item)
    }
    setExpanded(newExpanded)
  }
  
  return { expanded, toggle, setExpanded }
}
