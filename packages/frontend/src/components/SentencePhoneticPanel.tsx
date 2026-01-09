/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useState, useEffect, useRef } from 'react';
import { transformToUI, transformToVabamorf } from '@/utils/phoneticMarkers';
import { synthesizeWithPolling } from '@/utils/synthesize';

interface SentencePhoneticPanelProps { sentenceText: string; phoneticText: string | null; isOpen: boolean; onClose: () => void; onApply: (newPhoneticText: string) => void; }

const getVoiceModel = (text: string): 'efm_s' | 'efm_l' => text.trim().split(/\s+/).filter(w => w.length > 0).length === 1 ? 'efm_s' : 'efm_l';

const BackIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.31445 6.5C8.32533 6.49867 8.38306 6.49567 8.56055 6.56641C8.73719 6.63681 8.96582 6.75129 9.30957 6.9248L17.958 11.291C17.9608 11.2924 17.964 11.2936 17.9668 11.2949C18.343 11.4848 18.5952 11.6131 18.7715 11.7227C18.9298 11.8211 18.9662 11.8696 18.9707 11.876C19.0093 11.9553 19.0094 12.0447 18.9707 12.124C18.9655 12.1314 18.9276 12.1805 18.7705 12.2783C18.593 12.3887 18.3379 12.5182 17.958 12.71L9.30957 17.0752C8.96567 17.2488 8.73701 17.3634 8.56055 17.4336C8.38339 17.5041 8.32566 17.5014 8.31445 17.5C8.20475 17.4865 8.11413 17.431 8.05957 17.3584C8.0567 17.3539 8.0328 17.3114 8.01758 17.1543C8.00046 16.9776 8 16.7364 8 16.3662V7.63477C8 7.26444 8.00045 7.02263 8.01758 6.8457C8.03473 6.66887 8.06291 6.63716 8.05957 6.6416C8.11415 6.56897 8.20478 6.51347 8.31445 6.5Z" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const PauseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="6" width="3" height="12" fill="currentColor" rx="1" /><rect x="14" y="6" width="3" height="12" fill="currentColor" rx="1" /></svg>;

const markerData = [
  { symbol: '`', name: 'kolmas välde', rule: 'Paikneb kolmandavältelise silbi esimese vokaali ees ainult täishääliku ees.', examples: ['k`ätte', 'par`ool'] },
  { symbol: '´', name: 'ebareeglipärase rõhu märk', rule: 'Kasutatakse ainult kui rõhk ei ole reeglipärane ehk esimesel silbil. Paikneb pearõhulise silbi esimese vokaali ees.', examples: ['selj´anka', 'dial´ektika'] },
  { symbol: "'", name: 'palatalisatsioon', rule: 'Võib paikneda konsonantide d, l, n, s ja t järel. Kahetähelise pika hääliku puhul on see märk vaid esimese tähe järel.', examples: ["pad'ja", "p`an't", "k`as't"] },
  { symbol: '+', name: 'liitsõnapiir', rule: 'Märgib liitsõna osade vahelist piiri.', examples: ['maja+uks', 'auto+juht'] },
];

const MarkerItem = ({ m }: { m: typeof markerData[0] }) => (
  <div className="sentence-phonetic-panel__marker-item">
    <div className="sentence-phonetic-panel__marker-symbol"><code>{m.symbol}</code><span className="sentence-phonetic-panel__marker-name">{m.name}</span></div>
    <div className="sentence-phonetic-panel__marker-rule"><strong>Reegel:</strong> {m.rule}</div>
    <div className="sentence-phonetic-panel__marker-examples"><strong>Näited:</strong><ul>{m.examples.map((ex, i) => <li key={i}><code>{ex}</code></li>)}</ul></div>
  </div>
);

const GuideView = ({ onBack }: { onBack: () => void }) => (
  <div className="sentence-phonetic-panel__guide-view">
    <div className="sentence-phonetic-panel__guide-header"><button onClick={onBack} className="sentence-phonetic-panel__back-button" aria-label="Tagasi"><BackIcon />Tagasi</button><h4>Foneetiliste märkide juhend</h4></div>
    <div className="sentence-phonetic-panel__guide-content">
      <div className="sentence-phonetic-panel__guide-section"><p>Foneetilised märgid aitavad täpsustada lause hääldust. Klõpsa märgil, et lisada see kursori asukohta.</p></div>
      <div className="sentence-phonetic-panel__guide-section">{markerData.map((m, i) => <MarkerItem key={i} m={m} />)}</div>
      <div className="sentence-phonetic-panel__guide-section sentence-phonetic-panel__guide-section--tips"><h5>Kasulikud näpunäited:</h5><ul><li>Märke saad sisestada nuppudega sisestusvälja all</li><li>Kuula oma varianti enne kasutamist, et kontrollida hääldust</li><li>Kui oled rahul, vajuta "Kasuta" et rakendada muudatused lausesse</li></ul></div>
    </div>
  </div>
);

const MarkersToolbar = ({ onInsert }: { onInsert: (m: string) => void }) => (
  <div className="sentence-phonetic-panel__markers-toolbar">
    {markerData.map((m, i) => <button key={i} onClick={() => onInsert(m.symbol)} className="sentence-phonetic-panel__marker-button" title={m.name}>{m.symbol}</button>)}
  </div>
);

export default function SentencePhoneticPanel({ sentenceText, phoneticText, isOpen, onClose, onApply }: SentencePhoneticPanelProps) {
  const [editedText, setEditedText] = useState(''); const [isPlaying, setIsPlaying] = useState(false); const [isLoading, setIsLoading] = useState(false); const [showGuide, setShowGuide] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null); const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { if (isOpen && phoneticText) setEditedText(transformToUI(phoneticText) || ''); else if (isOpen && sentenceText && !phoneticText) setEditedText(sentenceText); }, [isOpen, phoneticText, sentenceText]);
  useEffect(() => { if (isOpen && inputRef.current) { inputRef.current.focus(); inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length); } }, [isOpen]);
  useEffect(() => () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } }, []);

  const insertMarkerAtCursor = (marker: string) => { const ta = inputRef.current; if (!ta) return; const s = ta.selectionStart || 0, e = ta.selectionEnd || 0; setEditedText(editedText.substring(0, s) + marker + editedText.substring(e)); setTimeout(() => { ta.focus(); ta.setSelectionRange(s + marker.length, s + marker.length); }, 0); };

  const handlePlay = async () => {
    if (!editedText.trim()) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsLoading(true); setIsPlaying(false);
    try {
      const vt = transformToVabamorf(editedText); const url = await synthesizeWithPolling(vt || '', getVoiceModel(vt || '')); const audio = new Audio(url); audioRef.current = audio;
      audio.onloadeddata = () => { setIsLoading(false); setIsPlaying(true); };
      audio.onended = audio.onerror = () => { setIsPlaying(false); setIsLoading(false); URL.revokeObjectURL(url); audioRef.current = null; };
      await audio.play();
    } catch (e) { console.error('Failed to play:', e); setIsPlaying(false); setIsLoading(false); }
  };

  const handleApply = () => { if (!editedText.trim()) return; onApply(transformToVabamorf(editedText) || ''); onClose(); };
  const handleClose = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } setIsPlaying(false); setIsLoading(false); onClose(); };

  if (!isOpen) return null;
  return (
    <div className="sentence-phonetic-panel">
      <div className="sentence-phonetic-panel__header"><div className="sentence-phonetic-panel__title-section"><h3 className="sentence-phonetic-panel__title">Muuda foneetilist kuju</h3></div><div className="sentence-phonetic-panel__header-actions"><button onClick={handleClose} className="sentence-phonetic-panel__close" aria-label="Sulge"><img src="/icons/Close%20X.svg" alt="Sulge" /></button></div></div>
      <div className="sentence-phonetic-panel__content">
        {showGuide ? <GuideView onBack={() => setShowGuide(false)} /> : (
          <div className="sentence-phonetic-panel__edit-section">
            <p className="sentence-phonetic-panel__description">Sisesta foneetilised märgid, et täpsustada lause hääldust. Kasuta allolevaid nuppe märkide lisamiseks. Juhendid saab lugeda <button className="sentence-phonetic-panel__guide-link" onClick={() => setShowGuide(true)}>siit</button>.</p>
            <div className="sentence-phonetic-panel__input-container"><textarea ref={inputRef} value={editedText} onChange={(e) => setEditedText(e.target.value)} className="sentence-phonetic-panel__textarea" placeholder="Kirjuta oma foneetiline variant" rows={4} /></div>
            <MarkersToolbar onInsert={insertMarkerAtCursor} />
            <div className="sentence-phonetic-panel__actions"><button onClick={handlePlay} disabled={!editedText.trim() || isLoading} className={`button button--primary ${isLoading ? 'loading' : ''} ${isPlaying ? 'playing' : ''}`} title={isLoading ? 'Laen...' : isPlaying ? 'Mängib' : 'Kuula'}>{isLoading ? <div className="loader-spinner"></div> : isPlaying ? <PauseIcon /> : <PlayIcon />}Kuula</button><button onClick={handleApply} disabled={!editedText.trim()} className="button button--secondary">Rakenda</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

