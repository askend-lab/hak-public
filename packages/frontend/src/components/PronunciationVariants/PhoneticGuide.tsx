'use client';

import { CloseIcon, BackIcon } from '../ui/Icons';

interface PhoneticGuideProps { onBack: () => void; onClose: () => void; }

const MarkerItem = ({ symbol, name, rule, examples }: { symbol: string; name: string; rule: string; examples: string[] }) => (
  <div className="pronunciation-variants__marker-item">
    <div className="pronunciation-variants__marker-symbol"><code>{symbol}</code><span className="pronunciation-variants__marker-name">{name}</span></div>
    <div className="pronunciation-variants__marker-rule">{rule}</div>
    <div className="pronunciation-variants__marker-examples">{examples.map((ex, i) => <span key={i} className="pronunciation-variants__item-tag">{ex}</span>)}</div>
  </div>
);

const markers = [
  { symbol: '`', name: 'kolmas välde', rule: 'Paikneb kolmandavältelise silbi esimese täishääliku ees.', examples: ['k`ätte', 'par`ool', 's`aada', 'l`aeva'] },
  { symbol: '´', name: 'ebareeglipärase rõhu märk', rule: 'Kasutatakse ainult kui rõhk ei ole reeglipärane ehk esimesel silbil. Paikneb pearõhulise silbi esimese täishääliku ees.', examples: ['selj´anka', 'dial´ektika'] },
  { symbol: "'", name: 'peenendus (palatalisatsioon)', rule: 'Võib paikneda konsonantide d, l, n, s ja t järel. Kahetähelise pika hääliku puhul on see märk vaid esimese tähe järel.', examples: ["pad'ja", "p`an't", "k`as't", "s`al'l"] },
  { symbol: '+', name: 'liitsõnapiir', rule: 'Märgib liitsõna osade vahelist piiri.', examples: ['maja+uks', 'auto+juht'] },
];

export default function PhoneticGuide({ onBack, onClose }: PhoneticGuideProps) {
  return (
    <div className="pronunciation-variants__guide-view">
      <div className="pronunciation-variants__guide-view-header">
        <button onClick={onBack} className="pronunciation-variants__back-button--icon-only" aria-label="Tagasi variantide juurde" type="button"><BackIcon size="2xl" /></button>
        <h4>Hääldusmärkide juhend</h4>
        <button onClick={onClose} className="pronunciation-variants__close" aria-label="Close" type="button"><CloseIcon size="2xl" /></button>
      </div>
      <div className="pronunciation-variants__guide-view-content">
        <p className="pronunciation-variants__guide-intro">Hääldusmärgid aitavad täpsustada sõna hääldust. Klõpsa märgil, et lisada see kursori asukohta.</p>
        {markers.map((m, i) => <MarkerItem key={i} {...m} />)}
      </div>
    </div>
  );
}
