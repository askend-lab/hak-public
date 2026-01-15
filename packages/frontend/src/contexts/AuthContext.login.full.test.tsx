 
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const LoginBtn = ({ code = '38001085718' }: { code?: string }): React.ReactElement => {
  const { login, user } = useAuth();
  return (
    <div>
      <button onClick={() => login(code).catch(() => {})}>login</button>
      <span data-testid="uid">{user?.id || 'none'}</span>
    </div>
  );
};

describe('AuthContext login', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

  it('rejects invalid isikukood', async () => {
    render(<AuthProvider><LoginBtn code="invalid" /></AuthProvider>);
    await act(async () => { screen.getByText('login').click(); });
    expect(screen.getByTestId('uid')).toHaveTextContent('none');
  });

  it('logs in with valid code from database', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ users: [{ id: '38001085718', name: 'T', email: 't@t.ee' }] }) });
    render(<AuthProvider><LoginBtn /></AuthProvider>);
    await act(async () => { screen.getByText('login').click(); await new Promise(r => setTimeout(r, 1600)); });
    await waitFor(() => expect(screen.getByTestId('uid')).toHaveTextContent('38001085718'));
  });

  it('creates user if not in database', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ users: [] }) });
    render(<AuthProvider><LoginBtn /></AuthProvider>);
    await act(async () => { screen.getByText('login').click(); await new Promise(r => setTimeout(r, 1600)); });
    await waitFor(() => expect(screen.getByTestId('uid')).toHaveTextContent('38001085718'));
  });

  it('handles fetch error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<AuthProvider><LoginBtn /></AuthProvider>);
    await act(async () => { screen.getByText('login').click(); await new Promise(r => setTimeout(r, 1600)); });
    spy.mockRestore();
  });

  it('closes modal on successful login', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ users: [{ id: '38001085718', name: 'T', email: 't@t.ee' }] }) });
    const ModalCheck = (): React.ReactElement => {
      const { login, showLoginModal, setShowLoginModal } = useAuth();
      return (
        <div>
          <button onClick={() => setShowLoginModal(true)}>open</button>
          <button onClick={() => login('38001085718').catch(() => {})}>login</button>
          <span data-testid="modal">{showLoginModal ? 'open' : 'closed'}</span>
        </div>
      );
    };
    render(<AuthProvider><ModalCheck /></AuthProvider>);
    await act(async () => { screen.getByText('open').click(); });
    expect(screen.getByTestId('modal')).toHaveTextContent('open');
    await act(async () => { screen.getByText('login').click(); });
    await waitFor(() => expect(screen.getByTestId('modal')).toHaveTextContent('closed'), { timeout: 3000 });
  });
});
