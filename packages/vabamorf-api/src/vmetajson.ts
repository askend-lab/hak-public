import { spawn, ChildProcess } from 'child_process';

import { VmetajsonInput, VmetajsonResponse } from './types';

interface QueuedRequest {
  resolve: (value: VmetajsonResponse) => void;
  reject: (reason: Error) => void;
  input: VmetajsonInput;
  timeoutId: ReturnType<typeof setTimeout>;
}

let vmetajsonProcess: ChildProcess | null = null;
const requestQueue: QueuedRequest[] = [];
let currentRequest: QueuedRequest | null = null;
let buffer = '';

function processNextRequest(): void {
  if (currentRequest || requestQueue.length === 0 || !vmetajsonProcess?.stdin) {
    return;
  }
  
  currentRequest = requestQueue.shift()!;
  vmetajsonProcess.stdin.write(`${JSON.stringify(currentRequest.input)}\n`);
}

function completeCurrentRequest(response: VmetajsonResponse): void {
  if (currentRequest) {
    clearTimeout(currentRequest.timeoutId);
    currentRequest.resolve(response);
    currentRequest = null;
    processNextRequest();
  }
}

function failCurrentRequest(error: Error): void {
  if (currentRequest) {
    clearTimeout(currentRequest.timeoutId);
    currentRequest.reject(error);
    currentRequest = null;
    processNextRequest();
  }
}

export function initVmetajson(binaryPath = './vmetajson', dictPath = '.'): void {
  if (vmetajsonProcess) {
    return;
  }

  vmetajsonProcess = spawn(binaryPath, [`--path=${dictPath}`], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  vmetajsonProcess.stderr?.on('data', (data: Buffer) => {
    console.error('[vmetajson stderr]', data.toString());
  });

  vmetajsonProcess.stdout?.on('data', (data: Buffer) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    
    while (lines.length > 1) {
      const line = lines.shift();
      if (line !== undefined && line.trim() !== '' && currentRequest) {
        try {
          const response = JSON.parse(line) as VmetajsonResponse;
          completeCurrentRequest(response);
        } catch {
          failCurrentRequest(new Error(`Failed to parse vmetajson response: ${line ?? 'unknown'}`));
        }
      }
    }
    buffer = lines[0] || '';
  });

  vmetajsonProcess.on('error', (err: Error) => {
    failCurrentRequest(err);
  });

  vmetajsonProcess.on('exit', (code: number | null) => {
    failCurrentRequest(new Error(`vmetajson exited with code ${String(code ?? 'unknown')}`));
    vmetajsonProcess = null;
  });
}

export async function analyze(text: string): Promise<VmetajsonResponse> {
  if (!vmetajsonProcess) {
    throw new Error('vmetajson process not initialized');
  }

  const input: VmetajsonInput = {
    params: {
      vmetajson: ['--stem', '--addphonetics']
    },
    content: text
  };

  return new Promise((resolve, reject) => {
    const timeoutMs = parseInt(process.env.VMETAJSON_TIMEOUT_MS ?? '5000', 10);
    const timeoutId = setTimeout(() => {
      const index = requestQueue.findIndex(r => r.timeoutId === timeoutId);
      if (index !== -1) {
        requestQueue.splice(index, 1);
        reject(new Error('vmetajson timeout'));
      } else if (currentRequest?.timeoutId === timeoutId) {
        currentRequest = null;
        reject(new Error('vmetajson timeout'));
        processNextRequest();
      }
    }, timeoutMs);

    requestQueue.push({ resolve, reject, input, timeoutId });
    processNextRequest();
  });
}

export function closeVmetajson(): void {
  if (vmetajsonProcess) {
    vmetajsonProcess.kill();
    vmetajsonProcess = null;
  }
}

export function isInitialized(): boolean {
  return vmetajsonProcess !== null;
}
