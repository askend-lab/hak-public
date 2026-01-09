'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';

interface FeedbackModalProps { isOpen: boolean; onClose: () => void; onSubmit: (message: string, email: string) => void; }

const FeedbackForm = ({ message, email, isSubmitting, onMessageChange, onEmailChange, onSubmit }: { message: string; email: string; isSubmitting: boolean; onMessageChange: (v: string) => void; onEmailChange: (v: string) => void; onSubmit: (e: React.FormEvent) => void }) => (
  <form onSubmit={onSubmit} className="feedback-modal__form">
    <div className="feedback-modal__field"><label htmlFor="feedback-message" className="feedback-modal__label">Teade</label><textarea id="feedback-message" value={message} onChange={(e) => onMessageChange(e.target.value)} className="feedback-modal__textarea" placeholder="Kirjuta meile" rows={6} required disabled={isSubmitting} /></div>
    <div className="feedback-modal__contact-section"><h3 className="feedback-modal__contact-title">Kas soovid vastust?</h3><p className="feedback-modal__contact-text">Kui soovid oma küsimusele vastust, jäta meile oma e-posti aadress.</p><div className="feedback-modal__field"><label htmlFor="feedback-email" className="feedback-modal__label">E-post</label><input id="feedback-email" type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} className="feedback-modal__input" placeholder="E-posti aadress" disabled={isSubmitting} /></div></div>
    <div className="feedback-modal__actions"><button type="submit" className="button button--primary" disabled={!message.trim() || isSubmitting}>{isSubmitting ? 'Saadan...' : 'Saada'}</button></div>
  </form>
);

export default function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [message, setMessage] = useState(''); const [email, setEmail] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!message.trim()) return;
    setIsSubmitting(true);
    try { await onSubmit(message, email); setMessage(''); setEmail(''); onClose(); }
    catch (err) { console.error('Failed to submit feedback:', err); }
    finally { setIsSubmitting(false); }
  };
  const handleClose = () => { if (!isSubmitting) { setMessage(''); setEmail(''); onClose(); } };
  if (!isOpen) return null;
  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Tagasiside" size="medium" className="feedback-modal">
      <div className="feedback-modal__description"><p>Aitame meil seda tööriista paremaks muuta! Jaga oma kogemusi, vigadest teatamist, funktsioonide soovitusi või muid märkusi, mis aitaksid kõnesünteesi tööriista täiustada.</p></div>
      <FeedbackForm message={message} email={email} isSubmitting={isSubmitting} onMessageChange={setMessage} onEmailChange={setEmail} onSubmit={handleSubmit} />
    </BaseModal>
  );
}
