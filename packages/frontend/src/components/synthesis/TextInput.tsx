import { useState, useCallback } from 'react';
import { useSynthesisStore } from '../../features';

interface TextInputProps {
  onSynthesize?: () => void;
  placeholder?: string;
  maxLength?: number;
}

export function TextInput({
  onSynthesize,
  placeholder = 'Sisesta eesti keelne tekst...',
  maxLength = 500,
}: TextInputProps) {
  const { text, setText, isLoading } = useSynthesisStore();
  const [localText, setLocalText] = useState(text);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, maxLength);
    setLocalText(value);
  }, [maxLength]);

  const handleBlur = useCallback(() => {
    setText(localText);
  }, [localText, setText]);

  const handleSubmit = useCallback(() => {
    setText(localText);
    onSynthesize?.();
  }, [localText, setText, onSynthesize]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="text-input">
      <textarea
        value={localText}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={4}
        className="text-input__textarea"
      />
      <div className="text-input__footer">
        <span className="text-input__count">
          {localText.length}/{maxLength}
        </span>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !localText.trim()}
          className="text-input__button"
        >
          {isLoading ? 'Töötlen...' : 'Sünteesi'}
        </button>
      </div>
    </div>
  );
}
