import { spawn } from 'child_process';
import { EventEmitter } from 'events';

import { initVmetajson, analyze, closeVmetajson, isInitialized } from '../src/vmetajson';

jest.mock('child_process');

const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

interface MockProcess extends EventEmitter {
  stdin: EventEmitter & { write: jest.Mock };
  stdout: EventEmitter;
  kill: jest.Mock;
}

function createMockProcess(): MockProcess {
  const stdin = Object.assign(new EventEmitter(), { write: jest.fn() });
  const stdout = new EventEmitter();
  const proc = Object.assign(new EventEmitter(), { stdin, stdout, kill: jest.fn() }) as MockProcess;
  return proc;
}

describe('vmetajson', () => {
  let mockProcess: MockProcess;

  beforeEach(() => {
    jest.clearAllMocks();
    closeVmetajson();
    mockProcess = createMockProcess();
    mockSpawn.mockReturnValue(mockProcess as any);
  });

  afterEach(() => {
    closeVmetajson();
  });

  describe('isInitialized', () => {
    it('should return false before initialization', () => {
      expect(isInitialized()).toBe(false);
    });

    it('should return true after initialization', () => {
      initVmetajson('./vmetajson', '.');
      expect(isInitialized()).toBe(true);
    });
  });

  describe('initVmetajson', () => {
    it('should spawn vmetajson process with correct arguments', () => {
      initVmetajson('./vmetajson', '/dict');

      expect(mockSpawn).toHaveBeenCalledWith(
        './vmetajson',
        ['--path=/dict'],
        { stdio: ['pipe', 'pipe', 'ignore'] }
      );
    });

    it('should not spawn multiple processes', () => {
      initVmetajson('./vmetajson', '.');
      initVmetajson('./vmetajson', '.');

      expect(mockSpawn).toHaveBeenCalledTimes(1);
    });
  });

  describe('analyze', () => {
    it('should throw if not initialized', async () => {
      await expect(analyze('test')).rejects.toThrow('vmetajson process not initialized');
    });

    it('should send JSON input to stdin', async () => {
      initVmetajson('./vmetajson', '.');

      const analyzePromise = analyze('hello');

      // Simulate response
      setTimeout(() => {
        mockProcess.stdout.emit('data', Buffer.from('{"annotations":{"tokens":[]}}\n'));
      }, 10);

      await analyzePromise;

      expect(mockProcess.stdin.write).toHaveBeenCalledWith(
        expect.stringContaining('"content":"hello"')
      );
    });

    it('should parse JSON response', async () => {
      initVmetajson('./vmetajson', '.');

      const analyzePromise = analyze('test');

      setTimeout(() => {
        const response = {
          annotations: {
            tokens: [{ features: { token: 'test', mrf: [{ stem: 't<est' }] } }]
          }
        };
        mockProcess.stdout.emit('data', Buffer.from(`${JSON.stringify(response)  }\n`));
      }, 10);

      const result = await analyzePromise;

      expect(result.annotations?.tokens).toHaveLength(1);
    });

    it('should handle process error', async () => {
      initVmetajson('./vmetajson', '.');

      const analyzePromise = analyze('test');

      setTimeout(() => {
        mockProcess.emit('error', new Error('Process crashed'));
      }, 10);

      await expect(analyzePromise).rejects.toThrow('Process crashed');
    });

    it('should handle process exit', async () => {
      initVmetajson('./vmetajson', '.');

      const analyzePromise = analyze('test');

      setTimeout(() => {
        mockProcess.emit('exit', 1);
      }, 10);

      await expect(analyzePromise).rejects.toThrow('exited with code 1');
    });

    it('should handle invalid JSON response', async () => {
      initVmetajson('./vmetajson', '.');

      const analyzePromise = analyze('test');

      setTimeout(() => {
        mockProcess.stdout.emit('data', Buffer.from('invalid json\n'));
      }, 10);

      await expect(analyzePromise).rejects.toThrow('Failed to parse');
    });

    it('should handle partial data chunks', async () => {
      initVmetajson('./vmetajson', '.');

      const analyzePromise = analyze('test');

      setTimeout(() => {
        mockProcess.stdout.emit('data', Buffer.from('{"annotati'));
        mockProcess.stdout.emit('data', Buffer.from('ons":{}}\n'));
      }, 10);

      const result = await analyzePromise;
      expect(result.annotations).toStrictEqual({});
    });
  });

  describe('closeVmetajson', () => {
    it('should kill the process', () => {
      initVmetajson('./vmetajson', '.');
      closeVmetajson();

      expect(mockProcess.kill).toHaveBeenCalled();
      expect(isInitialized()).toBe(false);
    });

    it('should handle closing when not initialized', () => {
      expect(() => { closeVmetajson(); }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty line in buffer', async () => {
      initVmetajson('./vmetajson', '.');

      const analyzePromise = analyze('test');

      setTimeout(() => {
        mockProcess.stdout.emit('data', Buffer.from('\n{"annotations":{}}\n'));
      }, 10);

      const result = await analyzePromise;
      expect(result.annotations).toStrictEqual({});
    });

    it('should use default paths', () => {
      initVmetajson();

      expect(mockSpawn).toHaveBeenCalledWith(
        './vmetajson',
        ['--path=.'],
        expect.any(Object)
      );
    });
  });
});
