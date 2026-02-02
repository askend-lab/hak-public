import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarkersGuideBox from './MarkersGuideBox';

describe('MarkersGuideBox', () => {
  const mockOnInsertMarker = vi.fn();
  const mockOnShowGuide = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the title', () => {
      render(
        <MarkersGuideBox 
          onInsertMarker={mockOnInsertMarker} 
          onShowGuide={mockOnShowGuide} 
        />
      );
      expect(screen.getByText('Hääldusmärgid')).toBeInTheDocument();
    });

    it('renders the intro text', () => {
      render(
        <MarkersGuideBox 
          onInsertMarker={mockOnInsertMarker} 
          onShowGuide={mockOnShowGuide} 
        />
      );
      expect(screen.getByText('Kasuta märke häälduse täpsustamiseks. Klõpsa märgil selle lisamiseks või hõlju kohal juhiste nägemiseks.')).toBeInTheDocument();
    });

    it('renders the info button', () => {
      render(
        <MarkersGuideBox 
          onInsertMarker={mockOnInsertMarker} 
          onShowGuide={mockOnShowGuide} 
        />
      );
      expect(screen.getByLabelText('Ava hääldusmärkide juhend')).toBeInTheDocument();
    });

    it('renders all marker buttons', () => {
      render(
        <MarkersGuideBox 
          onInsertMarker={mockOnInsertMarker} 
          onShowGuide={mockOnShowGuide} 
        />
      );
      expect(screen.getByRole('button', { name: 'kolmas välde' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ebareeglipärase rõhu märk' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'peenendus' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'liitsõnapiir' })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <MarkersGuideBox 
          onInsertMarker={mockOnInsertMarker} 
          onShowGuide={mockOnShowGuide}
          className="custom-class"
        />
      );
      expect(container.querySelector('.markers-guide-box.custom-class')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onShowGuide when info button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MarkersGuideBox 
          onInsertMarker={mockOnInsertMarker} 
          onShowGuide={mockOnShowGuide} 
        />
      );
      
      await user.click(screen.getByLabelText('Ava hääldusmärkide juhend'));
      expect(mockOnShowGuide).toHaveBeenCalledTimes(1);
    });

    it('calls onInsertMarker with correct symbol when marker button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MarkersGuideBox 
          onInsertMarker={mockOnInsertMarker} 
          onShowGuide={mockOnShowGuide} 
        />
      );
      
      await user.click(screen.getByRole('button', { name: 'kolmas välde' }));
      expect(mockOnInsertMarker).toHaveBeenCalledWith('`');
    });

    it('calls onInsertMarker for each marker type', async () => {
      const user = userEvent.setup();
      render(
        <MarkersGuideBox 
          onInsertMarker={mockOnInsertMarker} 
          onShowGuide={mockOnShowGuide} 
        />
      );
      
      await user.click(screen.getByRole('button', { name: 'ebareeglipärase rõhu märk' }));
      expect(mockOnInsertMarker).toHaveBeenCalledWith('´');
      
      await user.click(screen.getByRole('button', { name: 'peenendus' }));
      expect(mockOnInsertMarker).toHaveBeenCalledWith("'");
      
      await user.click(screen.getByRole('button', { name: 'liitsõnapiir' }));
      expect(mockOnInsertMarker).toHaveBeenCalledWith('+');
    });
  });

  describe('accessibility', () => {
    it('has accessible button for info icon', () => {
      render(
        <MarkersGuideBox 
          onInsertMarker={mockOnInsertMarker} 
          onShowGuide={mockOnShowGuide} 
        />
      );
      const infoButton = screen.getByLabelText('Ava hääldusmärkide juhend');
      expect(infoButton).toHaveAttribute('title', 'Ava täielik juhend');
    });

    it('marker buttons have aria-label attributes', () => {
      render(
        <MarkersGuideBox 
          onInsertMarker={mockOnInsertMarker} 
          onShowGuide={mockOnShowGuide} 
        />
      );
      
      // Get all marker buttons by their aria-labels
      expect(screen.getByLabelText('kolmas välde')).toBeInTheDocument();
      expect(screen.getByLabelText('ebareeglipärase rõhu märk')).toBeInTheDocument();
      expect(screen.getByLabelText('peenendus')).toBeInTheDocument();
      expect(screen.getByLabelText('liitsõnapiir')).toBeInTheDocument();
    });
  });
});
