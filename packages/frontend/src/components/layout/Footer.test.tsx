import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('Footer', () => {
  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'header.title1': 'EESTI KEELE',
          'header.title2': 'HÄÄLDUSABILINE',
        };
        return translations[key] || key;
      },
      i18n: { changeLanguage: jest.fn() },
    } as any);
  });

  it('should render footer', () => {
    render(<Footer />);
    expect(screen.getByText('EESTI KEELE')).toBeInTheDocument();
  });

  it('should render contact information', () => {
    render(<Footer />);
    expect(screen.getByText(/Roosikrantsi 6/)).toBeInTheDocument();
  });

  it('should render social media links', () => {
    render(<Footer />);
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Youtube')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('should render feedback button', () => {
    render(<Footer />);
    expect(screen.getByText('Kirjuta meile')).toBeInTheDocument();
  });

  it('should render section headings', () => {
    render(<Footer />);
    expect(screen.getByText('Sotsiaalmeedia')).toBeInTheDocument();
    expect(screen.getByText('Tagasiside')).toBeInTheDocument();
  });
});
