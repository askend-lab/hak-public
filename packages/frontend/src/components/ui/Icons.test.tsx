import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as Icons from './Icons';

const iconNames = Object.keys(Icons) as (keyof typeof Icons)[];

describe('Icons', () => {
  it.each(iconNames)('%s renders with default props', (name) => {
    const Component = Icons[name];
    const { container } = render(<Component />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it.each(iconNames)('%s renders with custom size', (name) => {
    const Component = Icons[name];
    const { container } = render(<Component size={32} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('32');
    expect(svg?.getAttribute('height')).toBe('32');
  });

  it.each(iconNames)('%s renders with custom className', (name) => {
    const Component = Icons[name];
    const { container } = render(<Component className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('custom-class')).toBe(true);
  });
});
