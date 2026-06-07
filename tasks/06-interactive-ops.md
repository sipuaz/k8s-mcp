# Task 06 — Interactive Ops (Log Streaming & Port-Forward)

## Status
`[ ] not started`

## What this task covers

Non-mutating interactive operations: streaming pod logs and forwarding
a pod port to localhost. These are the two ops that cross from passive
observation into active interaction with the cluster.

---

## Context for the agent

The developer has operational Kubernetes experience and understands
what log streaming and port-forwarding do at the cluster level.
The complexity here is on the MCP side: how to handle streaming
responses (logs) and long-lived connections (port-forward) within
the MCP tool model, which is request/response by default.

The agent should explain the MCP streaming pattern before the
developer attempts implementation.

---

## What the developer needs to understand before writing code

- How MCP handles streaming tool responses (if supported in the SDK version)
  vs. the fallback pattern of returning a fixed log tail
- How `@kubernetes/client-node` implements log streaming and port-forwarding
  (these use WebSocket and HTTP upgrade internally)
- Lifecycle management: how to start, surface, and eventually stop
  a port-forward from within an MCP tool handler
- Error conditions specific to these ops: pod not running, container
  not found, port already in use

---

## Tools to implement

| Tool name | Input | Output |
|-----------|-------|--------|
| `get_pod_logs` | pod, namespace, container (opt), tail lines | log text |
| `port_forward` | pod, namespace, pod port, local port | confirmation + instructions |

---

## Step-by-step action list

1. Agent explains MCP streaming vs. fixed response — developer decides
   which approach to implement based on SDK capabilities
2. Implement `get_pod_logs` using `CoreV1Api.readNamespacedPodLog`
   with `tail` parameter
3. Implement `port_forward` using `PortForward` from `@kubernetes/client-node`
4. Handle the port-forward lifecycle: start the forward, return confirmation,
   document how the user stops it (Ctrl+C or a `stop_port_forward` tool)
5. Add input validation: reject requests if no context is selected,
   if the pod is not in Running state, or if the container name is invalid

---

## Acceptance criteria

- [ ] `get_pod_logs` returns the last N lines from a running pod
- [ ] `get_pod_logs` handles multi-container pods with explicit container selection
- [ ] `port_forward` establishes a working forward and confirms the local port
- [ ] Both tools fail gracefully with clear error messages on invalid input

---

## Delegation note

MCP streaming pattern: developer-written after agent explanation.
Kubernetes client calls: agent-assisted.
Error handling: developer-written — operational edge cases require
domain judgment.