import { createLogger, logger } from './logger';

describe('logger', () => {
  const mockConsole = {
    debug: jest.spyOn(console, 'debug').mockImplementation(),
    info: jest.spyOn(console, 'info').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('createLogger', () => {
    it('logs info messages by default', () => {
      const log = createLogger();
      log.info('test message');
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] test message')
      );
    });

    it('respects minLevel - filters debug when minLevel is info', () => {
      const log = createLogger('info');
      log.debug('debug message');
      log.info('info message');
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalled();
    });

    it('logs all levels when minLevel is debug', () => {
      const log = createLogger('debug');
      log.debug('debug');
      log.info('info');
      log.warn('warn');
      log.error('error');
      expect(mockConsole.debug).toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('only logs error when minLevel is error', () => {
      const log = createLogger('error');
      log.debug('debug');
      log.info('info');
      log.warn('warn');
      log.error('error');
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('includes timestamp in log message', () => {
      const log = createLogger('info');
      log.info('test');
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      );
    });

    it('passes additional arguments to console', () => {
      const log = createLogger('info');
      const extra = { key: 'value' };
      log.info('test', extra);
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.any(String),
        extra
      );
    });
  });

  describe('default logger', () => {
    it('is exported and functional', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });
  });
});
