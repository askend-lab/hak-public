// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import BuildInfo from "./BuildInfo";

const FooterLogo = () => (
  <div className="footer-section footer__logo">
    <img src="/icons/logo.svg" alt="EKI Logo" className="footer__logo-image" />
    <div className="footer__contact">
      <p>
        Roosikrantsi 6, 10119 Tallinn
        <br />
        Registrikood 70004011
        <br />
        Keelenõu 631 3731
        <br />
        Üldkontakt 617 7500
        <br />
        E-post eki@eki.ee
      </p>
    </div>
  </div>
);
const FooterLinks = () => (
  <div className="footer-section">
    <h2 className="footer__heading">Hääldusabiline</h2>
    <ul className="footer__links">
      <li>
        <a href="/privacy">Kasutus- ja privaatsustingimused</a>
      </li>
      <li>
        <a href="/accessibility">Ligipääsetavuse teatis</a>
      </li>
      <li>
        <a
          href="https://sonaveeb.ee/pronunciation-exercises/#/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tutvu ka Eesti Keele Instituudi Hääldusharjutustega
        </a>
      </li>
    </ul>
  </div>
);
const SocialLinks = () => (
  <div className="footer-section">
    <h2 className="footer__heading">Sotsiaalmeedia</h2>
    <p className="footer__description">Hoia pilk peal.</p>
    <ul className="footer__social">
      <li>
        <a
          href="https://www.facebook.com/eestikeeleinstituut"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook (avaneb uues aknas)"
        >
          <img src="/icons/facebook.svg" alt="" className="footer__social-icon" />
          <span className="footer__social-label">Facebook</span>
        </a>
      </li>
      <li>
        <a
          href="https://www.youtube.com/@EestiKeeleInstituut"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Youtube (avaneb uues aknas)"
        >
          <img src="/icons/youtube.svg" alt="" className="footer__social-icon" />
          <span className="footer__social-label">Youtube</span>
        </a>
      </li>
      <li>
        <a
          href="https://www.linkedin.com/company/eesti-keele-instituut"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn (avaneb uues aknas)"
        >
          <img src="/icons/linkedin.svg" alt="" className="footer__social-icon" />
          <span className="footer__social-label">LinkedIn</span>
        </a>
      </li>
    </ul>
  </div>
);
const FeedbackSection = () => (
  <div className="footer-section">
    <h2 className="footer__heading">Tagasiside</h2>
    <div className="footer__feedback-content">
      <p className="footer__description">
        Iga arvamus loeb ja aitab Hääldusabilist paremaks teha! Saada meile oma
        mõtted ja ettepanekud.
      </p>
      <a href="mailto:eki@eki.ee" className="footer__feedback-link">
        <svg
          className="footer__feedback-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
        <span>eki@eki.ee</span>
      </a>
    </div>
  </div>
);

const FooterSponsors = () => (
  <div className="footer-sponsors">
    <div className="footer-sponsors__content">
      <img
        src="/icons/kaasrahastamine_logo.jpeg"
        alt="Kaasrahastanud Euroopa Liit"
        className="footer-sponsors__logo"
      />
      <img
        src="/icons/ks_logo.png"
        alt="Eesti tuleviku heaks"
        className="footer-sponsors__logo"
      />
      <img
        src="/icons/hjtm_logo.png"
        alt="Haridus- ja Teadusministeerium"
        className="footer-sponsors__logo"
      />
    </div>
  </div>
);

export default function Footer() {
  return (
    <>
      <div className="page-footer__content">
        <FooterLogo />
        <FooterLinks />
        <SocialLinks />
        <FeedbackSection />
        <div className="footer__build-info">
          <BuildInfo />
        </div>
      </div>
      <FooterSponsors />
    </>
  );
}
