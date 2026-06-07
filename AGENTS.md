# AGENTS.md — k8s-mcp Project Brief

This file is the canonical context document for any AI agent working on this project.
Read this before doing anything else. Do not generate code until you have read and
acknowledged the vision, architecture decisions, and collaboration model below.

---

## Project Vision

`k8s-mcp` is a locally-running MCP (Model Context Protocol) server that exposes
Kubernetes cluster state as structured, agent-consumable context.

The goal is to let agents like GitHub Copilot autonomously assess cluster state and
help debug problems — without the developer having to describe symptoms in words.
The agent connects to the cluster, looks around, and comes back with a diagnosis.

**What makes this different from just running kubectl:**
The agent drives the investigation. The developer describes a vague symptom;
the agent calls the MCP tools, inspects resources, correlates events and logs,
and surfaces a diagnosis — without the developer running a single command.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Integration model | MCP server | Native protocol for agent tool use; works with Copilot, Claude, and any MCP-compatible agent |
| Language | TypeScript | De facto standard for MCP servers; `@modelcontextprotocol/sdk` and `@kubernetes/client-node` are both mature |
| Distribution | `npx`-runnable package | Zero-install friction; developer runs one command to start the server |
| Transport | stdio | Standard for local MCP servers; no port management needed |
| Auth | Reads from `~/.kube/config` | No new credentials; respects existing kubeconfig RBAC |
| Write access | Read-only + non-mutating ops | No mutations; port-forward and log streaming are explicitly allowed |

---

## Context Selection — Safety Constraint

**This is a hard requirement, not a suggestion.**

On every session start, the MCP server MUST:
1. Read all available contexts from `~/.kube/config`
2. Present the list to the agent
3. Have the agent surface the choice to the user explicitly
4. Wait for user confirmation before connecting to any cluster

Rationale: the developer switches between multiple contexts (dev, staging, prod).
Acting on the wrong context is a silent, high-impact failure. The confirmation
step is the guard rail.

---

## Resource Scope

The server exposes tools across the full observability surface:

| Category | Resources |
|----------|-----------|
| Workloads | pods, deployments, statefulsets, daemonsets, replicasets |
| Networking | services, ingress, endpoints, networkpolicies |
| Config | configmaps, secrets (values redacted), HPA |
| Cluster health | nodes, events, PVCs, resource pressure |

**Response format convention:**
- Default: summary first — anomalies, unhealthy states, notable conditions
- On demand: raw resource data available via a separate tool call

Rationale: summaries keep agent token usage sane. Raw data is available when
the agent needs full fidelity to diagnose a specific issue.

---

## Interactive Ops (Non-Mutating)

Beyond read-only resource inspection, the server supports:
- **Log streaming** — tail logs from a pod/container
- **Port-forwarding** — forward a pod port to localhost

These are non-mutating. No create, update, patch, or delete operations are
permitted anywhere in the codebase. If you find yourself writing a write
operation, stop and flag it.

---

## Task Breakdown

Each task has a dedicated briefing document in `tasks/`. Read the relevant
file before starting work on that task.

| # | Task | File |
|---|------|------|
| 1 | MCP server scaffold | `tasks/01-mcp-scaffold.md` |
| 2 | Kubeconfig parsing & context selection | `tasks/02-kubeconfig-context.md` |
| 3 | Kubernetes client layer | `tasks/03-k8s-client.md` |
| 4 | Resource tools | `tasks/04-resource-tools.md` |
| 5 | Summary & anomaly layer | `tasks/05-summary-layer.md` |
| 6 | Interactive ops (logs + port-forward) | `tasks/06-interactive-ops.md` |
| 7 | Documentation | `tasks/07-documentation.md` |

---

## Collaboration Model

The developer is an experienced backend/devops engineer with deep Kubernetes
knowledge but limited prior exposure to MCP servers and LLM tooling.

**This has direct implications for how you should behave:**

- **On MCP/LLM concepts:** explain before generating. The developer wants to
  understand the layer before writing it. Do not skip to code.
- **On Kubernetes concepts:** no need to explain basics. Assume full familiarity
  with the k8s API, resource model, and operational concerns.
- **On code generation:** prefer scaffolding and examples over complete
  implementations. The developer writes the code; you review and remediate.
- **On errors and pitfalls:** flag them explicitly with an explanation of *why*
  something is wrong, not just what to change.

**The learning loop for each task:**
1. Agent explains the layer in detail with a step-by-step action list
2. Developer implements it independently
3. Developer asks for guidance when stuck
4. Agent reviews and identifies errors or pitfalls
5. Agent explains remediations; developer implements them (agent writes code
   only as a last resort on MCP/LLM layers)

---

## What You Should Never Do

- Generate a complete implementation without the developer attempting it first
  (for MCP/LLM layers)
- Perform any write operation against the cluster
- Skip the context selection confirmation step
- Expose secret values — always redact
- Act on ambiguous instructions without clarifying first