import type { KubeConfig } from '@kubernetes/client-node';
import type { Logger } from '../logging/type.js';
import type { KubeConfigManager } from './kubeConfig.js';
import type { KubeState } from '../mcp/state/kubeState.js';
import { ensureK8sContextGuard } from '../mcp/guard/kubeGuard.js';
import { createKubernetesClient, type KubernetesClient } from './client.js';

type CreateClientFn = (kc: KubeConfig, logger: Logger) => KubernetesClient;
type EnsureContextGuardFn = (kubeState: KubeState) => string;

type LazyClientProviderDeps = {
    kubeState: KubeState;
    kubeConfigManager: Pick<KubeConfigManager, 'useContext' | 'getKubeConfig'>;
    logger: Logger;
    createClient?: CreateClientFn;
    ensureContextGuard?: EnsureContextGuardFn;
}

function createLazyK8sClientProvider(deps: LazyClientProviderDeps): () => KubernetesClient {
    const {
        kubeState,
        kubeConfigManager,
        logger,
        createClient = createKubernetesClient,
        ensureContextGuard = ensureK8sContextGuard,
    } = deps;

    let cachedContext: string | null = null;
    let cachedClient: KubernetesClient | null = null;

    return () => {
        const selectedContext = ensureContextGuard(kubeState);

        if (cachedClient && cachedContext === selectedContext) {
            return cachedClient;
        }

        kubeConfigManager.useContext(selectedContext);
        cachedClient = createClient(kubeConfigManager.getKubeConfig(), logger);
        cachedContext = selectedContext;
        return cachedClient;
    };
}

export { createLazyK8sClientProvider };
export type { LazyClientProviderDeps };