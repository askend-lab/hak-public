import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

import { VariantsPanel } from './VariantsPanel';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

describe('VariantsPanel', () => {
  const mockVariants = [
    { id: '1', phonetic: 'tere', type: 'nimisõna' },
    { id: '2', phonetic: 'tere', type: 'tegusõna' },
  ];

  const defaultProps = {
    word: 'tere',
    variants: mockVariants,
    isOpen: true,
    onClose: vi.fn(),
    onSelectVariant: vi.fn(),
    onPlayVariant: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<VariantsPanel {...defaultProps} isOpen={false} />);
    expect(container.querySelector('.variants-panel')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    const { container } = render(<VariantsPanel {...defaultProps} />);
    expect(container.querySelector('.variants-panel')).toBeInTheDocument();
  });

  it('should have data-testid for testing', () => {
    const { container } = render(<VariantsPanel {...defaultProps} />);
    expect(container.querySelector('[data-testid="variants-panel"]')).toBeInTheDocument();
  });

  it('should display word in title', () => {
    const { container } = render(<VariantsPanel {...defaultProps} />);
    const title = container.querySelector('.variants-panel__title');
    expect(title?.textContent).toBe('tere');
  });

  it('should display variant options', () => {
    const { container } = render(<VariantsPanel {...defaultProps} />);
    const options = container.querySelectorAll('.variant-option');
    expect(options).toHaveLength(2);
  });

  it('should display variant types', () => {
    const { getByText } = render(<VariantsPanel {...defaultProps} />);
    expect(getByText('nimisõna')).toBeInTheDocument();
    expect(getByText('tegusõna')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    const { container } = render(<VariantsPanel {...defaultProps} />);
    const closeButton = container.querySelector('.variants-panel__close');
    fireEvent.click(closeButton!);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onSelectVariant when Kasuta button clicked', () => {
    const { getAllByText } = render(<VariantsPanel {...defaultProps} />);
    const useButtons = getAllByText('Kasuta');
    expect(useButtons[0]).toBeDefined();
    fireEvent.click(useButtons[0] as HTMLElement);
    expect(defaultProps.onSelectVariant).toHaveBeenCalledWith(mockVariants[0]);
  });

  it('should call onPlayVariant when play button clicked', () => {
    const { container } = render(<VariantsPanel {...defaultProps} />);
    const playButtons = container.querySelectorAll('.play-button');
    expect(playButtons[0]).toBeDefined();
    fireEvent.click(playButtons[0] as Element);
    expect(defaultProps.onPlayVariant).toHaveBeenCalledWith(mockVariants[0]);
  });

  it('should have custom variant input section', () => {
    const { container } = render(<VariantsPanel {...defaultProps} />);
    expect(container.querySelector('.variants-panel__custom')).toBeInTheDocument();
  });

  it('should have phonetic marker buttons', () => {
    const { container } = render(<VariantsPanel {...defaultProps} />);
    const markerButtons = container.querySelectorAll('.marker-button');
    expect(markerButtons.length).toBeGreaterThanOrEqual(4);
  });

  it('should have role dialog for accessibility', () => {
    const { container } = render(<VariantsPanel {...defaultProps} />);
    expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  describe('Custom variant functionality', () => {
    it('should play audio when custom variant Play clicked', async () => {
      const audioModule = await import('../../services/audio');
      const playAudioMock = vi.spyOn(audioModule, 'playAudio').mockResolvedValue();
      vi.spyOn(audioModule, 'synthesizeText').mockResolvedValue({
        originalText: 'test', phoneticText: 'test', audioUrl: 'blob:custom',
        audioHash: 'hash', voiceModel: 'efm_s', cached: false
      });

      const { container } = render(<VariantsPanel {...defaultProps} />);
      const customInput = container.querySelector('.variants-panel__input') as HTMLInputElement;
      fireEvent.change(customInput, { target: { value: 'custom-variant' } });
      
      const customPlayBtn = container.querySelector('.variants-panel__custom .play-button');
      fireEvent.click(customPlayBtn!);
      
      await vi.waitFor(() => { expect(playAudioMock).toHaveBeenCalled(); });
    });

    it('should insert marker at cursor position when marker button clicked', () => {
      const { container } = render(<VariantsPanel {...defaultProps} />);
      const customInput = container.querySelector('.variants-panel__input') as HTMLInputElement;
      fireEvent.change(customInput, { target: { value: 'tere' } });
      customInput.setSelectionRange(2, 2); // cursor at position 2
      
      const stressButton = container.querySelector('.marker-button[title="Stress"]');
      fireEvent.click(stressButton!);
      
      expect(customInput.value).toBe('te´re');
    });

    it('should call onSelectVariant with custom phonetic when Kasuta clicked', () => {
      const onSelectVariant = vi.fn();
      const { container } = render(<VariantsPanel {...defaultProps} onSelectVariant={onSelectVariant} />);
      const customInput = container.querySelector('.variants-panel__input') as HTMLInputElement;
      fireEvent.change(customInput, { target: { value: 'te´re' } });
      
      const customKasutaBtn = container.querySelector('.variants-panel__custom .variant-option__use');
      fireEvent.click(customKasutaBtn!);
      
      expect(onSelectVariant).toHaveBeenCalledWith({ id: 'custom', phonetic: 'te´re', type: 'custom' });
    });
  });
});
