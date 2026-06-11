import { newMcpServer } from "./mcp/server.js";
import { newTransport } from "./mcp/transport.js";
import { registerPingTool } from "./mcp/tools/ping.js";
import { createLogger } from "./logging/factory.js";
import { stderrTransport } from "./logging/transport.js";
import { prettyFormatter } from "./logging/formatter.js";

const logger = createLogger({
    level: "info",
    transport: stderrTransport,
    formatter: prettyFormatter,
});

async function main(): Promise<void> {
    const server = newMcpServer();
    const transport = newTransport();

    registerPingTool(server);

    await server.connect(transport);
}

main().catch((error: unknown) => {
    logger.error("Failed to start MCP server", { error });
    process.exitCode = 1;
});