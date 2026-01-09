import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, SocialLink, FooterLink, SectionHeading, LogoWithText } from '../ui'
import { FeedbackModal } from './FeedbackModal'

export function Footer() {
  const { t } = useTranslation()
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <footer className="footer">
      <div className="footer__container">
        <div>
          <div className="footer__logo-section">
            <LogoWithText />
          </div>
          <p className="footer__contact">
            Roosikrantsi 6, 10119 Tallinn Reg-kood:<br />
            70004011 Keelenõu 631 3731 Üldkontakt 617<br />
            7500 eki@eki.ee
          </p>
        </div>

        <div>
          <SectionHeading>{t('footer.links.title')}</SectionHeading>
          <ul className="footer__list">
            <FooterLink href="#">Portaaliest</FooterLink>
            <FooterLink href="#">Versiooniajalugu</FooterLink>
            <FooterLink href="#">Kasutus- ja privaatsustingimused</FooterLink>
          </ul>
        </div>
        <div>
          <SectionHeading>Sotsiaalmeedia</SectionHeading>
          <p className="footer__desc">Hoia pilk peal.</p>
          <ul className="footer__list">
            <SocialLink href="https://www.facebook.com/eestikeeleinstituut" icon="f" label="Facebook" />
            <SocialLink href="https://www.youtube.com/@EestiKeeleInstituut" icon="▶" label="Youtube" />
            <SocialLink href="https://www.linkedin.com/company/eesti-keele-instituut" icon="in" label="LinkedIn" />
          </ul>
        </div>
        <div>
          <SectionHeading>Tagasiside</SectionHeading>
          <p className="footer__desc footer__desc--feedback">Iga arvamus loeb ja aitab Hääldusabilist paremaks teha!</p>
          <Button variant="primary" size="small" onClick={() => { setShowFeedback(true); }}>Kirjuta meile</Button>
        </div>
      </div>
      {showFeedback && <FeedbackModal onClose={() => { setShowFeedback(false); }} />}
    </footer>
  )
}
