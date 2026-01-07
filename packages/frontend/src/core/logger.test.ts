import { vi } from 'vitest';

import { logger } from './logger';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have debug method', () => {
    expect(typeof logger.debug).toBe('function');
  });

  it('should have info method', () => {
    expect(typeof logger.info).toBe('function');
  });

  it('should have warn method', () => {
    expect(typeof logger.warn).toBe('function');
  });

  it('should have error method', () => {
    expect(typeof logger.error).toBe('function');
  });

  it('should call console.debug for debug level', () => {
    logger.debug('Test debug message');
    expect(console.debug).toHaveBeenCalled();
  });

  it('should call console.info for info level', () => {
    logger.info('Test message');
    expect(console.info).toHaveBeenCalled();
  });

  it('should call console.warn for warn level', () => {
    logger.warn('Test warning');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should call console.error for error level', () => {
    logger.error('Test error');
    expect(console.error).toHaveBeenCalled();
  });

  it('should include timestamp in log message', () => {
    logger.info('Test message');
    const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0] as string[];
    expect(call[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should include log level in message', () => {
    logger.error('Test error');
    const call = (console.error as ReturnType<typeof vi.fn>).mock.calls[0] as string[];
    expect(call[0]).toContain('[ERROR]');
  });

  it('should pass additional arguments', () => {
    const extraData = { key: 'value' };
    logger.info('Test message', extraData);
    expect(console.info).toHaveBeenCalledWith(
      expect.any(String),
      'Test message',
      extraData
    );
  });
});
