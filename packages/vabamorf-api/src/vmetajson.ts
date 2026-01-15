/* eslint-disable max-lines-per-function */
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
      const line = lines.shift();
      // intentional null/undefined check
      if (line !== undefined && line.trim() !== '' && pendingResolve !== null) {
        try {
          const response = JSON.parse(line) as VmetajsonResponse;
          pendingResolve(response);
        } catch {
           
          pendingReject?.(new Error(`Failed to parse vmetajson response: ${line ?? 'unknown'}`));
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
      pendingReject(new Error(`vmetajson exited with code ${String(code ?? 'unknown')}`));
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

    const cleanup = (): void => { clearTimeout(timeout); };
    
    const originalResolve = resolve;
    const originalReject = reject;
    
    pendingResolve = (value): void => {
      cleanup();
      originalResolve(value);
    };
    
    pendingReject = (error): void => {
      cleanup();
      originalReject(error);
    };

    if (process?.stdin) {
      process.stdin.write(`${JSON.stringify(input)  }\n`);
    }
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
