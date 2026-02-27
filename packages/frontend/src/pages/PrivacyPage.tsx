// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

function PrivacyIntro() {
  return (
    <>
      <div className="content-page__section">
        <h2>Sissejuhatus</h2>
        <p>Käesolev privaatsuspoliitika selgitab, kuidas Hääldusabilise veebirakendus töötleb isikuandmeid ja muud teavet teenuse pakkumiseks Euroopa Liidu isikuandmete kaitse reeglite (sh GDPR) raames.</p>
        <p>Teenuse kasutamisel palume vältida tundlike isikuandmete (nt tervise, poliitiliste vaadete, religiooni jms) sisestamist tekstiväljadesse.</p>
      </div>
      <div className="content-page__section">
        <h2>Vastutav töötleja ja kontakt</h2>
        <p>Vastutav töötleja: Eesti Keele Instituut (EKI), Roosikrantsi 6, 10119 Tallinn, registrikood 70004011.</p>
        <p>Privaatsusega seotud küsimused ja andmekaitsepäringud: <a href="mailto:eki@eki.ee">eki@eki.ee</a></p>
      </div>
    </>
  );
}

function PrivacyDataProcessing() {
  return (
    <>
      <div className="content-page__section">
        <h2>Milliseid andmeid me töötleme</h2>
        <h3>Kasutajakonto ja autentimine</h3>
        <ul>
          <li>kasutaja unikaalne ID (autentimisteenuse poolt antud identifikaator / &quot;sub&quot;);</li>
          <li>e-posti aadress (konto kuvamiseks ja teenusesse sisenemiseks);</li>
          <li>autentimise tehnilised andmed (nt seansitunnused ja turvatõendid).</li>
        </ul>
        <h3>Kasutaja loodud sisu</h3>
        <ul>
          <li>ülesanded ja nende sisu (nt ülesande nimi, kirjeldus, sisestatud tekstid, rõhumärgistusega tekst, lingid heliressurssidele);</li>
          <li>tekst, mille kasutaja saadab analüüsimiseks või kõnesünteesiks.</li>
        </ul>
        <h3>Tehnilised andmed</h3>
        <ul>
          <li>tehnilised logid ja veadiagnostika (nt sündmuse aeg, veateated ja tehnilised identifikaatorid);</li>
          <li>tõrkeotsingu eesmärgil võivad mõned süsteemilogid sisaldada lühikest väljavõtet kasutaja sisestatud tekstist (kuni 50 märki).</li>
        </ul>
      </div>
      <div className="content-page__section">
        <h2>Andmete töötlemise eesmärgid ja õiguslik alus</h2>
        <ul>
          <li>teenuse osutamine (sh konto ja ülesannete haldus) — lepingu täitmine / teenuse osutamine kasutaja taotlusel;</li>
          <li>tekstianalüüs ja kõnesüntees — lepingu täitmine / teenuse osutamine;</li>
          <li>turvalisus, kuritarvituste ennetamine ja teenuse töökindluse tagamine — õigustatud huvi;</li>
          <li>veamonitooring ja tõrkeotsing — õigustatud huvi.</li>
        </ul>
      </div>
      <div className="content-page__section">
        <h2>Andmete säilitamine</h2>
        <ul>
          <li>kasutaja ülesannete andmeid säilitame teenuse osutamiseks seni, kuni kasutaja taotleb andmete kustutamist;</li>
          <li>kasutaja seadmesse salvestatud andmed (nt brauseri salvestusruum) säilivad kuni kasutaja need kustutab, brauseri andmed puhastab või teenusest välja logib;</li>
          <li>tehnilisi logisid ja veadiagnostikat säilitame piiratud aja jooksul, mis on vajalik teenuse töökindluse ja turvalisuse tagamiseks.</li>
        </ul>
      </div>
    </>
  );
}

function PrivacySharing() {
  return (
    <>
      <div className="content-page__section">
        <h2>Andmete jagamine ja volitatud töötlejad</h2>
        <p>Teenuse osutamisel kasutame usaldusväärseid teenusepakkujaid (nt pilveteenused, autentimisteenus, veamonitooring). Nendele edastame andmeid ainult ulatuses, mis on vajalik teenuse toimimiseks.</p>
        <p>Teenuse osutamisel kasutame muuhulgas järgmisi teenuseid:</p>
        <ul>
          <li>AWS (sh Cognito) — pilvetaristu ja autentimisteenus. Lisainfo: <a href="https://aws.amazon.com/privacy/" target="_blank" rel="noopener noreferrer">AWS privaatsusteade</a>.</li>
          <li>Google (valikuline sisselogimine) — kui kasutaja valib sisselogimise Google&apos;i kontoga, töötleb Google isikuandmeid vastavalt oma tingimustele. Lisainfo: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;i privaatsuspoliitika</a>.</li>
          <li>Riigi autentimisteenus TARA (RIA) (valikuline sisselogimine) — sisselogimisel TARA kaudu osutab autentimisteenust Riigi Infosüsteemi Amet. Lisainfo: <a href="https://www.ria.ee/sites/default/files/documents/2025-02/RIA-autentimisteenuste-andmekaitsetingimused-11-2-2025.pdf" target="_blank" rel="noopener noreferrer">RIA autentimisteenuste andmekaitsetingimused (PDF)</a>.</li>
          <li>Sentry — veamonitooring ja tõrkeotsing. Lisainfo: <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer">Sentry privaatsuspoliitika</a>.</li>
        </ul>
        <p>Kui mõni teenusepakkuja töötleb andmeid väljaspool EL/EMP, rakendame edastuseks asjakohaseid kaitsemeetmeid (nt standardsed lepingutingimused või muud seadusega lubatud alused).</p>
      </div>
      <div className="content-page__section">
        <h2>Jagamine (jagatud lingid)</h2>
        <p>Kui kasutaja jagab ülesannet, luuakse link (jagamistunnus), mille kaudu saab vastavat sisu vaadata ka ilma kontota. Jagatud lingi edastamisel teistele võib sisu jõuda isikuteni, kellel puudub teie otsene kontroll. Palume jagada linke vastutustundlikult.</p>
      </div>
      <div className="content-page__section">
        <h2>Kasutaja õigused</h2>
        <p>Teil on õigus taotleda juurdepääsu oma isikuandmetele, andmete parandamist, kustutamist, töötlemise piiramist, andmete ülekandmist ning esitada vastuväiteid töötlemisele. Taotluse esitamiseks kirjutage <a href="mailto:eki@eki.ee">eki@eki.ee</a>.</p>
        <p>Konto kustutamine: teenuses puudub hetkel iseteeninduslik konto kustutamise võimalus. Konto ja sellega seotud andmete kustutamise taotluse palume saata e-posti teel.</p>
      </div>
    </>
  );
}

function PrivacyFooter() {
  return (
    <div className="content-page__footer-band">
      <div className="content-page__body">
        <div className="content-page__section">
          <h2>Järelevalveasutus</h2>
          <p>Kui leiate, et teie andmekaitseõigusi on rikutud, on teil õigus esitada kaebus Andmekaitse Inspektsioonile.</p>
          <p>Veebileht: <a href="https://www.aki.ee" target="_blank" rel="noopener noreferrer">www.aki.ee</a></p>
          <p>E-post: <a href="mailto:info@aki.ee">info@aki.ee</a></p>
          <p>Aadress: Tatari 39, 10134 Tallinn</p>
        </div>
        <div className="content-page__section">
          <h2>Poliitika uuendamine</h2>
          <p>Käesolev privaatsuspoliitika on koostatud 12.02.2026.</p>
          <p>Vajadusel ajakohastame privaatsuspoliitikat vastavalt teenuse muutustele ja õigusaktidele.</p>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="content-page">
      <div className="content-page__banner"><h1 className="content-page__banner-title">Privaatsuspoliitika</h1></div>
      <div className="content-page__body">
        <PrivacyIntro />
        <PrivacyDataProcessing />
        <PrivacySharing />
      </div>
      <PrivacyFooter />
    </div>
  );
}

