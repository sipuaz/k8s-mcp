# Task 02 — Kubeconfig Parsing & Context Selection

## Status
`[ ] not started`

## What this task covers

Reading `~/.kube/config`, enumerating all available contexts, and implementing
the mandatory confirmation flow — the safety guard that ensures the agent always
asks the user which context to target before connecting to any cluster.

---

## Context for the agent

The developer has deep Kubernetes experience. No need to explain kubeconfig
format or context concepts. Focus on the TypeScript implementation using
`@kubernetes/client-node` and on wiring this into the MCP tool layer correctly.

The confirmation flow is a hard requirement (see AGENTS.md). Do not suggest
shortcuts or "just use current context" approaches.

---

## What the developer needs to understand before writing code

Before starting, the agent should explain:

- How `@kubernetes/client-node` loads and parses kubeconfig
- The difference between `loadFromDefault()` and `loadFromFile()` and
  when each is appropriate
- How to enumerate contexts programmatically from the loaded config
- How to instantiate a client scoped to a specific named context
  (not just the current-context)
- How to expose this as an MCP tool — what the tool input/output schema
  should look like

---

## Step-by-step action list

The agent should produce a numbered list of concrete actions. Expected steps:

1. Install `@kubernetes/client-node`
2. Write a `KubeConfigManager` class (or module) that:
   - Loads kubeconfig from the default path
   - Exposes a method to list all context names
   - Exposes a method to return a `KubeConfig` instance scoped to
     a specific named context
3. Register two MCP tools:
   - `list_contexts` — returns all available context names, no input required
   - `set_context` — takes a context name, validates it exists, stores it
     as the active context for subsequent tool calls
4. Implement a session-level state store for the selected context
   (subsequent tools will read from this)
5. Add a guard utility: any tool that requires a cluster connection should
   call this guard first and return a clear error if no context is selected

---

## Acceptance criteria

- [ ] `list_contexts` returns all context names from `~/.kube/config`
- [ ] `set_context` validates the input and rejects unknown context names
- [ ] Subsequent tool calls fail with a clear message if no context is set
- [ ] The developer can explain the session state design and why it works
  correctly in a single-session stdio server

---

## Pitfalls to watch for during review

- Using `getCurrentContext()` instead of explicitly scoping to the
  selected context — this bypasses the safety flow
- Not validating the context name in `set_context` — silent failures
  if the agent passes a typo
- Storing context state globally in a way that would break if the server
  ever handled concurrent sessions (not a problem now, but worth noting)
- Forgetting to handle the case where `~/.kube/config` does not exist

---

## Delegation note

This task is developer-written for the MCP wiring layer.
The Kubernetes client instantiation code can be agent-assisted given
the developer's existing k8s expertise — use judgment on where to ask
for help vs. implement directly.