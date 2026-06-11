type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogRecord {
  level: LogLevel;
  message: string;
  timestamp: string; // ISO string, not Date — serialization-ready
  [key: string]: unknown;
}


interface Formatter {
  format(record: LogRecord): string;
}

interface Transport {
  write(line: string): void;
  flush(): Promise<void>;
}

interface Logger {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
  child(context: Record<string, unknown>): Logger;
}

export type { LogLevel, LogRecord, Logger, Transport, Formatter };