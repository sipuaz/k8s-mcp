import packageJson from '../../package.json' with { type: 'json' };
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

interface Metadata {
    name: string;
    version: string;
    description: string;
}

function loadMetadata(): Metadata {
    return {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
    };
}

function newMcpServer(): McpServer {
    return new McpServer(loadMetadata());
}

export type { Metadata };
export { newMcpServer };