---
name: create-agent
description: Add a new specialist agent to the ai-agent-builder roster when an existing agent genuinely doesn't cover a needed capability (e.g. a security-review agent, a deployment agent, a docs-writer agent). Use when the user asks to extend or add to the agent swarm itself, e.g. "/ai-agent-builder:create-agent <what it should do>".
---

Add a new agent to the swarm using `agent-factory`, this plugin's meta-agent for agent creation.

1. If `args` doesn't clearly state what the new agent's job would be, ask the user to describe it
   in one or two sentences before proceeding.
2. Call `Agent` with `subagent_type: "agent-factory"`, passing the requested capability as the
   `prompt`, along with a reminder to check the existing roster first and refuse to create a
   duplicate/overlapping agent.
3. `agent-factory` will decide whether a new agent is actually warranted, and if so write the new
   `agents/<name>.md` file and note the routing update needed in `routing-coordinator`.
4. Relay its outcome to the user: either the new agent's name and responsibility, or the reasoning
   for why an existing agent already covers it. Remind them a session restart (or plugin reload) is
   needed before the new agent is selectable.
