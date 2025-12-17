import './styles/main.scss';

function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header__logo">
          {/* Placeholder for Logo */}
          <div>EESTI KEELE INSTITUUT</div>
          <div>HÄÄLDUSABILINE</div>
        </div>
        <nav className="header__nav">
          <button className="button button--active">Kõnesüntees</button>
          <button className="button">Ülesanded</button>
        </nav>
        <div className="header__actions">
          <button className="button button--primary">Logi sisse</button>
          {/* Placeholder for waffle menu icon */}
          <div className="icon-placeholder"></div>
        </div>
      </header>

      <main className="main-content">
        <div className="main-header">
          <div>
            <h1 className="main-header__title">Teksti kõnesüntees</h1>
            <p>Sisesta tekst või sõna, et kuulata selle hääldust ja uurida variante</p>
          </div>
          <div className="main-header__actions">
            <button className="button button--secondary">Lisa ülesandesse (0)</button>
            <button className="button button--secondary">Mängi kõik</button>
          </div>
        </div>
        <div className="input-area">
          <div className="input-row">
            {/* Placeholder for drag handle icon */}
            <div className="input-row__icon"></div>
            <input type="text" placeholder="Kirjuta oma lause siia" className="input-row__input" />
            {/* Placeholder for play icon */}
            <div className="input-row__icon"></div>
            {/* Placeholder for kebab menu icon */}
            <div className="input-row__icon"></div>
          </div>
          <button className="button button--secondary">Lisa lause</button>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__grid">
          <div>
            {/* Placeholder for Logo */}
            <div className="footer__section-title">EESTI KEELE INSTITUUT</div>
            <div>HÄÄLDUSABILINE</div>
            <div className="footer__contact">
              <p>Roosikrantsi 6, 10119 Tallinn Reg-kood: 70004011</p>
              <p>Keelenõu 631 3731</p>
              <p>Üldkontakt 617 7500</p>
              <p>eki@eki.ee</p>
            </div>
          </div>
          <div>
            <h3 className="footer__section-title">Hääldusabiline</h3>
            <ul className="footer__list">
              <li><a href="#">Portaaliest</a></li>
              <li><a href="#">Versiooniajalugu</a></li>
              <li><a href="#">Kasutus- ja privaatsustingimused</a></li>
            </ul>
          </div>
          <div>
            <h3 className="footer__section-title">Sotsiaalmeedia</h3>
            <p>Hoia pilk peal.</p>
            <ul className="footer__list">
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Youtube</a></li>
              <li><a href="#">LinkedIn</a></li>
            </ul>
          </div>
          <div>
            <h3 className="footer__section-title">Tagasiside</h3>
            <p>Iga arvamus loeb ja aitab Hääldusabilist paremaks teha!</p>
            <button className="button button--primary">Kirjuta meile</button>
          </div>
        </div>
      </footer>
      
    </div>
  )
}

export default App
