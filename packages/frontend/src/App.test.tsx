import { vi } from 'vitest';
// Mock services that use import.meta.env
vi.mock('./services/tasks/api', () => ({
  addEntryToTask: vi.fn(),
  createTask: vi.fn(),
  getTask: vi.fn(),
  setAuthTokenGetter: vi.fn(),
}));

vi.mock('./services/audio', () => ({
  synthesizeText: vi.fn(),
}));

import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import App from './App';
import i18n from './i18n-test';
import { AuthProvider } from './services/auth';

describe('App', () => {
  it('renders with AuthProvider without crashing', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <I18nextProvider i18n={i18n}>
            <App />
          </I18nextProvider>
        </AuthProvider>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Eesti keele kõnesüntees')).toBeInTheDocument();
  });

  it('throws error when TaskSelectModal used without AuthProvider', () => {
    // This test documents the requirement: App needs AuthProvider
     
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
    }).toThrow('useAuth must be used within AuthProvider');
    
    consoleSpy.mockRestore();
  });
});
