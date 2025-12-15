import { useSynthesisStore } from '../../features';

interface StressedTextProps {
  className?: string;
}

export function StressedText({ className = '' }: StressedTextProps) {
  const { phoneticText, text } = useSynthesisStore();

  if (!phoneticText && !text) {
    return null;
  }

  return (
    <div className={`stressed-text ${className}`}>
      <div className="stressed-text__label">Foneetiline tekst:</div>
      <div className="stressed-text__content">
        {phoneticText || text}
      </div>
    </div>
  );
}
