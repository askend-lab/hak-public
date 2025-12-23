import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';
import { setupI18nMock } from './test-utils';
import { AuthProvider } from '../../services/auth/context';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const renderWithProviders = (ui: React.ReactElement) => render(
  <BrowserRouter>
    <AuthProvider>
      {ui}
    </AuthProvider>
  </BrowserRouter>
);

describe('Header', () => {
  beforeEach(() => {
    setupI18nMock();
  });

  it('should render header titles', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('EESTI KEELE')).toBeInTheDocument();
    expect(screen.getByText('HÄÄLDUSABILINE')).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Süntees')).toBeInTheDocument();
    expect(screen.getByText('Ülesanded')).toBeInTheDocument();
  });
});
