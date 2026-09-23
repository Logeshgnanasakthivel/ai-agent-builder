---
name: build-feature
description: Kick off the full agent-swarm pipeline (plan -> requirements -> database -> api -> ui -> integration -> verify -> test) for a new feature or app. Use this whenever the user wants to build something new with the fullstack-agent-swarm plugin, e.g. "/fullstack-agent-swarm:build-feature <description>".
---

Run the full build pipeline for the requirement given in `args`.

1. If `args` is empty or too vague to act on (no description of what to build), ask the user for a
   one-paragraph description of what they want built before doing anything else.
2. Otherwise, call the `Agent` tool with `subagent_type: "planner-engineer"`, `description` set to
   a short summary of the request, and `prompt` set to the user's requirement verbatim plus any
   constraints already known from this conversation (existing stack, target scale, budget, etc.).
3. From there, the agent chain (`planner-engineer` -> `requirements-analyst` ->
   `routing-coordinator` -> ... -> `qa-tester`) handles planning, asking the user for anything only
   they can supply, building, wiring, and verifying the feature on its own — do not try to do the
   specialists' work yourself or skip stages.
4. Relay the pipeline's final report (what was built, what was verified, anything still open) back
   to the user in plain language when it completes.
