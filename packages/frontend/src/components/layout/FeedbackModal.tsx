import { useState } from 'react';

import { colors, borderRadius, gap, fontWeight } from '../../styles/colors';
import { modalOverlayStyle, modalHeaderStyle, closeButtonStyle } from '../../styles/modalStyles';

interface FeedbackModalProps {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div role="dialog" aria-label="Feedback" style={modalOverlayStyle}>
        <div
          className="success-message"
          style={{
            background: colors.white,
            padding: '2rem',
            borderRadius: borderRadius.large,
            textAlign: 'center',
          }}
        >
          <h2 style={{ color: colors.primary, marginBottom: gap.md }}>Täname!</h2>
          <p style={{ color: colors.textSecondary, marginBottom: gap.lg }}>
            Teie tagasiside on edastatud.
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: borderRadius.small,
              cursor: 'pointer',
            }}
          >
            Sulge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div role="dialog" aria-label="Feedback form" style={modalOverlayStyle}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: colors.white,
          padding: '2rem',
          borderRadius: borderRadius.large,
          minWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: gap.lg,
        }}
      >
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, color: colors.primary, fontWeight: fontWeight.bold }}>
            Tagasiside
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: gap.sm }}>
          <label htmlFor="feedback-message" style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
            Sõnum
          </label>
          <textarea
            id="feedback-message"
            name="message"
            value={message}
            onChange={(e) => { setMessage(e.target.value); }}
            rows={4}
            style={{
              padding: '0.75rem',
              border: `1px solid ${colors.outlinedNeutral}`,
              borderRadius: borderRadius.small,
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: gap.sm }}>
          <label htmlFor="feedback-email" style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
            E-post <span style={{ color: colors.gray }}>(optional)</span>
          </label>
          <input
            id="feedback-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
            style={{
              padding: '0.75rem',
              border: `1px solid ${colors.outlinedNeutral}`,
              borderRadius: borderRadius.small,
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: gap.md, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: `1px solid ${colors.outlinedNeutral}`,
              borderRadius: borderRadius.small,
              cursor: 'pointer',
            }}
          >
            Tühista
          </button>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              background: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: borderRadius.small,
              fontWeight: fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            Saada
          </button>
        </div>
      </form>
    </div>
  );
}
