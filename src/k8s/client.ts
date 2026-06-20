import { CoreV1Api, AppsV1Api, NetworkingV1Api, StorageV1Api, type Context, KubeConfig } from '@kubernetes/client-node/';
import type { Logger } from '../logging/type.js';
import { toSuccessResponse, convertK8sErrorToHttpResponse, type SuccessResult, type FailureResult } from './http.js';


/**
 * Client class that allows to access to k8s sdk underlying api clients
 */
class KubernetesClient {
    private log: Logger;

    private coreV1Api:       CoreV1Api;
    private appsV1Api:       AppsV1Api;
    private networkingV1Api: NetworkingV1Api;
    private storageV1Api:    StorageV1Api;

    /**
     * Creates a new instance of KubernetesClient for the given context.
     * @param context The Kubernetes context to use for API requests.
     * @param logger The logger instance to use for logging.
     */
    public constructor(context: Context, logger: Logger) {
        this.log = logger.child({ component: 'KubernetesClient', context: context.name });

        const kc = new KubeConfig();
        kc.loadFromDefault();
        kc.setCurrentContext(context.name);

        this.coreV1Api       = kc.makeApiClient(CoreV1Api);
        this.appsV1Api       = kc.makeApiClient(AppsV1Api);
        this.networkingV1Api = kc.makeApiClient(NetworkingV1Api);
        this.storageV1Api    = kc.makeApiClient(StorageV1Api);
    }

    public getCoreV1Api(): CoreV1Api {
        return this.coreV1Api
    }

    public getAppsV1Api(): AppsV1Api {
        return this.appsV1Api
    }

    public getNetworkingV1Api(): NetworkingV1Api {
        return this.networkingV1Api
    }

    public getStorageV1Api(): StorageV1Api {
        return this.storageV1Api
    }

    public resolveNamespace(namespace?: string): string | undefined {
        if (!namespace) {
            return undefined
        }

        const cleaned = namespace.trim()
        return cleaned.length > 0 ? cleaned : undefined
    }

    public toSuccessResponse<T>(data: T, statusCode = 200, code = 'OK', message = 'Request succeeded'): SuccessResult<T> {
        return toSuccessResponse(data, statusCode, code, message)
    }

    public toFailureResponse(error: unknown): FailureResult {
        const normalized = convertK8sErrorToHttpResponse(error)
        this.log.error('Kubernetes API request failed', {
            code: normalized.code,
            statusCode: normalized.statusCode,
            message: normalized.message,
        })
        return normalized
    }
}

export { KubernetesClient }
