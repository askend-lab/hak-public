interface PhoneticGuideModalProps {
  onClose: () => void;
}

const PHONETIC_SYMBOLS = [
  { symbol: '`', name: 'Kolmas pikkusaste', description: 'Third degree length - extra long vowel', example: 'sa`ada (to send)' },
  { symbol: '´', name: 'Rõhumärk', description: 'Stress marker - primary stress', example: 'ké́na (beautiful)' },
  { symbol: "'", name: 'Palatalisatsioon', description: 'Palatalization - soft consonant', example: "pal'li (of ball)" },
  { symbol: '+', name: 'Liitsõna piir', description: 'Compound word boundary', example: 'kooli+tüdruk (schoolgirl)' },
];

export function PhoneticGuideModal({ onClose }: PhoneticGuideModalProps) {
  return (
    <div role="dialog" aria-label="Phonetic guide" className="phonetic-guide-modal__overlay">
      <div className="phonetic-guide-modal__content">
        <div className="phonetic-guide-modal__header">
          <h2 className="phonetic-guide-modal__title">Foneetilised sümbolid</h2>
          <button onClick={onClose} aria-label="Close" className="phonetic-guide-modal__close">×</button>
        </div>
        <div className="phonetic-guide-modal__list">
          {PHONETIC_SYMBOLS.map(({ symbol, name, description, example }) => (
            <div key={symbol} className="phonetic-guide-modal__card">
              <div className="phonetic-guide-modal__symbol-row">
                <span className="phonetic-guide-modal__symbol">{symbol}</span>
                <span className="phonetic-guide-modal__name">{name}</span>
              </div>
              <p className="phonetic-guide-modal__description">{description}</p>
              <p className="phonetic-guide-modal__example">Näide: {example}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
