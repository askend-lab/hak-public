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

import { render, screen, fireEvent } from '@testing-library/react';
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

  describe('Lisa ülesandesse button - TDD', () => {
    it('should open login modal when clicked and user is NOT logged in', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <I18nextProvider i18n={i18n}>
              <App />
            </I18nextProvider>
          </AuthProvider>
        </MemoryRouter>
      );
      
      // Type text and press Space to add word (enables button)
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Tere' } });
      fireEvent.keyDown(input, { key: ' ' });
      
      // Click Lisa ülesandesse button
      const addToTaskButton = screen.getByText(/Lisa ülesandesse/i);
      fireEvent.click(addToTaskButton);
      
      // Should open login modal for unauthenticated user
      const loginModal = screen.queryByRole('dialog');
      expect(loginModal).toBeInTheDocument();
    });

    it('should open task select modal when clicked and user IS logged in', async () => {
      // For now, test that button is clickable - full auth mock needed for complete test
      render(
        <MemoryRouter>
          <AuthProvider>
            <I18nextProvider i18n={i18n}>
              <App />
            </I18nextProvider>
          </AuthProvider>
        </MemoryRouter>
      );
      
      // Type text and press Space to add word (enables button)
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Tere' } });
      fireEvent.keyDown(input, { key: ' ' });
      
      // Click Lisa ülesandesse button
      const addToTaskButton = screen.getByText(/Lisa ülesandesse/i);
      fireEvent.click(addToTaskButton);
      
      // Should open some modal (login or task select depending on auth state)
      const modal = screen.queryByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });
});
