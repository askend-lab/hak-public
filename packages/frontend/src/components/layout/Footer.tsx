import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { colors, layout, gap, lineHeight } from '../../styles/colors'
import { Button, SocialLink, FooterLink, SectionHeading, LogoWithText } from '../ui'
import { FeedbackModal } from './FeedbackModal'

const footerStyle = { background: colors.white, borderTop: `1px solid ${colors.outlinedNeutral}`, padding: '2.5rem 0' } as const;
const containerStyle = { maxWidth: layout.maxWidthWide, margin: '0 auto', padding: '0 1rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: gap.xxl } as const;
const contactStyle = { fontSize: '0.75rem', color: colors.textSecondary, lineHeight: lineHeight.relaxed, margin: 0 } as const;
const descStyle = { fontSize: '0.8125rem', color: colors.textSecondary, margin: '0 0 1rem 0' } as const;
const listStyle = { listStyle: 'none', padding: 0, margin: 0 } as const;

export function Footer() {
  const { t } = useTranslation()
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        {/* Logo & Contact */}
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <LogoWithText withBackground />
          </div>
          <p style={contactStyle}>
            Roosikrantsi 6, 10119 Tallinn Reg-kood: 70004011 Keelenõu 631 3731 Üldkontakt 617 7500 eki@eki.ee
          </p>
        </div>

        {/* Hääldusabiline Links */}
        <div>
          <SectionHeading>{t('header.title2')}</SectionHeading>
          <ul style={listStyle}>
            <FooterLink href="#">Portaaliest</FooterLink>
            <FooterLink href="#">Versiooniajalugu</FooterLink>
            <FooterLink href="#">Kasutus- ja privaatsustingimused</FooterLink>
          </ul>
        </div>
        <div>
          <SectionHeading>Sotsiaalmeedia</SectionHeading>
          <p style={descStyle}>Hoia pilk peal.</p>
          <ul style={listStyle}>
            <SocialLink href="https://www.facebook.com/eestikeeleinstituut" icon="f" label="Facebook" />
            <SocialLink href="https://www.youtube.com/@EestiKeeleInstituut" icon="▶" label="Youtube" />
            <SocialLink href="https://www.linkedin.com/company/eesti-keele-instituut" icon="in" label="LinkedIn" />
          </ul>
        </div>
        <div>
          <SectionHeading>Tagasiside</SectionHeading>
          <p style={{ ...descStyle, lineHeight: lineHeight.normal }}>Iga arvamus loeb ja aitab Hääldusabilist paremaks teha!</p>
          <Button variant="primary" size="small" onClick={() => { setShowFeedback(true); }}>Kirjuta meile</Button>
        </div>
      </div>
      {showFeedback && <FeedbackModal onClose={() => { setShowFeedback(false); }} />}
    </footer>
  )
}
