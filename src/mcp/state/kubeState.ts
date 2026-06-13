/**
 * Interface representing the state of the Kubernetes context selection.
 * It provides methods to set, get, and clear the selected context.
 */
interface KubeState {
    /**
     * Sets the selected Kubernetes context.
     * @param contextName  the name of the context to set as selected
     */
    setSelectedContext(contextName: string): void;

    /**
     * Gets the currently selected Kubernetes context.
     * @returns the name of the selected context, or null if no context is selected
     */
    getSelectedContext(): string | null;

    /**
     * Clears the selected Kubernetes context.
     * After calling this method, getSelectedContext() will return null.
     */
    clearSelectedContext(): void;
}

/**
 * Returns an object representing the state of the Kubernetes context selection.
 * This object provides methods to set, get, and clear the selected context.
 * @returns an object implementing the KubeState interface
 */
function createKubeState(): KubeState {
    let selectedContext: string | null = null;
    return {
        setSelectedContext(contextName: string) {
            selectedContext = contextName;
        },
        getSelectedContext() {
            return selectedContext;
        },
        clearSelectedContext() {
            selectedContext = null;
        }
    };
}

export { createKubeState };
export type { KubeState };
