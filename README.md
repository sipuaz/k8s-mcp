# k8s-mcp
MCP Server to enable Kubernetes operations from agents

## Vision: k8s-mcp — A Kubernetes observability MCP server for AI agents
A locally-running MCP server that exposes your Kubernetes clusters as structured, agent-consumable context — so tools like GitHub Copilot can autonomously assess cluster state and help you debug without you having to describe the problem in words.

## How it works
Reads from `~/.kube/config`, enumerates all available contexts
On every session, forces an explicit context selection — the agent surfaces the list to the user and waits for confirmation before touching any cluster, eliminating the risk of acting on the wrong environment.
Once a context is selected, exposes MCP tools across the full observability surface: workloads, networking, config, cluster health.

Returns a summary by default (anomalies, unhealthy states, notable conditions) with raw resource data available as a follow-up call — keeping agent token usage sane
Supports non-mutating interactive ops (log streaming, port-forwarding) as a first-class feature, not an afterthought

## Implementation
Developed in TypeScript — it's the de facto standard for MCP servers, has a mature SDK (`@modelcontextprotocol/sdk`), and the Kubernetes JS client (`@kubernetes/client-node`) is well-maintained.

## What success for this repo looks like
You open a Copilot chat, describe a vague symptom ("something's wrong with the payments service"), the agent calls the MCP tools autonomously, assesses pods/events/logs/endpoints by itself, and comes back with a diagnosis — without you ever running a single kubectl command.