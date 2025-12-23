import { spawn, ChildProcess } from 'child_process';

import { VmetajsonInput, VmetajsonResponse } from './types';

let process: ChildProcess | null = null;
let pendingResolve: ((value: VmetajsonResponse) => void) | null = null;
let pendingReject: ((reason: Error) => void) | null = null;
let buffer = '';

export function initVmetajson(binaryPath = './vmetajson', dictPath = '.'): void {
  if (process) {
    return;
  }

  process = spawn(binaryPath, [`--path=${dictPath}`], {
    stdio: ['pipe', 'pipe', 'ignore']
  });

  process.stdout?.on('data', (data: Buffer) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    
    while (lines.length > 1) {
      const line = lines.shift()!;
      if (line.trim() && pendingResolve) {
        try {
          const response = JSON.parse(line) as VmetajsonResponse;
          pendingResolve(response);
        } catch (e) {
          pendingReject?.(new Error(`Failed to parse vmetajson response: ${line}`));
        }
        pendingResolve = null;
        pendingReject = null;
      }
    }
    buffer = lines[0] || '';
  });

  process.on('error', (err: Error) => {
    if (pendingReject) {
      pendingReject(err);
      pendingResolve = null;
      pendingReject = null;
    }
  });

  process.on('exit', (code: number | null) => {
    if (pendingReject) {
      pendingReject(new Error(`vmetajson exited with code ${code}`));
      pendingResolve = null;
      pendingReject = null;
    }
    process = null;
  });
}

export async function analyze(text: string): Promise<VmetajsonResponse> {
  if (!process) {
    throw new Error('vmetajson process not initialized');
  }

  const input: VmetajsonInput = {
    params: {
      vmetajson: ['--stem', '--addphonetics']
    },
    content: text
  };

  return new Promise((resolve, reject) => {
    pendingResolve = resolve;
    pendingReject = reject;

    const timeout = setTimeout(() => {
      pendingResolve = null;
      pendingReject = null;
      reject(new Error('vmetajson timeout'));
    }, 5000);

    const cleanup = () => clearTimeout(timeout);
    
    const originalResolve = resolve;
    const originalReject = reject;
    
    pendingResolve = (value) => {
      cleanup();
      originalResolve(value);
    };
    
    pendingReject = (error) => {
      cleanup();
      originalReject(error);
    };

    process!.stdin?.write(`${JSON.stringify(input)  }\n`);
  });
}

export function closeVmetajson(): void {
  if (process) {
    process.kill();
    process = null;
  }
}

export function isInitialized(): boolean {
  return process !== null;
}
