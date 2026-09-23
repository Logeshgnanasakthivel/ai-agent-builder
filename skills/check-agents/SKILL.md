---
name: check-agents
description: Diagnose and repair the agent swarm itself — a malformed agent definition, a routing loop, a wrongly-scoped tool list — as opposed to a bug in the user's actual product. Use when the swarm is misbehaving (wrong agent invoked, agents looping, a handoff missing context), e.g. "/ai-agent-builder:check-agents <what went wrong>".
---

Diagnose and fix a problem in the agent swarm's own definitions or routing, using `agent-doctor`.

1. Gather what's actually observed: which agent(s) were involved, what was expected to happen, what
   happened instead (wrong agent picked, a loop, missing context, an outright error loading a
   definition).
2. Call `Agent` with `subagent_type: "agent-doctor"`, passing that description as the `prompt`.
3. Let `agent-doctor` read the relevant `agents/*.md` files, diagnose whether the issue is in
   frontmatter, process instructions, or routing, and fix the definition directly.
4. Relay its diagnosis and fix back to the user, and mention if a session restart (or plugin
   reload) is needed for the fix to take effect.

Do not use this skill for a bug in the thing the swarm built — that goes through `fix-bug` instead.
