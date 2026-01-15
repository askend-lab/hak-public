 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from './Footer';

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('rendering', () => {
    it('renders footer content', () => {
      render(<Footer />);
      expect(screen.getByAltText('EKI Logo')).toBeInTheDocument();
    });

    it('renders contact information', () => {
      render(<Footer />);
      expect(screen.getByText(/Roosikrantsi 6/)).toBeInTheDocument();
    });

    it('renders Hääldusabiline section', () => {
      render(<Footer />);
      expect(screen.getByText('Hääldusabiline')).toBeInTheDocument();
      expect(screen.getByText('Portaaliest')).toBeInTheDocument();
      expect(screen.getByText('Versiooniajalugu')).toBeInTheDocument();
    });

    it('renders social media section', () => {
      render(<Footer />);
      expect(screen.getByText('Sotsiaalmeedia')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Youtube')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    it('renders feedback section', () => {
      render(<Footer />);
      expect(screen.getByText('Tagasiside')).toBeInTheDocument();
      expect(screen.getByText('Kirjuta meile')).toBeInTheDocument();
    });

    it('social links have correct hrefs', () => {
      render(<Footer />);
      const fbLink = screen.getByText('Facebook').closest('a');
      expect(fbLink).toHaveAttribute('href', 'https://www.facebook.com/eestikeeleinstituut');
      
      const ytLink = screen.getByText('Youtube').closest('a');
      expect(ytLink).toHaveAttribute('href', 'https://www.youtube.com/@EestiKeeleInstituut');
      
      const liLink = screen.getByText('LinkedIn').closest('a');
      expect(liLink).toHaveAttribute('href', 'https://www.linkedin.com/company/eesti-keele-instituut');
    });

    it('social links open in new tab', () => {
      render(<Footer />);
      const fbLink = screen.getByText('Facebook').closest('a');
      expect(fbLink).toHaveAttribute('target', '_blank');
      expect(fbLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('feedback button', () => {
    it('has feedback button', () => {
      render(<Footer />);
      expect(screen.getByText('Kirjuta meile')).toBeInTheDocument();
    });

    it('feedback button is clickable', async () => {
      const user = userEvent.setup();
      render(<Footer />);
      
      const button = screen.getByText('Kirjuta meile');
      await user.click(button);
      // Modal should open - but we don't test the modal content here
    });
  });
});
