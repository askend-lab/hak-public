import { useTranslation } from 'react-i18next'
import { colors } from '../../styles/colors'
import { Logo, Button, SocialLink, FooterLink, SectionHeading } from '../ui'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer style={{
      background: colors.white,
      borderTop: `1px solid ${colors.outlinedNeutral}`,
      padding: '2.5rem 0',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
        gap: '2rem',
      }}>
        {/* Logo & Contact */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1rem' }}>
            <Logo size="small" withBackground />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.primary }}>
                {t('header.title1')}
              </div>
              <div style={{ fontSize: '0.625rem', fontWeight: 500, color: colors.primary }}>
                {t('header.title2')}
              </div>
            </div>
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: colors.textSecondary,
            lineHeight: 1.6,
            margin: 0,
          }}>
            Roosikrantsi 6, 10119 Tallinn Reg-kood: 70004011 Keelenõu 631 3731 Üldkontakt 617 7500 eki@eki.ee
          </p>
        </div>

        {/* Hääldusabiline Links */}
        <div>
          <SectionHeading>{t('header.title2')}</SectionHeading>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <FooterLink href="#">Portaaliest</FooterLink>
            <FooterLink href="#">Versiooniajalugu</FooterLink>
            <FooterLink href="#">Kasutus- ja privaatsustingimused</FooterLink>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <SectionHeading>Sotsiaalmeedia</SectionHeading>
          <p style={{
            fontSize: '0.8125rem',
            color: colors.textSecondary,
            margin: '0 0 1rem 0',
          }}>
            Hoia pilk peal.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <SocialLink href="https://www.facebook.com/eestikeeleinstituut" icon="f" label="Facebook" />
            <SocialLink href="https://www.youtube.com/@EestiKeeleInstituut" icon="▶" label="Youtube" />
            <SocialLink href="https://www.linkedin.com/company/eesti-keele-instituut" icon="in" label="LinkedIn" />
          </ul>
        </div>

        {/* Feedback */}
        <div>
          <SectionHeading>Tagasiside</SectionHeading>
          <p style={{
            fontSize: '0.8125rem',
            color: colors.textSecondary,
            margin: '0 0 1rem 0',
            lineHeight: 1.5,
          }}>
            Iga arvamus loeb ja aitab Hääldusabilist paremaks teha!
          </p>
          <Button variant="primary" size="small">Kirjuta meile</Button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
