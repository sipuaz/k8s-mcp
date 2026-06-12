import assert from 'node:assert/strict';
import test from 'node:test';

import { createLogger } from '../dist/logging/factory.js';
import { jsonFormatter } from '../dist/logging/formatter.js';
import { memoryTransport } from '../dist/logging/transport.js';

test('logger nests user fields and preserves reserved keys', () => {
  const transport = memoryTransport();
  const logger = createLogger({
    level: 'debug',
    transport,
    formatter: jsonFormatter,
  });

  logger.info('hello', {
    level: 'fake-level',
    message: 'fake-message',
    timestamp: 'fake-timestamp',
    requestId: 'req-123',
  });

  assert.equal(transport.lines.length, 1);
  const record = JSON.parse(transport.lines[0]);

  assert.equal(record.level, 'info');
  assert.equal(record.message, 'hello');
  assert.ok(typeof record.timestamp === 'string');
  assert.equal(record.fields.requestId, 'req-123');
  assert.equal(record.fields.level, 'fake-level');
  assert.equal(record.fields.message, 'fake-message');
  assert.equal(record.fields.timestamp, 'fake-timestamp');
});

test('logger serializes Error objects into plain JSON data', () => {
  const transport = memoryTransport();
  const logger = createLogger({
    level: 'debug',
    transport,
    formatter: jsonFormatter,
  });

  const err = new Error('boom');
  logger.error('startup failure', { error: err });

  assert.equal(transport.lines.length, 1);
  const record = JSON.parse(transport.lines[0]);

  assert.equal(record.level, 'error');
  assert.equal(record.message, 'startup failure');
  assert.equal(record.fields.error.name, 'Error');
  assert.equal(record.fields.error.message, 'boom');
  assert.ok(typeof record.fields.error.stack === 'string');
});

test('logger handles circular references without throwing', () => {
  const transport = memoryTransport();
  const logger = createLogger({
    level: 'debug',
    transport,
    formatter: jsonFormatter,
  });

  const circular = { tag: 'root' };
  circular.self = circular;

  assert.doesNotThrow(() => {
    logger.info('circular payload', { payload: circular });
  });

  assert.equal(transport.lines.length, 1);
  const record = JSON.parse(transport.lines[0]);
  assert.equal(record.fields.payload.tag, 'root');
  assert.equal(record.fields.payload.self, '[Circular]');
});
