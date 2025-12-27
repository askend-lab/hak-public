import { colors, borderRadius, gap, fontWeight } from '../../styles/colors';
import { modalOverlayStyle, modalHeaderStyle, closeButtonStyle } from '../../styles/modalStyles';

interface PhoneticGuideModalProps {
  onClose: () => void;
}

const contentStyle = {
  background: colors.white,
  padding: '2rem',
  borderRadius: borderRadius.large,
  maxWidth: '500px',
  width: '90%',
  maxHeight: '80vh',
  overflow: 'auto',
} as const;

const titleStyle = { margin: 0, color: colors.primary, fontWeight: fontWeight.bold } as const;
const symbolListStyle = { display: 'flex', flexDirection: 'column', gap: gap.md } as const;
const symbolCardStyle = { padding: gap.md, background: colors.softNeutralBg, borderRadius: borderRadius.small } as const;
const symbolRowStyle = { display: 'flex', alignItems: 'center', gap: gap.sm, marginBottom: gap.xs } as const;
const symbolStyle = { fontSize: '1.5rem', fontWeight: fontWeight.bold, color: colors.primary, minWidth: '2rem', textAlign: 'center' } as const;

const PHONETIC_SYMBOLS = [
  { symbol: '`', name: 'Kolmas pikkusaste', description: 'Third degree length - extra long vowel', example: 'sa`ada (to send)' },
  { symbol: '´', name: 'Rõhumärk', description: 'Stress marker - primary stress', example: 'ké́na (beautiful)' },
  { symbol: "'", name: 'Palatalisatsioon', description: 'Palatalization - soft consonant', example: "pal'li (of ball)" },
  { symbol: '+', name: 'Liitsõna piir', description: 'Compound word boundary', example: 'kooli+tüdruk (schoolgirl)' },
];

export function PhoneticGuideModal({ onClose }: PhoneticGuideModalProps) {
  return (
    <div
      role="dialog"
      aria-label="Phonetic guide"
      className="phonetic-guide-modal"
      style={modalOverlayStyle}
    >
      <div style={contentStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={titleStyle}>Foneetilised sümbolid</h2>
          <button onClick={onClose} aria-label="Close" style={closeButtonStyle}>×</button>
        </div>
        <div style={symbolListStyle}>
          {PHONETIC_SYMBOLS.map(({ symbol, name, description, example }) => (
            <div key={symbol} style={symbolCardStyle}>
              <div style={symbolRowStyle}>
                <span style={symbolStyle}>{symbol}</span>
                <span style={{ fontWeight: fontWeight.medium }}>{name}</span>
              </div>
              <p style={{ margin: `0 0 ${gap.xs} 0`, color: colors.textSecondary, fontSize: '0.875rem' }}>
                {description}
              </p>
              <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.875rem' }}>
                Näide: {example}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
