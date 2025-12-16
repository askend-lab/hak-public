// Mock services that use import.meta.env
jest.mock('./services/tasks/api', () => ({
  addEntryToTask: jest.fn(),
  createTask: jest.fn(),
  getTask: jest.fn(),
  setAuthTokenGetter: jest.fn(),
}));

jest.mock('./services/audio', () => ({
  synthesizeText: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import { AuthProvider } from './services/auth';
import App from './App';

describe('App', () => {
  it('renders with AuthProvider without crashing', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    
    expect(screen.getByText('Eesti keele kõnesüntees')).toBeInTheDocument();
  });

  it('throws error when TaskSelectModal used without AuthProvider', () => {
    // This test documents the requirement: App needs AuthProvider
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<App />);
    }).toThrow('useAuth must be used within AuthProvider');
    
    consoleSpy.mockRestore();
  });
});
