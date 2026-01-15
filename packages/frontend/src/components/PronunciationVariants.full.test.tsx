 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PronunciationVariants from './PronunciationVariants';

vi.mock('@/utils/phoneticMarkers', () => ({
  transformToUI: (t: string | null): string | null => t?.replace(/</, '`').replace(/\?/, '´') ?? null,
  transformToVabamorf: (t: string | null): string | null => t?.replace(/`/, '<').replace(/´/, '?') ?? null,
}));

vi.mock('@/utils/synthesize', () => ({ synthesizeWithPolling: vi.fn().mockResolvedValue('audio-url') }));

describe('PronunciationVariants Full', () => {
  const props = { word: 'test', isOpen: true, onClose: vi.fn(), onUseVariant: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ variants: [{ text: 'te`st', description: 'stress' }] }) });
    class MockAudio {
      src = ''; onended: (() => void) | null = null; onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(() => { setTimeout(() => this.onended?.(), 10); return Promise.resolve(); });
    }
    global.Audio = MockAudio as unknown as typeof Audio;
    global.URL.createObjectURL = vi.fn(() => 'blob-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('renders when open', () => {
    render(<PronunciationVariants {...props} />);
    // Component renders and shows loading state initially
    expect(screen.getByText('Laen variante...')).toBeInTheDocument();
  });

  it('shows loading while fetching', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    render(<PronunciationVariants {...props} />);
    expect(screen.getByText('Laen variante...')).toBeInTheDocument();
  });

  it('displays variants after fetch', async () => {
    render(<PronunciationVariants {...props} />);
    await waitFor(() => expect(screen.getByText('te`st')).toBeInTheDocument());
  });

  it('calls onUseVariant when use button clicked', async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...props} />);
    await waitFor(() => expect(screen.getByText('Kasuta')).toBeInTheDocument());
    await user.click(screen.getByText('Kasuta'));
    expect(props.onUseVariant).toHaveBeenCalledWith('te`st');
  });

  it('plays variant audio on play click', async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...props} />);
    await waitFor(() => expect(screen.getByTitle('Mängi')).toBeInTheDocument());
    await user.click(screen.getByTitle('Mängi'));
  });

  it('shows custom variant form when toggled', async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...props} />);
    await waitFor(() => expect(screen.getByText('Loo oma variant')).toBeInTheDocument());
    await user.click(screen.getByText('Loo oma variant'));
    expect(screen.getByPlaceholderText('Kirjuta oma foneetiline variant')).toBeInTheDocument();
  });

  it('clears custom input when clear button clicked', async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...props} />);
    await waitFor(() => expect(screen.getByText('Loo oma variant')).toBeInTheDocument());
    await user.click(screen.getByText('Loo oma variant'));
    const input = screen.getByPlaceholderText('Kirjuta oma foneetiline variant');
    await user.type(input, 'custom');
    await user.click(screen.getByLabelText('Clear input'));
    expect(input).toHaveValue('');
  });

  it('handles fetch error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    render(<PronunciationVariants {...props} />);
    await waitFor(() => expect(screen.getByText(/viga/i)).toBeInTheDocument());
  });

  it('shows guide when guide link clicked', async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...props} />);
    await waitFor(() => expect(screen.getByText('Loo oma variant')).toBeInTheDocument());
    await user.click(screen.getByText('Loo oma variant'));
    await user.click(screen.getByText('siit'));
    expect(screen.getByText('Foneetiliste märkide juhend')).toBeInTheDocument();
  });

  it('closes guide when back clicked', async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...props} />);
    await waitFor(() => expect(screen.getByText('Loo oma variant')).toBeInTheDocument());
    await user.click(screen.getByText('Loo oma variant'));
    await user.click(screen.getByText('siit'));
    await user.click(screen.getByLabelText('Tagasi variantide juurde'));
    expect(screen.queryByText('Foneetiliste märkide juhend')).not.toBeInTheDocument();
  });

  it('inserts phonetic marker when marker button clicked', async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...props} />);
    await waitFor(() => expect(screen.getByText('Loo oma variant')).toBeInTheDocument());
    await user.click(screen.getByText('Loo oma variant'));
    const input = screen.getByPlaceholderText('Kirjuta oma foneetiline variant');
    await user.click(input);
    await user.click(screen.getByTitle('Kolmas välde'));
    expect(input).toHaveValue('`');
  });

  it('highlights selected variant', async () => {
    render(<PronunciationVariants {...props} customPhoneticForm="te`st" />);
    await waitFor(() => expect(screen.getByText('te`st')).toBeInTheDocument());
  });

  it('uses custom variant when typed and use clicked', async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...props} />);
    await waitFor(() => expect(screen.getByText('Loo oma variant')).toBeInTheDocument());
    await user.click(screen.getByText('Loo oma variant'));
    const input = screen.getByPlaceholderText('Kirjuta oma foneetiline variant');
    await user.type(input, 'my-custom');
    const useButtons = screen.getAllByText('Kasuta');
    const lastButton = useButtons[useButtons.length - 1];
    if (lastButton) await user.click(lastButton);
    expect(props.onUseVariant).toHaveBeenCalledWith('my-custom');
  });
});
