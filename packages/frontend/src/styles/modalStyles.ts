import { colors, borderRadius, gap } from './colors';

export const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
} as const;

export const modalContentStyle = {
  background: colors.white,
  padding: '2rem',
  borderRadius: borderRadius.large,
} as const;

export const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: gap.lg,
} as const;

export const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: colors.gray,
} as const;
