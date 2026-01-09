import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import RoleMascot from './RoleMascot';

describe('RoleMascot', () => {
  describe('rendering', () => {
    it('renders SVG element', () => {
      const { container } = render(<RoleMascot variant="wave" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('applies variant class for wave', () => {
      const { container } = render(<RoleMascot variant="wave" />);
      expect(container.querySelector('.role-mascot--wave')).toBeInTheDocument();
    });

    it('applies variant class for point', () => {
      const { container } = render(<RoleMascot variant="point" />);
      expect(container.querySelector('.role-mascot--point')).toBeInTheDocument();
    });

    it('applies variant class for think', () => {
      const { container } = render(<RoleMascot variant="think" />);
      expect(container.querySelector('.role-mascot--think')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<RoleMascot variant="wave" className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('has aria-hidden attribute', () => {
      const { container } = render(<RoleMascot variant="wave" />);
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('wave variant', () => {
    it('renders wave mascot with correct elements', () => {
      const { container } = render(<RoleMascot variant="wave" />);
      const svg = container.querySelector('svg');
      
      // Should have body path
      expect(svg?.querySelectorAll('path').length).toBeGreaterThan(0);
      // Should have eyes (ellipses and circles)
      expect(svg?.querySelectorAll('ellipse').length).toBeGreaterThan(0);
      expect(svg?.querySelectorAll('circle').length).toBeGreaterThan(0);
    });
  });

  describe('point variant', () => {
    it('renders point mascot with correct elements', () => {
      const { container } = render(<RoleMascot variant="point" />);
      const svg = container.querySelector('svg');
      
      expect(svg?.querySelectorAll('path').length).toBeGreaterThan(0);
      expect(svg?.querySelectorAll('ellipse').length).toBeGreaterThan(0);
    });
  });

  describe('think variant', () => {
    it('renders think mascot with correct elements', () => {
      const { container } = render(<RoleMascot variant="think" />);
      const svg = container.querySelector('svg');
      
      expect(svg?.querySelectorAll('path').length).toBeGreaterThan(0);
      expect(svg?.querySelectorAll('ellipse').length).toBeGreaterThan(0);
    });
  });

  describe('different variants render different SVG content', () => {
    it('wave and point have different arm paths', () => {
      const { container: waveContainer } = render(<RoleMascot variant="wave" />);
      const { container: pointContainer } = render(<RoleMascot variant="point" />);
      
      const wavePaths = waveContainer.querySelectorAll('path');
      const pointPaths = pointContainer.querySelectorAll('path');
      
      // Convert to arrays of d attributes
      const waveDs = Array.from(wavePaths).map(p => p.getAttribute('d'));
      const pointDs = Array.from(pointPaths).map(p => p.getAttribute('d'));
      
      // They should have different arm paths
      expect(waveDs).not.toEqual(pointDs);
    });

    it('wave and think have different eye positions', () => {
      const { container: waveContainer } = render(<RoleMascot variant="wave" />);
      const { container: thinkContainer } = render(<RoleMascot variant="think" />);
      
      const waveCircles = waveContainer.querySelectorAll('circle');
      const thinkCircles = thinkContainer.querySelectorAll('circle');
      
      // Get cy attributes (vertical position of pupils)
      const waveCy = Array.from(waveCircles).map(c => c.getAttribute('cy'));
      const thinkCy = Array.from(thinkCircles).map(c => c.getAttribute('cy'));
      
      // Think variant has eyes looking up (lower cy values)
      expect(waveCy).not.toEqual(thinkCy);
    });
  });
});
