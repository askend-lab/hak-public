/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from './Footer';

vi.mock('./FeedbackModal', () => ({
  default: ({ isOpen, onClose, onSubmit }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (message: string, email: string) => Promise<void>;
  }) => isOpen ? (
    <div data-testid="feedback-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onSubmit('Test message', 'test@email.com')}>Submit</button>
    </div>
  ) : null
}));

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('rendering', () => {
    it('renders logo', () => {
      render(<Footer />);
      expect(screen.getByAltText('EKI Logo')).toBeInTheDocument();
    });

    it('renders contact information', () => {
      render(<Footer />);
      expect(screen.getByText(/roosikrantsi/i)).toBeInTheDocument();
    });

    it('renders Hääldusabiline section', () => {
      render(<Footer />);
      expect(screen.getByText('Hääldusabiline')).toBeInTheDocument();
    });

    it('renders footer links', () => {
      render(<Footer />);
      expect(screen.getByText('Portaaliest')).toBeInTheDocument();
      expect(screen.getByText('Versiooniajalugu')).toBeInTheDocument();
      expect(screen.getByText('Kasutus- ja privaatsustingimused')).toBeInTheDocument();
    });

    it('renders social media section', () => {
      render(<Footer />);
      expect(screen.getByText('Sotsiaalmeedia')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Youtube')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    it('renders social media links with correct hrefs', () => {
      render(<Footer />);
      const facebookLink = screen.getByText('Facebook').closest('a');
      const youtubeLink = screen.getByText('Youtube').closest('a');
      const linkedinLink = screen.getByText('LinkedIn').closest('a');
      
      expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/eestikeeleinstituut');
      expect(youtubeLink).toHaveAttribute('href', 'https://www.youtube.com/@EestiKeeleInstituut');
      expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/eesti-keele-instituut');
    });

    it('social media links open in new tab', () => {
      render(<Footer />);
      const facebookLink = screen.getByText('Facebook').closest('a');
      expect(facebookLink).toHaveAttribute('target', '_blank');
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders feedback section', () => {
      render(<Footer />);
      expect(screen.getByText('Tagasiside')).toBeInTheDocument();
      expect(screen.getByText(/iga arvamus loeb/i)).toBeInTheDocument();
    });

    it('renders feedback button', () => {
      render(<Footer />);
      expect(screen.getByText('Kirjuta meile')).toBeInTheDocument();
    });
  });

  describe('feedback modal', () => {
    it('opens feedback modal when button clicked', async () => {
      const user = userEvent.setup();
      render(<Footer />);
      
      await user.click(screen.getByText('Kirjuta meile'));
      expect(screen.getByTestId('feedback-modal')).toBeInTheDocument();
    });

    it('closes feedback modal', async () => {
      const user = userEvent.setup();
      render(<Footer />);
      
      await user.click(screen.getByText('Kirjuta meile'));
      expect(screen.getByTestId('feedback-modal')).toBeInTheDocument();
      
      await user.click(screen.getByText('Close'));
      expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument();
    });

    it('submits feedback successfully', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(<Footer />);
      
      await user.click(screen.getByText('Kirjuta meile'));
      await user.click(screen.getByText('Submit'));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Test message', email: 'test@email.com' }),
        });
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Feedback submitted successfully');
      consoleSpy.mockRestore();
    });

    it('makes API call with correct payload on submit', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      
      render(<Footer />);
      
      await user.click(screen.getByText('Kirjuta meile'));
      await user.click(screen.getByText('Submit'));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/feedback', expect.objectContaining({
          method: 'POST',
        }));
      });
    });
  });
});
