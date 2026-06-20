import assert from 'node:assert/strict';
import test from 'node:test';

import { convertK8sErrorToHttpResponse, toSuccessResponse } from '../dist/k8s/http.js';

test('convertK8sErrorToHttpResponse maps Kubernetes status fields', () => {
  const error = {
    response: { status: 404 },
    body: {
      reason: 'NotFound',
      message: 'pods "api-7d8f9c" not found',
    },
  };

  const normalized = convertK8sErrorToHttpResponse(error);

  assert.equal(normalized.ok, false);
  assert.equal(normalized.statusCode, 404);
  assert.equal(normalized.code, 'NotFound');
  assert.equal(normalized.message, 'pods "api-7d8f9c" not found');
});

test('convertK8sErrorToHttpResponse provides stable fallbacks for unknown errors', () => {
  const normalized = convertK8sErrorToHttpResponse(new Error('boom'));

  assert.equal(normalized.ok, false);
  assert.equal(normalized.statusCode, 500);
  assert.equal(normalized.code, 'UnknownError');
  assert.equal(normalized.message, 'boom');
});

test('toSuccessResponse returns a consistent success envelope', () => {
  const payload = { pods: 3 };
  const result = toSuccessResponse(payload, 206, 'PartialContent', 'Partial data');

  assert.equal(result.ok, true);
  assert.equal(result.statusCode, 206);
  assert.equal(result.code, 'PartialContent');
  assert.equal(result.message, 'Partial data');
  assert.deepEqual(result.data, payload);
});