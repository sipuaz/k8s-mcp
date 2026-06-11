import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';

function newTransport(): Transport {
    return new StdioServerTransport();
}

export { newTransport };