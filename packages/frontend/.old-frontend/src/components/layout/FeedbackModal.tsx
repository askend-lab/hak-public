import { useState } from 'react';

interface FeedbackModalProps {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual feedback submission to backend
    console.info('Feedback submitted:', { message, email });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div role="dialog" aria-label="Feedback" className="feedback-modal__overlay">
        <div className="feedback-modal__success">
          <h2 className="feedback-modal__success-title">Täname!</h2>
          <p className="feedback-modal__success-message">Teie tagasiside on edastatud.</p>
          <button onClick={onClose} className="feedback-modal__btn feedback-modal__btn--submit">
            Sulge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div role="dialog" aria-label="Feedback form" className="feedback-modal__overlay">
      <form onSubmit={handleSubmit} className="feedback-modal__form">
        <div className="feedback-modal__header">
          <h2 className="feedback-modal__title">Tagasiside</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="feedback-modal__close">
            ×
          </button>
        </div>

        <p className="feedback-modal__intro">
          Aitame meil seda tööriista paremaks muuta! Jaga oma kogemusi, vigadest teatamist, funktsioonide soovitusi või muid märkusi, mis aitaksid kõnesünteesi tööriista täiustada.
        </p>

        <div className="feedback-modal__field">
          <label htmlFor="feedback-message" className="feedback-modal__label">Teade</label>
          <textarea
            id="feedback-message"
            name="message"
            value={message}
            onChange={(e) => { setMessage(e.target.value); }}
            rows={4}
            placeholder="Kirjuta meile"
            className="feedback-modal__textarea"
          />
        </div>

        <div className="feedback-modal__section">
          <h3 className="feedback-modal__section-title">Kas soovid vastust?</h3>
          <p className="feedback-modal__section-desc">
            Kui soovid oma küsimusele vastust, jäta meile oma e-posti aadress.
          </p>
        </div>

        <div className="feedback-modal__field">
          <label htmlFor="feedback-email" className="feedback-modal__label">E-post</label>
          <input
            id="feedback-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
            placeholder="E-posti aadress"
            className="feedback-modal__input"
          />
        </div>

        <div className="feedback-modal__actions">
          <button type="button" onClick={onClose} className="feedback-modal__btn feedback-modal__btn--cancel">
            Tühista
          </button>
          <button type="submit" className="feedback-modal__btn feedback-modal__btn--submit">
            Saada
          </button>
        </div>
      </form>
    </div>
  );
}
