import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { KubeConfigManager } from '../../../k8s/kubeConfig.js';

function registerListContextsTool(server: McpServer, kcManager: KubeConfigManager): RegisteredTool {
    return server.registerTool(
        "list_contexts",
        {
            description: "A tool that lists all available Kubernetes contexts.",
            outputSchema: z.object({
                contexts: z.array(z.string()),
            }),
        },
        async () => {
            const contexts = kcManager.listContexts();
            return {
                content: contexts.map(context => ({ type: "text", text: context })),
                structuredContent: { contexts },
            };
        },
    );
}

function registerSetContextTool(server: McpServer, kcManager: KubeConfigManager): RegisteredTool {
    return server.registerTool(
        "set_context",
        {
            description: "A tool that sets the current Kubernetes context.",
            inputSchema: z.object({
                contextName: z.string(),
            }),
        },
        async (input) => {
            const { contextName } = input;
            kcManager.useContext(contextName);
            return {
                content: [{ type: "text", text: `Context switched to ${contextName}` }],
                structuredContent: { contextName },
            };
        },
    );
}

export { registerListContextsTool, registerSetContextTool };