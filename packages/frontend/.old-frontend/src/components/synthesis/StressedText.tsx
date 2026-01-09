import { useState } from 'react';

import { useSynthesisStore } from '../../features';
import { PhoneticGuideModal } from './PhoneticGuideModal';

interface StressedTextProps {
  className?: string;
}

const helpButtonStyle = {
  marginLeft: '0.5rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.875rem',
} as const;

export function StressedText({ className = '' }: StressedTextProps) {
  const { phoneticText, text } = useSynthesisStore();
  const [showGuide, setShowGuide] = useState(false);

  const hasContent = phoneticText || text;
  const openGuide = () => { setShowGuide(true); };
  const closeGuide = () => { setShowGuide(false); };

  return (
    <div className={`stressed-text ${className}`}>
      <div className="stressed-text__label">
        Foneetiline tekst:
        <button data-testid="phonetic-help" aria-label="Phonetic symbols help" onClick={openGuide} style={helpButtonStyle}>
          ?
        </button>
      </div>
      {hasContent && (
        <div className="stressed-text__content">
          {phoneticText || text}
        </div>
      )}
      {showGuide && <PhoneticGuideModal onClose={closeGuide} />}
    </div>
  );
}
