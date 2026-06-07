# Task 03 — Kubernetes Client Layer

## Status
`[ ] not started`

## What this task covers

Building the authenticated API client that all resource tools will use.
A thin, reusable layer between the MCP tools and the Kubernetes API.

---

## Context for the agent

The developer has deep Kubernetes and devops experience. No need to explain
API concepts, resource models, or RBAC. Focus on clean TypeScript patterns
for wrapping the k8s client — error handling, namespace scoping, and
making the layer easy to extend with new resource types.

---

## What the developer needs to understand before writing code

- How `@kubernetes/client-node` exposes different API groups
  (CoreV1Api, AppsV1Api, NetworkingV1Api, etc.)
- How to instantiate each API client from a scoped KubeConfig
- The right error handling pattern for k8s API responses
  (HTTP status codes, not exceptions, are the primary signal)
- How to design the client layer so adding a new resource type
  in Task 04 requires minimal boilerplate

---

## Step-by-step action list

1. Create a `KubernetesClient` class that accepts a `KubeConfig` instance
2. Instantiate the required API group clients as private members:
   `CoreV1Api`, `AppsV1Api`, `NetworkingV1Api`, `StorageV1Api`
3. Write a shared error handler that normalizes k8s API errors
   into a consistent structure the MCP tools can return
4. Write a namespace resolver: accepts an optional namespace param,
   defaults to `all namespaces` if not provided
5. Expose a factory function that the context selection layer calls
   to produce a scoped `KubernetesClient` for the selected context

---

## Acceptance criteria

- [ ] Client instantiates correctly from a named context
- [ ] API errors return a consistent, human-readable error structure
- [ ] Namespace scoping works correctly (single ns vs. all ns)
- [ ] Adding a new API group requires changing only one place

---

## Delegation note

This task is agent-assisted. The developer has the domain knowledge;
the agent can generate the boilerplate. Developer reviews for correctness
and maintainability before moving on.