import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DropdownMenu, MoreOptionsIcon } from './DropdownMenu';

describe('DropdownMenu', () => {
  const mockItems = [
    { label: 'Edit', onClick: vi.fn() },
    { label: 'Delete', onClick: vi.fn(), danger: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render trigger button', () => {
    render(<DropdownMenu items={mockItems} trigger={<span>Menu</span>} />);
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('should have default aria-label', () => {
    render(<DropdownMenu items={mockItems} trigger={<span>Menu</span>} />);
    expect(screen.getByLabelText('Rohkem valikuid')).toBeInTheDocument();
  });

  it('should use custom aria-label', () => {
    render(<DropdownMenu items={mockItems} trigger={<span>Menu</span>} ariaLabel="Custom label" />);
    expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
  });

  it('should open menu on click', () => {
    render(<DropdownMenu items={mockItems} trigger={<span>Menu</span>} />);
    
    fireEvent.click(screen.getByLabelText('Rohkem valikuid'));
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should close menu on item click', () => {
    render(<DropdownMenu items={mockItems} trigger={<span>Menu</span>} />);
    
    fireEvent.click(screen.getByLabelText('Rohkem valikuid'));
    fireEvent.click(screen.getByText('Edit'));
    
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should call item onClick when clicked', () => {
    render(<DropdownMenu items={mockItems} trigger={<span>Menu</span>} />);
    
    fireEvent.click(screen.getByLabelText('Rohkem valikuid'));
    fireEvent.click(screen.getByText('Edit'));
    
    expect(mockItems[0]?.onClick).toHaveBeenCalled();
  });

  it('should apply danger class to danger items', () => {
    render(<DropdownMenu items={mockItems} trigger={<span>Menu</span>} />);
    
    fireEvent.click(screen.getByLabelText('Rohkem valikuid'));
    
    const deleteButton = screen.getByText('Delete').closest('button');
    expect(deleteButton).toHaveClass('menu-item-danger');
  });

  it('should close menu on backdrop click', () => {
    const { container } = render(<DropdownMenu items={mockItems} trigger={<span>Menu</span>} />);
    
    fireEvent.click(screen.getByLabelText('Rohkem valikuid'));
    
    const backdrop = container.querySelector('.menu-backdrop');
    fireEvent.click(backdrop!);
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('should toggle menu on button click', () => {
    render(<DropdownMenu items={mockItems} trigger={<span>Menu</span>} />);
    
    const button = screen.getByLabelText('Rohkem valikuid');
    
    fireEvent.click(button);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });
});

describe('MoreOptionsIcon', () => {
  it('should render SVG icon', () => {
    const { container } = render(<MoreOptionsIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should have correct dimensions', () => {
    const { container } = render(<MoreOptionsIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });
});

describe('DropdownMenu click outside', () => {
  it('should close when clicking outside', () => {
    const mockItems = [{ label: 'Test', onClick: vi.fn() }];
    render(
      <div>
        <DropdownMenu items={mockItems} trigger={<span>Menu</span>} />
        <button data-testid="outside">Outside</button>
      </div>
    );
    
    fireEvent.click(screen.getByLabelText('Rohkem valikuid'));
    expect(screen.getByText('Test')).toBeInTheDocument();
    
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });
});
