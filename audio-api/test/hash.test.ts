import { calculateHash } from '../src/hash';

describe('Hash Calculation', () => {
  it('should calculate SHA-256 hash for simple text input', () => {
    const text = 'tere';
    const hash = calculateHash(text);
    
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('should return consistent results for same input', () => {
    const text = 'tere';
    const hash1 = calculateHash(text);
    const hash2 = calculateHash(text);
    
    expect(hash1).toBe(hash2);
  });

  it('should throw error on empty input', () => {
    expect(() => calculateHash('')).toThrow(/Text cannot be empty/);
  });
});
