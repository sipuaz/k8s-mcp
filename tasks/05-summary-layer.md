# Task 04 — Resource Tools

## Status
`[ ] not started`

## What this task covers

The MCP tools that expose Kubernetes resources to the agent. One tool
per resource category, each returning summary-first with raw data on demand.

---

## Context for the agent

The developer has deep Kubernetes expertise. No need to explain what
a deployment or ingress is. Focus on the MCP tool registration pattern
and the summary-first response convention.

---

## Tools to implement

| Tool name | Resources covered | Scope |
|-----------|------------------|-------|
| `get_workloads` | pods, deployments, statefulsets, daemonsets | namespace or all |
| `get_networking` | services, ingress, endpoints, networkpolicies | namespace or all |
| `get_config` | configmaps, HPA, secrets (redacted) | namespace or all |
| `get_cluster_health` | nodes, events, PVCs | cluster-wide |
| `get_resource_raw` | any resource by kind + name + namespace | single resource |

---

## Response format convention

Every tool except `get_resource_raw` must follow this structure:

```
{
  summary: {
    healthy: number,
    degraded: number,
    unknown: number,
    anomalies: string[]   // human-readable list of notable conditions
  },
  resources: [...]        // full resource list, included by default
}
```

`get_resource_raw` returns the full unprocessed API response.

---

## Step-by-step action list

1. Define the Zod input schema for each tool (namespace optional,
   raw flag optional)
2. Implement each tool handler calling the `KubernetesClient` from Task 03
3. Implement the summary builder as a shared utility — takes a resource
   list, returns the summary object
4. Wire anomaly detection into the summary builder (see Task 05 for detail —
   start with basic conditions: not ready, crashloopbackoff, pending > 5min)
5. Register all tools on the MCP server
6. Test each tool end-to-end against a real cluster context

---

## Acceptance criteria

- [ ] All tools return valid responses against a live cluster
- [ ] Summary counts are accurate
- [ ] Anomalies array surfaces at least: CrashLoopBackOff, ImagePullBackOff,
  Pending pods, NotReady nodes, Failed PVCs
- [ ] Secret values are never present in any response
- [ ] `get_resource_raw` returns unmodified API response

---

## Delegation note

Tool registration pattern: developer-written (MCP learning layer).
Resource fetching logic: agent-assisted (mechanical, k8s domain is known).
Summary builder: developer-written — this is where the tool's value lives.