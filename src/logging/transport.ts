import type { Transport } from './type.js';

const stderrTransport: Transport = {
  write: (line) => process.stderr.write(line + '\n'),
  flush: () => Promise.resolve(),
};

const stdoutTransport: Transport = {
  write: (line) => process.stdout.write(line + '\n'),
  flush: () => Promise.resolve(),
};

// for tests
function memoryTransport(): Transport & { lines: string[] } {
  const lines: string[] = [];
  return {
    lines,
    write: (line) => { lines.push(line); },
    flush: () => Promise.resolve(),
  };
}

export { stderrTransport, stdoutTransport, memoryTransport };