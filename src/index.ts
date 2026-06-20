import { newMcpServer } from "./mcp/server.js";
import { newTransport } from "./mcp/transport.js";
import { registerPingTool } from "./mcp/tools/ping.js";
import { createLogger } from "./logging/factory.js";
import { stderrTransport } from "./logging/transport.js";
import { prettyFormatter } from "./logging/formatter.js";
import { createKubeState } from "./mcp/state/kubeState.js";
import { createKubeConfigManager } from "./k8s/kubeConfig.js";
import { registerListContextsTool, registerSetContextTool } from "./mcp/tools/k8s/context.js";
import { createLazyK8sClientProvider } from "./k8s/clientProvider.js";

const logger = createLogger({
    level: "info",
    transport: stderrTransport,
    formatter: prettyFormatter,
});
const kubeState = createKubeState();
const kubeConfigManager = createKubeConfigManager(logger, kubeState);
const getK8sClient = createLazyK8sClientProvider({
    kubeState,
    kubeConfigManager,
    logger,
});

async function main(): Promise<void> {
    const server = newMcpServer();
    const transport = newTransport();

    registerPingTool(server);
    registerListContextsTool(server, kubeConfigManager);
    registerSetContextTool(server, kubeConfigManager);
    //TODO use this inside the tools that need to interact with k8s, instead of creating clients directly in the tools
    void getK8sClient;

    await server.connect(transport);
}

main().catch((error: unknown) => {
    logger.error("Failed to start MCP server", { error });
    process.exitCode = 1;
});