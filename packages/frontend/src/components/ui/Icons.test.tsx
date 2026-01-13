import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Icon } from './Icon';
import { PlayIcon, PauseIcon, CloseIcon, EditIcon, TrashIcon } from './Icons';

describe('Icon component', () => {
  it('renders with name prop', () => {
    const { container } = render(<Icon name="play_arrow" />);
    const span = container.querySelector('.icon');
    expect(span).toBeTruthy();
    expect(span?.textContent).toBe('play_arrow');
  });

  it('renders with custom size', () => {
    const { container } = render(<Icon name="close" size="xl" />);
    const span = container.querySelector('.icon');
    expect(span?.classList.contains('icon--xl')).toBe(true);
  });

  it('renders with custom weight', () => {
    const { container } = render(<Icon name="edit" weight="bold" />);
    const span = container.querySelector('.icon');
    expect(span?.classList.contains('icon--bold')).toBe(true);
  });

  it('renders with filled modifier', () => {
    const { container } = render(<Icon name="check" filled />);
    const span = container.querySelector('.icon');
    expect(span?.classList.contains('icon--filled')).toBe(true);
  });

  it('renders with custom className', () => {
    const { container } = render(<Icon name="search" className="custom-class" />);
    const span = container.querySelector('.icon');
    expect(span?.classList.contains('custom-class')).toBe(true);
  });

  it('has aria-hidden attribute', () => {
    const { container } = render(<Icon name="help" />);
    const span = container.querySelector('.icon');
    expect(span?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('Named icon components', () => {
  it('PlayIcon renders correctly', () => {
    const { container } = render(<PlayIcon />);
    const span = container.querySelector('.icon');
    expect(span?.textContent).toBe('play_arrow');
  });

  it('PauseIcon renders correctly', () => {
    const { container } = render(<PauseIcon />);
    const span = container.querySelector('.icon');
    expect(span?.textContent).toBe('pause');
  });

  it('CloseIcon renders correctly', () => {
    const { container } = render(<CloseIcon />);
    const span = container.querySelector('.icon');
    expect(span?.textContent).toBe('close');
  });

  it('EditIcon renders with custom size', () => {
    const { container } = render(<EditIcon size="2xl" />);
    const span = container.querySelector('.icon');
    expect(span?.classList.contains('icon--2xl')).toBe(true);
  });

  it('TrashIcon renders with custom weight', () => {
    const { container } = render(<TrashIcon weight="medium" />);
    const span = container.querySelector('.icon');
    expect(span?.classList.contains('icon--medium')).toBe(true);
  });
});
