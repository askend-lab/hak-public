import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { setupI18nMock } from './test-utils';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('../LanguageSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    setupI18nMock();
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
