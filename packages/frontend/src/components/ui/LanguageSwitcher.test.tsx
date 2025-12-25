import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from './LanguageSwitcher';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

const mockUseTranslation = useTranslation as vi.MockedFunction<typeof useTranslation>;

describe('LanguageSwitcher', () => {
  const mockChangeLanguage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      i18n: { changeLanguage: mockChangeLanguage },
      t: (key: string) => key,
    } as vi.Mocked<ReturnType<typeof useTranslation>>);
  });

  it('should render language buttons', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Estonian')).toBeInTheDocument();
  });

  it('should change language to English', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText('English'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('should change language to Estonian', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText('Estonian'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('et');
  });
});
