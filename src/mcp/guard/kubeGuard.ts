import { type KubeState } from "../state/kubeState.js";

function ensureK8sContextGuard(kubeState: KubeState): string {
    const currentContext = kubeState.getSelectedContext();
    if (!currentContext) {
        throw new Error("No Kubernetes context is currently selected. Call set_context first.");
    }
    return currentContext;
}

export { ensureK8sContextGuard };
