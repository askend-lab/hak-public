import { useCallback } from 'react';
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, maxLength);
    setText(value);
  }, [maxLength, setText]);

  const handleSubmit = useCallback(() => {
    onSynthesize?.();
  }, [onSynthesize]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="text-input">
      <textarea
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={4}
        className="text-input__textarea"
      />
      <div className="text-input__footer">
        <span className="text-input__count">
          {text.length}/{maxLength}
        </span>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className="text-input__button"
        >
          {isLoading ? 'Töötlen...' : 'Sünteesi'}
        </button>
      </div>
    </div>
  );
}
