import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('../LanguageSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('Header', () => {
  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'header.title1': 'EESTI KEELE',
          'header.title2': 'HÄÄLDUSABILINE',
          'nav.synthesis': 'Süntees',
          'nav.tasks': 'Ülesanded',
        };
        return translations[key] || key;
      },
      i18n: { changeLanguage: jest.fn() },
    } as any);
  });

  it('should render header titles', () => {
    render(<Header />);
    expect(screen.getByText('EESTI KEELE')).toBeInTheDocument();
    expect(screen.getByText('HÄÄLDUSABILINE')).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    render(<Header />);
    expect(screen.getByText('Süntees')).toBeInTheDocument();
    expect(screen.getByText('Ülesanded')).toBeInTheDocument();
  });

  it('should render language switcher', () => {
    render(<Header />);
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });
});
