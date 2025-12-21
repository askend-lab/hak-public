import {
  SynthesisEntrySchema,
  CreateTaskRequestSchema,
  apiResponseSchema,
} from './schemas';
import { z } from 'zod';

describe('SynthesisEntrySchema', () => {
  it('validates correct entry', () => {
    const valid = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      originalText: 'Tere',
      phoneticText: 'te`re',
      audioHash: 'abc123',
      voiceModel: 'efm_s',
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    expect(SynthesisEntrySchema.parse(valid)).toEqual(valid);
  });

  it('rejects invalid voiceModel', () => {
    const invalid = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      originalText: 'Tere',
      phoneticText: 'te`re',
      audioHash: 'abc123',
      voiceModel: 'invalid',
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    expect(() => SynthesisEntrySchema.parse(invalid)).toThrow();
  });
});

describe('CreateTaskRequestSchema', () => {
  it('validates correct request', () => {
    const valid = { name: 'My Task' };
    expect(CreateTaskRequestSchema.parse(valid)).toEqual(valid);
  });

  it('validates with description', () => {
    const valid = { name: 'My Task', description: 'A description' };
    expect(CreateTaskRequestSchema.parse(valid)).toEqual(valid);
  });

  it('rejects empty name', () => {
    expect(() => CreateTaskRequestSchema.parse({ name: '' })).toThrow();
  });
});

describe('apiResponseSchema', () => {
  it('creates schema for string data', () => {
    const schema = apiResponseSchema(z.string());
    const result = schema.parse({ success: true, data: 'hello' });
    expect(result.success).toBe(true);
    expect(result.data).toBe('hello');
  });

  it('validates error response', () => {
    const schema = apiResponseSchema(z.string());
    const result = schema.parse({ success: false, error: 'Something went wrong' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Something went wrong');
  });
});
