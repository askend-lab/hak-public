import { render, screen } from '@testing-library/react';
import { UserAvatar } from './UserAvatar';

describe('UserAvatar', () => {
  it('should render initials', () => {
    render(<UserAvatar initials="JD" name="John Doe" id="user-123" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render name', () => {
    render(<UserAvatar initials="JD" name="John Doe" id="user-123" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render id', () => {
    render(<UserAvatar initials="JD" name="John Doe" id="user-123" />);
    expect(screen.getByText('user-123')).toBeInTheDocument();
  });
});
