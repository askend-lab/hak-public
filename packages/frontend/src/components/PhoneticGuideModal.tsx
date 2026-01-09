'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';

interface PhoneticGuideModalProps { isOpen: boolean; onClose: () => void; }

const symbols = [{ symbol: '`', description: 'kolmas välde (kolmemoreline silp)', example: "[`'ko.dus]" }, { symbol: '´', description: 'rõhuline silp (ettearvamatu)', example: "[´'rõ.hul]" }, { symbol: "'", description: 'palatalisatsioon', example: "['pal'jas]" }, { symbol: '+', description: 'liitsõna piir', example: "['maja+uks]" }];
const examples = [{ text: "['ko.dus]", description: 'tavaline rõhk' }, { text: "[`'ko.dus]", description: 'kolmas välde' }, { text: "['maja+uks]", description: 'liitsõna' }];

const SymbolItem = ({ symbol, description, example, copiedSymbol, onCopy }: { symbol: string; description: string; example: string; copiedSymbol: string | null; onCopy: (s: string) => void }) => (
  <div className="phonetic-guide-modal__symbol-item">
    <button className="phonetic-guide-modal__symbol-button" onClick={() => onCopy(symbol)} title={`Kopeeri "${symbol}" lõikelauale`} type="button"><code className="phonetic-guide-modal__symbol-code">{symbol}</code>{copiedSymbol === symbol && <span className="phonetic-guide-modal__copied-indicator">✓</span>}</button>
    <div className="phonetic-guide-modal__symbol-info"><span className="phonetic-guide-modal__symbol-description">{description}</span><span className="phonetic-guide-modal__symbol-example">{example}</span></div>
  </div>
);

const ExampleItem = ({ text, description, copiedSymbol, onCopy }: { text: string; description: string; copiedSymbol: string | null; onCopy: (s: string) => void }) => (
  <div className="phonetic-guide-modal__example-item">
    <button className="phonetic-guide-modal__example-button" onClick={() => onCopy(text)} title={`Kopeeri "${text}" lõikelauale`} type="button"><code className="phonetic-guide-modal__example-code">{text}</code>{copiedSymbol === text && <span className="phonetic-guide-modal__copied-indicator">✓</span>}</button>
    <span className="phonetic-guide-modal__example-description">{description}</span>
  </div>
);

export default function PhoneticGuideModal({ isOpen, onClose }: PhoneticGuideModalProps) {
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
  if (!isOpen) return null;
  const copyToClipboard = async (symbol: string) => { try { await navigator.clipboard.writeText(symbol); setCopiedSymbol(symbol); setTimeout(() => setCopiedSymbol(null), 2000); } catch (err) { console.error('Failed to copy symbol:', err); } };
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Foneetiliste märkide juhend" size="medium" className="phonetic-guide-modal">
      <div className="phonetic-guide-modal__intro"><p>Klõpsa sümbolitele, et need lõikelauale kopeerida ja redigeerimise ajal kasutada.</p></div>
      <div className="phonetic-guide-modal__section"><h3 className="phonetic-guide-modal__section-title">Foneetilised märgendid:</h3><div className="phonetic-guide-modal__symbol-list">{symbols.map(s => <SymbolItem key={s.symbol} {...s} copiedSymbol={copiedSymbol} onCopy={copyToClipboard} />)}</div></div>
      <div className="phonetic-guide-modal__section"><h3 className="phonetic-guide-modal__section-title">Näited:</h3><div className="phonetic-guide-modal__example-list">{examples.map(e => <ExampleItem key={e.text} {...e} copiedSymbol={copiedSymbol} onCopy={copyToClipboard} />)}</div></div>
    </BaseModal>
  );
}
