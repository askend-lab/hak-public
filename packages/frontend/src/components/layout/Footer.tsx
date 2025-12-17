import { useTranslation } from 'react-i18next'
import { colors } from '../../styles/colors'

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
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: colors.primary,
              color: colors.white,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.625rem',
            }}>
              HAK
            </div>
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
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: colors.primary,
            margin: '0 0 1rem 0',
          }}>
            {t('header.title2')}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="#" style={{ fontSize: '0.8125rem', color: colors.textSecondary, textDecoration: 'none' }}>
                Portaaliest
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="#" style={{ fontSize: '0.8125rem', color: colors.textSecondary, textDecoration: 'none' }}>
                Versiooniajalugu
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="#" style={{ fontSize: '0.8125rem', color: colors.textSecondary, textDecoration: 'none' }}>
                Kasutus- ja privaatsustingimused
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: colors.primary,
            margin: '0 0 1rem 0',
          }}>
            Sotsiaalmeedia
          </h3>
          <p style={{
            fontSize: '0.8125rem',
            color: colors.textSecondary,
            margin: '0 0 1rem 0',
          }}>
            Hoia pilk peal.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.facebook.com/eestikeeleinstituut" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: colors.textSecondary, textDecoration: 'none' }}>
                <span style={{ width: '20px', height: '20px', backgroundColor: colors.primary, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, fontSize: '0.625rem' }}>f</span>
                Facebook
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.youtube.com/@EestiKeeleInstituut" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: colors.textSecondary, textDecoration: 'none' }}>
                <span style={{ width: '20px', height: '20px', backgroundColor: colors.primary, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, fontSize: '0.625rem' }}>▶</span>
                Youtube
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.linkedin.com/company/eesti-keele-instituut" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: colors.textSecondary, textDecoration: 'none' }}>
                <span style={{ width: '20px', height: '20px', backgroundColor: colors.primary, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, fontSize: '0.625rem' }}>in</span>
                LinkedIn
              </a>
            </li>
          </ul>
        </div>

        {/* Feedback */}
        <div>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: colors.primary,
            margin: '0 0 1rem 0',
          }}>
            Tagasiside
          </h3>
          <p style={{
            fontSize: '0.8125rem',
            color: colors.textSecondary,
            margin: '0 0 1rem 0',
            lineHeight: 1.5,
          }}>
            Iga arvamus loeb ja aitab Hääldusabilist paremaks teha!
          </p>
          <button style={{
            padding: '0.625rem 1.25rem',
            backgroundColor: colors.primary,
            color: colors.white,
            border: 'none',
            borderRadius: '20px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            Kirjuta meile
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
