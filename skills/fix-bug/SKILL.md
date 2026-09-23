---
name: fix-bug
description: Route an existing bug report or failing behavior straight into the agent-swarm's detect/trace/fix pipeline, skipping the planning stages since the feature already exists. Use when the user describes something that's broken rather than something new to build, e.g. "/fullstack-agent-swarm:fix-bug <description>".
---

Fix an existing bug using the swarm's detect/trace/fix agents, without going through full feature
planning.

1. If `args` doesn't include enough to reproduce or locate the problem (what's broken, how to
   trigger it, what was expected instead), ask the user for that first.
2. Decide the entry point based on the symptom:
   - If there's a clear error message, stack trace, failing build/test, or console error: call
     `Agent` with `subagent_type: "error-watcher"` to classify it precisely before it's fixed.
   - If behavior is simply wrong with no error thrown (wrong data shown, a value silently missing,
     an action that "does nothing"): call `Agent` with `subagent_type: "dataflow-tracker"` to trace
     the actual data path first.
3. Pass the bug description, repro steps, and any error text the user gave you as the handoff
   packet's `prompt`.
4. Let the chain (`error-watcher`/`dataflow-tracker` -> `error-corrector` -> `qa-tester`) finish on
   its own — `error-corrector` fixes at the root cause and adds a regression guard, `qa-tester`
   confirms it. Don't patch the symptom yourself in this skill.
5. Relay the final fix summary (root cause, what changed, what was verified) back to the user.
