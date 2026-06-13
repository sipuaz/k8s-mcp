import { newMcpServer } from "./mcp/server.js";
import { newTransport } from "./mcp/transport.js";
import { registerPingTool } from "./mcp/tools/ping.js";
import { createLogger } from "./logging/factory.js";
import { stderrTransport } from "./logging/transport.js";
import { prettyFormatter } from "./logging/formatter.js";
import { createKubeState } from "./mcp/state/kubeState.js";
import { createKubeConfigManager } from "./k8s/kubeConfig.js";
import { registerListContextsTool, registerSetContextTool } from "./mcp/tools/k8s/context.js";

const logger = createLogger({
    level: "info",
    transport: stderrTransport,
    formatter: prettyFormatter,
});
const kubeState = createKubeState();
const kubeConfigManager = createKubeConfigManager(logger, kubeState);

async function main(): Promise<void> {
    const server = newMcpServer();
    const transport = newTransport();

    registerPingTool(server);
    registerListContextsTool(server, kubeConfigManager);
    registerSetContextTool(server, kubeConfigManager);

    await server.connect(transport);
}

main().catch((error: unknown) => {
    logger.error("Failed to start MCP server", { error });
    process.exitCode = 1;
});