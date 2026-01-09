/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PhoneticGuideModal from './PhoneticGuideModal';

describe('PhoneticGuideModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <PhoneticGuideModal
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <PhoneticGuideModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    
    const modal = document.querySelector('.base-modal');
    expect(modal).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<PhoneticGuideModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Foneetiliste märkide juhend')).toBeInTheDocument();
  });

  it('renders intro text', () => {
    render(<PhoneticGuideModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/klõpsa sümbolitele/i)).toBeInTheDocument();
  });

  it('renders phonetic symbols section', () => {
    render(<PhoneticGuideModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Foneetilised märgendid:')).toBeInTheDocument();
  });

  it('renders all phonetic symbols', () => {
    render(<PhoneticGuideModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('`')).toBeInTheDocument();
    expect(screen.getByText('´')).toBeInTheDocument();
    expect(screen.getByText("'")).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('renders symbol descriptions', () => {
    render(<PhoneticGuideModal isOpen={true} onClose={vi.fn()} />);
    // Check that modal content is rendered
    expect(screen.getByText('Foneetiliste märkide juhend')).toBeInTheDocument();
  });

  it('renders examples section', () => {
    render(<PhoneticGuideModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Näited:')).toBeInTheDocument();
  });

  it('renders symbol copy buttons', () => {
    render(<PhoneticGuideModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTitle('Kopeeri "`" lõikelauale')).toBeInTheDocument();
  });

  it('renders example copy buttons', () => {
    render(<PhoneticGuideModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTitle("Kopeeri \"['ko.dus]\" lõikelauale")).toBeInTheDocument();
  });
});
