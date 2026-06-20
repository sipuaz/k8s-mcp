import { type Context, KubeConfig } from '@kubernetes/client-node';
import { type Logger } from '../logging/type.js';
import { type KubeState } from '../mcp/state/kubeState.js';

/**
 * KubeConfigManager is an interface that defines methods for managing Kubernetes contexts in a kubeconfig file.
 */
interface KubeConfigManager {
    /**
     * Returns a list of all context names available in the kubeconfig.
     * @returns the list of context names in the kubeconfig
     */
    listContexts() : string[];
    /**
     * Validates if a context exists in the kubeconfig.
     * @param contextName the name of the context to validate
     * @throws an error if the context is not found
     */
    validateContext(contextName: string) : void;
    /**
     * Presents the context object for a given context name.
     * @param contextName the name of the context to retrieve
     * @returns the context object for the given context name, or null if not found
     */
    getContext(contextName: string) : Context | null;
    /**
     * Sets the current context in the kubeconfig.
     * @param contextName the name of the context to set as current
     */
    useContext(contextName: string) : void;
}

/**
 * Helper function to validate if a context exists in the kubeconfig, and throw an error if it does not.
 * @param kc the KubeConfig instance to check for the context
 * @param contextName  the name of the context to validate
 * @param log the logger instance to use for logging errors
 * @throws an error if the context is not found in the kubeconfig
 */
const validateContextOrThrow = (kc: KubeConfig, contextName: string, log: Logger) => {
    const context = kc.getContextObject(contextName);
    if (!context) {
        const errorMessage = `Context ${contextName} not found in kubeconfig`;
        log.error(errorMessage);
        throw new Error(errorMessage);
    }
}

/**
 * Factory function to create a KubeConfigManager instance.
 * @returns a KubeConfigManager instance that can manage Kubernetes contexts in the kubeconfig
 */
function createKubeConfigManager(logger: Logger, kubeState: KubeState): KubeConfigManager {
    const log = logger.child({ component: 'KubeConfig' });
    
    const kc = new KubeConfig();
    try {
        kc.loadFromDefault();
    } catch (error: unknown) {
        log.error("Failed to load kubeconfig", { error });
        throw new Error("Failed to load kubeconfig");
    }

    return {
        listContexts: () => kc.getContexts().map(c => c.name),
        validateContext: (contextName: string) => validateContextOrThrow(kc, contextName, log),
        getContext: (contextName: string) => kc.getContextObject(contextName),
        useContext: (contextName: string) => {
            validateContextOrThrow(kc, contextName, log);
            kc.setCurrentContext(contextName);
            kubeState.setSelectedContext(contextName);
            log.info(`Switched to context ${contextName}`);
        }
    };
}

export { createKubeConfigManager };
export type { KubeConfigManager };