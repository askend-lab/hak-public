import { extractStressedText, extractVariants } from '../src/parser';
import { VmetajsonResponse } from '../src/types';

describe('extractStressedText', () => {
  it('should return stressed text from valid response', () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: 'mees',
              mrf: [
                { stem: 'm<ees', ending: '0', pos: 'S', lemma: 'mees', fs: 'sg n' }
              ]
            }
          }
        ]
      }
    };

    const result = extractStressedText(response, 'mees');
    expect(result).toBe('m<ees');
  });

  it('should combine stem and ending with + separator', () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: 'peeti',
              mrf: [
                { stem: 'p<ee', ending: 'ti', pos: 'V', lemma: 'pidama', fs: 'impf' }
              ]
            }
          }
        ]
      }
    };

    const result = extractStressedText(response, 'peeti');
    expect(result).toBe('p<ee+ti');
  });

  it('should handle multiple tokens', () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: 'mees',
              mrf: [{ stem: 'm<ees', ending: '0' }]
            }
          },
          {
            features: {
              token: 'peeti',
              mrf: [{ stem: 'p<ee', ending: 'ti' }]
            }
          }
        ]
      }
    };

    const result = extractStressedText(response, 'mees peeti');
    expect(result).toBe('m<ees p<ee+ti');
  });

  it('should return original text if no annotations', () => {
    const response: VmetajsonResponse = {};
    const result = extractStressedText(response, 'hello');
    expect(result).toBe('hello');
  });

  it('should fallback to original token if no stem', () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: 'xyz',
              mrf: [{ pos: 'X' }]
            }
          }
        ]
      }
    };

    const result = extractStressedText(response, 'xyz');
    expect(result).toBe('xyz');
  });
});

describe('extractVariants', () => {
  it('should extract all morphological variants', () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: 'noormees',
              mrf: [
                { stem: 'n<oor_m<ees', ending: '0', pos: 'S', lemma: 'noormees', fs: 'sg n' },
                { stem: 'n<oor_m<ehe', ending: '0', pos: 'S', lemma: 'noormees', fs: 'sg g' }
              ]
            }
          }
        ]
      }
    };

    const result = extractVariants(response, 'noormees');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('n<oor_m<ees');
    expect(result[1].text).toBe('n<oor_m<ehe');
  });

  it('should include morphology info in variants', () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: 'mees',
              mrf: [
                { stem: 'm<ees', ending: '0', pos: 'S', lemma: 'mees', fs: 'sg n' }
              ]
            }
          }
        ]
      }
    };

    const result = extractVariants(response, 'mees');
    expect(result[0].morphology.lemma).toBe('mees');
    expect(result[0].morphology.pos).toBe('S');
    expect(result[0].morphology.fs).toBe('sg n');
  });

  it('should generate description with POS translation', () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: 'mees',
              mrf: [
                { stem: 'm<ees', ending: '0', pos: 'S', lemma: 'mees', fs: 'sg n' }
              ]
            }
          }
        ]
      }
    };

    const result = extractVariants(response, 'mees');
    expect(result[0].description).toContain('nimisõna');
  });

  it('should avoid duplicate variants', () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: 'test',
              mrf: [
                { stem: 't<est', ending: '0', pos: 'S', lemma: 'test', fs: 'sg n' },
                { stem: 't<est', ending: '0', pos: 'S', lemma: 'test', fs: 'sg n' }
              ]
            }
          }
        ]
      }
    };

    const result = extractVariants(response, 'test');
    expect(result).toHaveLength(1);
  });

  it('should return empty array if no tokens', () => {
    const response: VmetajsonResponse = {};
    const result = extractVariants(response, 'word');
    expect(result).toEqual([]);
  });

  it('should include lemma in description if different from word', () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: 'meest',
              mrf: [
                { stem: 'm<ees', ending: 't', pos: 'S', lemma: 'mees', fs: 'sg p' }
              ]
            }
          }
        ]
      }
    };

    const result = extractVariants(response, 'meest');
    expect(result[0].description).toContain('lemma: mees');
  });

  it('should handle token without mrf', () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: 'xyz'
            }
          }
        ]
      }
    };

    const result = extractVariants(response, 'xyz');
    expect(result).toEqual([]);
  });

  it('should handle empty mrf array', () => {
    const response: VmetajsonResponse = {
      annotations: {
        tokens: [
          {
            features: {
              token: 'test',
              mrf: []
            }
          }
        ]
      }
    };

    const result = extractStressedText(response, 'test');
    expect(result).toBe('test');
  });
});
