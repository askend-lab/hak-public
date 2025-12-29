import { render, screen } from '@testing-library/react';

import { Button } from './Button';

describe('Button', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should apply variant class', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByText('Outline');
    expect(button).toHaveClass('button--outline');
  });

  it('should apply size class', () => {
    render(<Button size="small">Small</Button>);
    const button = screen.getByText('Small');
    expect(button).toHaveClass('button--small');
  });

  describe('Disabled state styling (bug fix)', () => {
    it('should apply disabled attribute when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();
    });

    it('should have button--primary class for disabled styling', () => {
      render(<Button variant="primary" disabled>Primary Disabled</Button>);
      const button = screen.getByText('Primary Disabled');
      expect(button).toHaveClass('button--primary');
      expect(button).toBeDisabled();
    });

    it('should have button--outline class for disabled styling', () => {
      render(<Button variant="outline" disabled>Outline Disabled</Button>);
      const button = screen.getByText('Outline Disabled');
      expect(button).toHaveClass('button--outline');
      expect(button).toBeDisabled();
    });
  });

  describe('Outline button styling (bug fix - shared styles)', () => {
    it('should have button--outline class for white bg + border styling', () => {
      render(<Button variant="outline">Lisa lause</Button>);
      const button = screen.getByText('Lisa lause');
      expect(button).toHaveClass('button--outline');
    });

    it('should have same classes for both Lisa lause and Lisa ülesandesse buttons', () => {
      const { rerender } = render(<Button variant="outline" size="small">Lisa ülesandesse (0)</Button>);
      const button1 = screen.getByText('Lisa ülesandesse (0)');
      expect(button1).toHaveClass('button--outline');
      expect(button1).toHaveClass('button--small');

      rerender(<Button variant="outline">Lisa lause</Button>);
      const button2 = screen.getByText('Lisa lause');
      expect(button2).toHaveClass('button--outline');
    });
  });

  describe('Small button styling (bug fix - single line)', () => {
    it('should have button--small class for nowrap styling', () => {
      render(<Button size="small">Small Button</Button>);
      const button = screen.getByText('Small Button');
      expect(button).toHaveClass('button--small');
    });
  });
});
