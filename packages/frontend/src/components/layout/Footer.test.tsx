import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Footer } from './Footer';
import { setupI18nMock } from './test-utils';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

describe('Footer', () => {
  beforeEach(() => {
    setupI18nMock();
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
