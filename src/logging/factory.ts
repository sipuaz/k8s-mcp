import type { LogLevel, LogRecord, Logger, Transport, Formatter } from './type.js';

interface LoggerOptions {
  level: LogLevel;
  transport: Transport;
  formatter: Formatter;
  baseContext?: Record<string, unknown>;
}

function createLogger(options: LoggerOptions): Logger {
  const rank: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

  function make(boundContext: Record<string, unknown>): Logger {
    function log(level: LogLevel, message: string, fields?: Record<string, unknown>) {
      if (rank[level] < rank[options.level]) return;
      const record: LogRecord = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...options.baseContext,
        ...boundContext,
        ...fields,
      };
      options.transport.write(options.formatter.format(record));
    }

    return {
      debug: (msg, f) => log('debug', msg, f),
      info:  (msg, f) => log('info',  msg, f),
      warn:  (msg, f) => log('warn',  msg, f),
      error: (msg, f) => log('error', msg, f),
      child: (ctx)    => make({ ...boundContext, ...ctx }),
    };
  }

  // root logger has no bound context
  return make({});
}

export { createLogger };