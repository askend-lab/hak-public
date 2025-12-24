import { colors } from '../colors';

describe('colors', () => {
  it('should export the correct color values', () => {
    expect(colors.primary).toBe('#173148');
    expect(colors.secondary).toBe('#D7E5F2');
    expect(colors.softPrimaryBg).toBe('#E3EFFB');
    expect(colors.surfaceBg).toBe('#FBFCFE');
    expect(colors.softNeutralBg).toBe('#F0F4F8');
    expect(colors.textSecondary).toBe('#32383E');
    expect(colors.gray).toBe('#636B74');
    expect(colors.outlinedNeutral).toBe('#CDD7E1');
    expect(colors.outlinedPrimary).toBe('#0B6BCB');
    expect(colors.white).toBe('#FFFFFF');
  });

  it('should have all required color properties', () => {
    const expectedKeys = [
      'primary',
      'secondary', 
      'softPrimaryBg',
      'surfaceBg',
      'softNeutralBg',
      'textSecondary',
      'gray',
      'outlinedNeutral',
      'outlinedPrimary',
      'white',
    ];

    expectedKeys.forEach(key => {
      expect(colors).toHaveProperty(key);
      expect(typeof colors[key as keyof typeof colors]).toBe('string');
    });
  });
});
