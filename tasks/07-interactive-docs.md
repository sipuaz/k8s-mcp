# Task 07 — Documentation

## Status
`[ ] not started`

## What this task covers

README, tool reference, and Copilot configuration so any developer
can clone the repo, start the server, and connect an agent in under
five minutes.

---

## Documents to produce

| File | Contents |
|------|----------|
| `README.md` | Project overview, prerequisites, quickstart, architecture diagram |
| `docs/tools.md` | Full tool reference — name, description, input schema, example output |
| `docs/copilot-setup.md` | Step-by-step: add the MCP server to Copilot, verify connection, first session walkthrough |
| `.vscode/mcp.json` | VS Code MCP server configuration (ready to use) |

---

## Delegation note

This task is fully agent-delegatable. The developer reviews for
accuracy and completeness. The agent generates all four documents
based on the implemented codebase.

Instruct the agent: "Read the full codebase and generate documentation.
Do not invent tool names, schemas, or behaviors — derive everything
from the implementation."