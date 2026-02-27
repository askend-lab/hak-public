// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

function AccessibilityBody() {
  return (
    <div className="content-page__body">
      <div className="content-page__section">
        <h4>Sissejuhatus</h4>
        <p>See veebileht kuulub Eesti Keele Instituudile ja me soovime, et{" "}
          <a href="https://haaldusabiline.eki.ee" target="_blank" rel="noopener noreferrer">https://haaldusabiline.eki.ee</a>{" "}
          oleks vastavuses avaliku teabe seaduse §32 alusel kehtestatud ligipääsetavusnõuetega.</p>
        <p>Teatise lõpus on välja toodud kontaktandmed, kuhu pöörduda, kui veebilehe ligipääsetavusega ilmneb probleeme.</p>
      </div>
      <div className="content-page__section">
        <h4>Nõuetele vastavuse olek</h4>
        <p>See veebileht vastab olulises osas ligipääsetavusnõuetele. Allpool on loetletud teadaolevad üksikud puudujäägid.</p>
      </div>
      <div className="content-page__section">
        <h4>Sisu ja funktsioonid, mis ei ole ligipääsetavad</h4>
        <p>Allpool loetletud sisu ja funktsioonid on mittevastavuses õigusnormidega.</p>
        <h3>Hääldusabiline</h3>
        <ul>
          <li>Lausete ümberjärjestamine on võimalik ainult lohistamisega — klaviatuurialternatiiv puudub.
            <ul><li>Puudujäägi tõttu on mittevastavad standardi EN 301 549 ligipääsetavusnõuded 9.2.1.1 Keyboard, 9.2.5.1 Pointer gestures</li></ul></li>
          <li>Mõne interaktiivse elemendi puuteala ei vasta 44×44 piksli miinimumnõudele.
            <ul><li>Puudujäägi tõttu on mittevastav standardi EN 301 549 ligipääsetavusnõue 9.2.5.5 Target Size</li></ul></li>
        </ul>
      </div>
    </div>
  );
}

function AccessibilityFooter() {
  return (
    <div className="content-page__footer-band">
      <div className="content-page__body">
        <div className="content-page__section">
          <h4>Tagasiside</h4>
          <p>Me püüame pidevalt parandada käesoleva veebilehe ligipääsetavust. Kui te soovite anda tagasisidet ligipääsetavuse kohta või on midagi vajalikku jäänud teie jaoks ligipääsmatuks, siis palun võtke meiega ühendust allpool olevate kontaktide kaudu.</p>
          <p>E-post: <a href="mailto:kasutajatugi@ekilex.ee">kasutajatugi@ekilex.ee</a></p>
          <p>Telefon: <a href="tel:+3726177500">617 7500</a></p>
          <p>Vastame teile esimesel võimalusel, kuid mitte hiljem kui kolme tööpäeva jooksul.</p>
        </div>
        <div className="content-page__section">
          <h4>Järelevalveasutus</h4>
          <p>Avaliku sektori veebide ja rakenduste ligipääsetavuse osas teostab järelevalvet Tarbijakaitse ja Tehnilise Järelevalve Amet.</p>
          <p>Veebileht: <a href="https://www.ttja.ee" target="_blank" rel="noopener noreferrer">www.ttja.ee</a></p>
          <p>E-post: <a href="mailto:info@ttja.ee">info@ttja.ee</a></p>
          <p>Telefon: <a href="tel:+3726672000">667 2000</a></p>
        </div>
        <div className="content-page__section">
          <h4>Teatise koostamine</h4>
          <p>Käesolev ligipääsetavuse teatis on koostatud 12.02.2026.</p>
          <p>Teatist on uuendatud 12.02.2026 vastavalt tehtud paranduste tulemustele.</p>
        </div>
      </div>
    </div>
  );
}

export default function AccessibilityPage() {
  return (
    <div className="content-page">
      <div className="content-page__banner"><h1 className="content-page__banner-title">Ligipääsetavuse teatis</h1></div>
      <AccessibilityBody />
      <AccessibilityFooter />
    </div>
  );
}
