import { colors } from './colors';

describe('colors', () => {
  it('should export primary color', () => {
    expect(colors.primary).toBe('#173148');
  });

  it('should export secondary color', () => {
    expect(colors.secondary).toBe('#D7E5F2');
  });

  it('should export all required colors', () => {
    expect(colors).toHaveProperty('primary');
    expect(colors).toHaveProperty('secondary');
    expect(colors).toHaveProperty('softPrimaryBg');
    expect(colors).toHaveProperty('surfaceBg');
    expect(colors).toHaveProperty('softNeutralBg');
    expect(colors).toHaveProperty('textSecondary');
    expect(colors).toHaveProperty('gray');
    expect(colors).toHaveProperty('outlinedNeutral');
    expect(colors).toHaveProperty('outlinedPrimary');
    expect(colors).toHaveProperty('white');
  });
});
