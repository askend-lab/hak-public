import { render, screen } from '@testing-library/react';

import { UserAvatar } from './UserAvatar';

describe('UserAvatar', () => {
  it('should render user initials, name and email', () => {
    render(
      <UserAvatar 
        initials="JD" 
        name="John Doe" 
        email="john@example.com" 
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should handle single character initials', () => {
    render(
      <UserAvatar 
        initials="A" 
        name="Alice" 
        email="alice@example.com" 
      />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should handle empty initials', () => {
    render(
      <UserAvatar 
        initials="" 
        name="No Initials" 
        email="no-initials@example.com" 
      />
    );

    // Should render without crashing
    expect(screen.getByText('No Initials')).toBeInTheDocument();
    expect(screen.getByText('no-initials@example.com')).toBeInTheDocument();
  });

  it('should handle missing email (optional prop)', () => {
    render(
      <UserAvatar 
        initials="LMN" 
        name="Very Long User Name That Might Overflow" 
      />
    );

    expect(screen.getByText('LMN')).toBeInTheDocument();
    expect(screen.getByText('Very Long User Name That Might Overflow')).toBeInTheDocument();
  });
});
