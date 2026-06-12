import type { Formatter } from './type.js';

function toSerializable(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  return value;
}

function safeStringify(value: unknown): string {
  const seen = new WeakSet<object>();

  try {
    return JSON.stringify(value, (_key, currentValue) => {
      const serializableValue = toSerializable(currentValue);

      if (typeof serializableValue === 'object' && serializableValue !== null) {
        if (seen.has(serializableValue)) {
          return '[Circular]';
        }
        seen.add(serializableValue);
      }

      return serializableValue;
    });
  } catch {
    return JSON.stringify({
      level: 'error',
      message: 'Failed to serialize log record',
    });
  }
}

const jsonFormatter: Formatter = {
  format: (r) => safeStringify(r),
};

const prettyFormatter: Formatter = {
  format: ({ level, message, timestamp, ...rest }) => {
    const meta = Object.keys(rest).length ? ' ' + safeStringify(rest) : '';
    return `[${timestamp}] ${level.toUpperCase()} ${message}${meta}`;
  },
};

export { jsonFormatter, prettyFormatter };