# Task 01 — MCP Server Scaffold

## Status
`[ ] not started`

## What this task covers

Setting up the foundational MCP server: project structure, dependencies,
transport configuration, and the minimal working server that can register
tools and respond to an agent.

This is the highest learning-value task in the project. Everything else
is built on top of what you understand here.

---

## Context for the agent

The developer has no prior MCP server experience. This task must follow
the learning loop defined in AGENTS.md:

1. Explain the MCP layer in detail before any code is shown
2. Provide a step-by-step action list the developer can follow independently
3. Wait for the developer to attempt implementation
4. Review output and identify issues
5. Explain remediations — do not write the fix unless explicitly asked

Do not skip to a complete scaffold. Explain first.

---

## What the developer needs to understand before writing code

Before starting, the agent should explain:

- What MCP is and how the protocol works at a high level
- The difference between MCP **tools**, **resources**, and **prompts**
  (and why this project only needs tools)
- How stdio transport works and why it is the right choice for a local server
- What tool registration looks like — schema definition, input validation,
  handler functions
- How an agent discovers and calls tools at runtime
- The role of `@modelcontextprotocol/sdk` and what it abstracts away

---

## Step-by-step action list

The agent should produce a numbered list of concrete actions the developer
takes to implement this task. Expected steps at minimum:

1. Initialize a TypeScript project with the right `tsconfig.json` settings
2. Install `@modelcontextprotocol/sdk` and `zod` (for schema validation)
3. Create the server entry point and instantiate `McpServer`
4. Configure stdio transport with `StdioServerTransport`
5. Register a single stub tool (e.g. `ping`) to verify the setup works
6. Connect the transport and start the server
7. Test locally by running the server and sending a raw JSON-RPC message

---

## Acceptance criteria

The task is complete when:
- [ ] The server starts without errors via `npx ts-node src/index.ts`
  (or equivalent run command)
- [ ] An agent can connect to it and list available tools
- [ ] The stub `ping` tool returns a valid response
- [ ] The developer can explain what each part of the scaffold does

---

## Pitfalls to watch for during review

- `tsconfig.json` module settings: MCP SDK expects ESM; misconfigured
  module resolution is the most common first-day error
- Not calling `server.connect(transport)` — the server won't respond
- Forgetting to handle `process.stdin` / `process.stdout` correctly
  for stdio transport
- Registering tools before connecting the transport

---

## Delegation note

This task is developer-written. The agent explains and reviews.
The agent does not generate the implementation unless the developer
is blocked after a genuine attempt.