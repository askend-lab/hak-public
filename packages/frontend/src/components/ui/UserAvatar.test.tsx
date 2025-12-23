import { render, screen } from '@testing-library/react';

import { UserAvatar } from './UserAvatar';

describe('UserAvatar', () => {
  it('should render user initials, name and id', () => {
    render(
      <UserAvatar 
        initials="JD" 
        name="John Doe" 
        id="user123" 
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('user123')).toBeInTheDocument();
  });

  it('should handle single character initials', () => {
    render(
      <UserAvatar 
        initials="A" 
        name="Alice" 
        id="user001" 
      />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should handle empty initials', () => {
    render(
      <UserAvatar 
        initials="" 
        name="No Initials" 
        id="user002" 
      />
    );

    // Should render without crashing
    expect(screen.getByText('No Initials')).toBeInTheDocument();
    expect(screen.getByText('user002')).toBeInTheDocument();
  });

  it('should handle long names and ids', () => {
    render(
      <UserAvatar 
        initials="LMN" 
        name="Very Long User Name That Might Overflow" 
        id="very-long-user-id-that-might-be-too-long" 
      />
    );

    expect(screen.getByText('LMN')).toBeInTheDocument();
    expect(screen.getByText('Very Long User Name That Might Overflow')).toBeInTheDocument();
    expect(screen.getByText('very-long-user-id-that-might-be-too-long')).toBeInTheDocument();
  });
});
