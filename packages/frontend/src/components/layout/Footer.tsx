import { useTranslation } from 'react-i18next'
import { colors } from '../../styles/colors'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '1.5rem 1rem',
      borderTop: `1px solid ${colors.outlinedNeutral}`,
      textAlign: 'center',
      fontSize: '0.75rem',
      color: colors.gray,
    }}>
      {t('footer.text')}
    </footer>
  )
}

export default Footer
