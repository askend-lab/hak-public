import {
  generateAudioHash,
  normalizeText,
  selectVoiceModel,
  countWords,
  createTaskEntry,
  createSynthesisEntry,
  generateUUID,
  nowISO,
} from './utils';

import type { SynthesisEntry } from './schemas';

describe('normalizeText', () => {
  it('trims whitespace', () => {
    expect(normalizeText('  hello  ')).toBe('hello');
  });

  it('converts to lowercase', () => {
    expect(normalizeText('HELLO World')).toBe('hello world');
  });

  it('collapses multiple spaces', () => {
    expect(normalizeText('hello   world')).toBe('hello world');
  });

  it('preserves Estonian characters', () => {
    expect(normalizeText('Tere päevast')).toBe('tere päevast');
  });

  it('preserves phonetic markers', () => {
    expect(normalizeText("te`re pä'evast")).toBe("te`re pä'evast");
  });

  it('removes special characters except phonetic markers', () => {
    expect(normalizeText('hello! world?')).toBe('hello world');
  });
});

describe('countWords', () => {
  it('counts single word', () => {
    expect(countWords('hello')).toBe(1);
  });

  it('counts multiple words', () => {
    expect(countWords('hello world')).toBe(2);
  });

  it('handles extra whitespace', () => {
    expect(countWords('  hello   world  ')).toBe(2);
  });

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace only', () => {
    expect(countWords('   ')).toBe(0);
  });
});

describe('selectVoiceModel', () => {
  it('returns efm_s for 1 word', () => {
    expect(selectVoiceModel(1)).toBe('efm_s');
  });

  it('returns efm_s for 3 words', () => {
    expect(selectVoiceModel(3)).toBe('efm_s');
  });

  it('returns efm_l for 4 words', () => {
    expect(selectVoiceModel(4)).toBe('efm_l');
  });

  it('returns efm_l for many words', () => {
    expect(selectVoiceModel(10)).toBe('efm_l');
  });
});

describe('generateAudioHash', () => {
  it('generates consistent hash for same input', async () => {
    const hash1 = await generateAudioHash('hello', 'efm_s');
    const hash2 = await generateAudioHash('hello', 'efm_s');
    expect(hash1).toBe(hash2);
  });

  it('generates different hash for different text', async () => {
    const hash1 = await generateAudioHash('hello', 'efm_s');
    const hash2 = await generateAudioHash('world', 'efm_s');
    expect(hash1).not.toBe(hash2);
  });

  it('generates different hash for different voice model', async () => {
    const hash1 = await generateAudioHash('hello', 'efm_s');
    const hash2 = await generateAudioHash('hello', 'efm_l');
    expect(hash1).not.toBe(hash2);
  });

  it('normalizes text before hashing', async () => {
    const hash1 = await generateAudioHash('Hello', 'efm_s');
    const hash2 = await generateAudioHash('hello', 'efm_s');
    expect(hash1).toBe(hash2);
  });
});

describe('generateUUID', () => {
  it('generates valid UUID format', () => {
    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid).toMatch(uuidRegex);
  });

  it('generates unique UUIDs', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });

  it.skip('uses fallback when crypto.randomUUID is not available', () => {
    // Skipped: jsdom crypto is read-only
    const originalCrypto = global.crypto;
    // @ts-expect-error - testing fallback
    global.crypto = { randomUUID: undefined };
    
    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid).toMatch(uuidRegex);
    
    global.crypto = originalCrypto;
  });
});

describe('createTaskEntry', () => {
  const mockSynthesis: SynthesisEntry = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    originalText: 'Tere',
    phoneticText: 'te`re',
    audioHash: 'abc123',
    voiceModel: 'efm_s',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  it('creates task entry with synthesis', () => {
    const entry = createTaskEntry(mockSynthesis, 0);
    expect(entry.synthesis).toBe(mockSynthesis);
  });

  it('sets correct order', () => {
    const entry = createTaskEntry(mockSynthesis, 5);
    expect(entry.order).toBe(5);
  });

  it('generates unique id', () => {
    const entry1 = createTaskEntry(mockSynthesis, 0);
    const entry2 = createTaskEntry(mockSynthesis, 1);
    expect(entry1.id).not.toBe(entry2.id);
  });

  it('sets addedAt timestamp', () => {
    const before = new Date().toISOString();
    const entry = createTaskEntry(mockSynthesis, 0);
    const after = new Date().toISOString();
    expect(entry.addedAt >= before).toBe(true);
    expect(entry.addedAt <= after).toBe(true);
  });
});

describe('createSynthesisEntry', () => {
  it('creates synthesis entry with all fields', () => {
    const input = {
      originalText: 'Tere',
      phoneticText: 'te`re',
      audioHash: 'abc123',
      voiceModel: 'efm_s' as const,
    };
    const entry = createSynthesisEntry(input);
    expect(entry.originalText).toBe(input.originalText);
    expect(entry.phoneticText).toBe(input.phoneticText);
    expect(entry.audioHash).toBe(input.audioHash);
    expect(entry.voiceModel).toBe(input.voiceModel);
  });

  it('generates unique id', () => {
    const input = {
      originalText: 'Tere',
      phoneticText: 'te`re',
      audioHash: 'abc123',
      voiceModel: 'efm_s' as const,
    };
    const entry1 = createSynthesisEntry(input);
    const entry2 = createSynthesisEntry(input);
    expect(entry1.id).not.toBe(entry2.id);
  });

  it('sets createdAt timestamp', () => {
    const before = new Date().toISOString();
    const entry = createSynthesisEntry({
      originalText: 'Test',
      phoneticText: 'test',
      audioHash: 'hash',
      voiceModel: 'efm_l',
    });
    const after = new Date().toISOString();
    expect(entry.createdAt >= before).toBe(true);
    expect(entry.createdAt <= after).toBe(true);
  });
});

describe('nowISO', () => {
  it('returns ISO formatted date string', () => {
    const result = nowISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('returns current time', () => {
    const before = new Date().toISOString();
    const result = nowISO();
    const after = new Date().toISOString();
    expect(result >= before).toBe(true);
    expect(result <= after).toBe(true);
  });
});

