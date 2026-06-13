import type { McpServer, RegisteredTool, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ZodRawShapeCompat, AnySchema } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { KubeState } from '../state/kubeState.js';
import { ensureK8sContextGuard } from './kubeGuard.js';


type Guard = () => unknown | Promise<unknown>;

/**
 * Registers a tool with the MCP server that is protected by one or more guards. 
 * Guards are functions that run before the tool's callback and can perform checks or setup.
 * If any guard throws an error, the tool's callback will not be executed.
 * @param server the MCP server instance to register the tool with
 * @param name the name of the tool
 * @param config the configuration object for the tool
 * @param guards an array of guard functions to run before the tool's callback
 * @param cb the callback function for the tool
 * @returns the registered tool instance
 */
function registerGuardedTool<OutputArgs extends ZodRawShapeCompat | AnySchema, InputArgs extends undefined | ZodRawShapeCompat | AnySchema = undefined>(
    server: McpServer,
    name: string,
    config: {
        title?: string;
        description?: string;
        inputSchema?: InputArgs;
        outputSchema?: OutputArgs;
        annotations?: ToolAnnotations;
        _meta?: Record<string, unknown>;
    },
    guards: Guard[],
    cb: ToolCallback<InputArgs>): RegisteredTool {
    const guardedCallback = (async (...callbackArgs: any[]) => {
        for (const guard of guards) {
            await guard();
        }
        return (cb as (...args: any[]) => ReturnType<ToolCallback<InputArgs>>)(...callbackArgs);
    }) as unknown as ToolCallback<InputArgs>;

    return server.registerTool(
        name,
        config,
        guardedCallback,
    );
}

/**
 * Registers a Kubernetes read-only tool that is protected by a guard ensuring a Kubernetes context is selected.
 * @param server the MCP server instance to register the tool with
 * @param name the name of the tool
 * @param config the configuration object for the tool
 * @param kubeState the Kubernetes state object
 * @param cb the callback function for the tool
 * @returns the registered tool instance
 */
function registerK8sReadOnlyTool<OutputArgs extends ZodRawShapeCompat | AnySchema, InputArgs extends undefined | ZodRawShapeCompat | AnySchema = undefined>(
    server: McpServer,
    name: string,
    config: {
        title?: string;
        description?: string;
        inputSchema?: InputArgs;
        outputSchema?: OutputArgs;
        annotations?: ToolAnnotations;
        _meta?: Record<string, unknown>;
    },
    kubeState: KubeState,
    cb: ToolCallback<InputArgs>): RegisteredTool {
    return registerGuardedTool(server, name, config, [() => ensureK8sContextGuard(kubeState)], cb);
}

export { registerGuardedTool, registerK8sReadOnlyTool };