import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('LanguageSwitcher', () => {
  const mockChangeLanguage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      i18n: { changeLanguage: mockChangeLanguage },
      t: (key: string) => key,
    } as any);
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
