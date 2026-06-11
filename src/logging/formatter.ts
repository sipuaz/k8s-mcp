import type { Formatter } from './type.js';

const jsonFormatter: Formatter = {
  format: (r) => JSON.stringify(r),
};

const prettyFormatter: Formatter = {
  format: ({ level, message, timestamp, ...rest }) => {
    const meta = Object.keys(rest).length ? ' ' + JSON.stringify(rest) : '';
    return `[${timestamp}] ${level.toUpperCase()} ${message}${meta}`;
  },
};

export { jsonFormatter, prettyFormatter };