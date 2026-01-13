'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateIsikukood } from '@/utils/isikukood';
import BaseModal from './BaseModal';
import { ErrorIcon } from './ui/Icons';

interface LoginModalProps { isOpen: boolean; onClose: () => void; message?: string; }
type AuthMethod = 'smartid' | 'mobileid' | 'idcard';
const demoIsikukoodid = [{ code: '38001085718', name: 'Margus Tamm' }, { code: '49203156512', name: 'Jana Sepp' }, { code: '47012093717', name: 'Pille Kukk' }, { code: '48506124519', name: 'Liina Rebane' }];
const loadingTexts: Record<AuthMethod, string> = { smartid: 'Ootan Smart-ID kinnitust...', mobileid: 'Ootan Mobiil-ID kinnitust...', idcard: 'Kontrollin ID-kaarti...' };

const LoginIntro = () => <div className="login-modal__intro"><img src="/icons/logo.svg" alt="Logo" className="login-modal__intro-logo" /><h2 className="login-modal__intro-title">Logi sisse siseveebi</h2><p className="login-modal__intro-description">Sisene, et luua ja hallata ülesandeid</p></div>;

const AuthTabs = ({ authMethod, isLoading, onChange }: { authMethod: AuthMethod; isLoading: boolean; onChange: (m: AuthMethod) => void }) => (
  <div className="login-modal__auth-methods">
    {(['smartid', 'mobileid', 'idcard'] as AuthMethod[]).map(m => <button key={m} onClick={() => onChange(m)} className={`login-modal__auth-tab ${authMethod === m ? 'login-modal__auth-tab--active' : ''}`} disabled={isLoading}>{m === 'smartid' ? 'Smart-ID' : m === 'mobileid' ? 'Mobiil-ID' : 'ID-kaart'}</button>)}
  </div>
);

const ErrorDisplay = ({ error }: { error: string }) => <div className="login-modal__error"><ErrorIcon size="md" /><p>{error}</p></div>;

const LoadingDisplay = ({ authMethod }: { authMethod: AuthMethod }) => <div className="login-modal__loading"><div className="login-modal__loading-spinner"></div><p className="login-modal__loading-text">{loadingTexts[authMethod]}</p><p className="login-modal__loading-subtext">Palun kinnita sisselogimine oma seadmes</p></div>;

const DemoHelper = ({ isLoading, onSelect }: { isLoading: boolean; onSelect: (code: string) => void }) => (
  <div className="login-modal__demo-helper"><p className="login-modal__demo-title">Demo isikukoodid:</p><div className="login-modal__demo-codes">{demoIsikukoodid.map(d => <button key={d.code} onClick={() => onSelect(d.code)} className="login-modal__demo-code" disabled={isLoading} type="button"><span className="login-modal__demo-code-number">{d.code}</span><span className="login-modal__demo-code-name">({d.name})</span></button>)}</div></div>
);

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [isikukood, setIsikukood] = useState(''); const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); const [authMethod, setAuthMethod] = useState<AuthMethod>('smartid');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!isikukood.trim()) { setError('Palun sisesta isikukood'); return; }
    if (!validateIsikukood(isikukood)) { setError('Vigane isikukood. Palun kontrolli ja proovi uuesti'); return; }
    setIsLoading(true);
    try { await login(isikukood); setIsikukood(''); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Sisselogimine ebaõnnestus'); }
    finally { setIsLoading(false); }
  };
  const handleClose = () => { if (!isLoading) { setIsikukood(''); setError(null); onClose(); } };
  const handleInputChange = (v: string) => { setIsikukood(v.replace(/\D/g, '').slice(0, 11)); setError(null); };
  if (!isOpen) return null;
  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} showCloseButton={true} size="medium" className="login-modal">
      <LoginIntro />
      <AuthTabs authMethod={authMethod} isLoading={isLoading} onChange={setAuthMethod} />
      <form onSubmit={handleSubmit} className="login-modal__form">
        <div className="login-modal__field"><label htmlFor="isikukood" className="login-modal__label">Isikukood</label><input id="isikukood" type="text" value={isikukood} onChange={(e) => handleInputChange(e.target.value)} className="login-modal__input" placeholder="Sisesta 11-kohaline isikukood" maxLength={11} disabled={isLoading} autoFocus /><div className="login-modal__field-help">11-kohaline number (nt: 38001085718)</div></div>
        {error && <ErrorDisplay error={error} />}
        {isLoading && <LoadingDisplay authMethod={authMethod} />}
        <div className="login-modal__actions"><button type="submit" className="button button--primary" disabled={isLoading || !isikukood || isikukood.length !== 11}>{isLoading ? 'Sisenen...' : 'Sisene'}</button></div>
      </form>
      <DemoHelper isLoading={isLoading} onSelect={setIsikukood} />
    </BaseModal>
  );
}
