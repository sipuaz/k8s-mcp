import assert from 'node:assert/strict';
import test from 'node:test';

import { createLazyK8sClientProvider } from '../dist/k8s/clientProvider.js';

function createFakeLogger() {
  return {
    debug() {},
    info() {},
    warn() {},
    error() {},
    child() {
      return this;
    },
  };
}

function createFakeKubeState(initialContext = null) {
  let selectedContext = initialContext;
  return {
    setSelectedContext(name) {
      selectedContext = name;
    },
    getSelectedContext() {
      return selectedContext;
    },
    clearSelectedContext() {
      selectedContext = null;
    },
  };
}

test('lazy provider throws when no context is selected', () => {
  const kubeState = createFakeKubeState(null);
  const kubeConfigManager = {
    useContext() {},
    getKubeConfig() {
      return {};
    },
  };

  const provider = createLazyK8sClientProvider({
    kubeState,
    kubeConfigManager,
    logger: createFakeLogger(),
    createClient() {
      return { id: 'never-created' };
    },
    ensureContextGuard(state) {
      const selected = state.getSelectedContext();
      if (!selected) {
        throw new Error('No Kubernetes context is currently selected. Call set_context first.');
      }
      return selected;
    },
  });

  assert.throws(() => provider(), /No Kubernetes context is currently selected/);
});

test('lazy provider caches client for the same context', () => {
  const kubeState = createFakeKubeState('dev');
  const usedContexts = [];
  let createCount = 0;

  const provider = createLazyK8sClientProvider({
    kubeState,
    kubeConfigManager: {
      useContext(contextName) {
        usedContexts.push(contextName);
      },
      getKubeConfig() {
        return { token: 'fake-kube-config' };
      },
    },
    logger: createFakeLogger(),
    createClient() {
      createCount += 1;
      return { id: `client-${createCount}` };
    },
    ensureContextGuard(state) {
      return state.getSelectedContext();
    },
  });

  const first = provider();
  const second = provider();

  assert.strictEqual(first, second);
  assert.equal(createCount, 1);
  assert.deepEqual(usedContexts, ['dev']);
});

test('lazy provider recreates client when context changes', () => {
  const kubeState = createFakeKubeState('dev');
  const usedContexts = [];
  let createCount = 0;

  const provider = createLazyK8sClientProvider({
    kubeState,
    kubeConfigManager: {
      useContext(contextName) {
        usedContexts.push(contextName);
      },
      getKubeConfig() {
        return { token: 'fake-kube-config' };
      },
    },
    logger: createFakeLogger(),
    createClient() {
      createCount += 1;
      return { id: `client-${createCount}` };
    },
    ensureContextGuard(state) {
      return state.getSelectedContext();
    },
  });

  const first = provider();
  kubeState.setSelectedContext('prod');
  const second = provider();

  assert.notStrictEqual(first, second);
  assert.equal(createCount, 2);
  assert.deepEqual(usedContexts, ['dev', 'prod']);
});