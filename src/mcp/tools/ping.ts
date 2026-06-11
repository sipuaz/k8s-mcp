import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

function registerPingTool(server: McpServer): RegisteredTool {
    return server.registerTool(
        "ping",
        {
            description: "A simple tool that responds with 'pong' to test connectivity.",
            outputSchema: z.object({
                message: z.string(),
            }),
        },
        async () => {
            return { 
                content: [{ type: "text", text: "pong" }],
                structuredContent: { message: "pong" },
            }
        },
    );
}

export { registerPingTool };