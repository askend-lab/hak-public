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

  it('should render contact information with line breaks (matching prototype)', () => {
    render(<Footer />);
    const contact = document.querySelector('.footer__contact');
    expect(contact).toBeInTheDocument();
    // Contact info should have line breaks like prototype
    expect(contact?.querySelectorAll('br').length).toBeGreaterThanOrEqual(2);
  });

  it('should render social media links with correct hrefs', () => {
    render(<Footer />);
    const facebookLink = screen.getByText('Facebook').closest('a');
    const youtubeLink = screen.getByText('Youtube').closest('a');
    const linkedinLink = screen.getByText('LinkedIn').closest('a');
    
    expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/eestikeeleinstituut');
    expect(youtubeLink).toHaveAttribute('href', 'https://www.youtube.com/@EestiKeeleInstituut');
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/eesti-keele-instituut');
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

  it('should render Hääldusabiline column heading (matching prototype)', () => {
    render(<Footer />);
    expect(screen.getByText('Hääldusabiline')).toBeInTheDocument();
  });

  describe('Logo styling (bug fix)', () => {
    it('should render LogoWithText without withBackground prop (black logo on white)', () => {
      render(<Footer />);
      const logoContainer = document.querySelector('.logo-with-text');
      expect(logoContainer).toBeInTheDocument();
      expect(logoContainer).not.toHaveClass('logo-with-text--with-background');
    });
  });
});
