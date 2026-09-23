# fullstack-agent-swarm

A Claude Code plugin: a pipeline of cooperating subagents that plan, design, build, wire together,
test, and self-repair a full-stack feature end-to-end — plus meta-agents that extend and fix the
swarm itself. General-purpose, not tied to any one stack or project.

## Install

**As a friend / another user**, in Claude Code:

```
/plugin add <owner>/fullstack-agent-swarm
```

(or, without going through a marketplace: `claude --plugin-dir https://github.com/<owner>/fullstack-agent-swarm`)

Once installed, restart your Claude Code session so the new agents and skills are picked up.

## Use

Four entry points, once installed:

```
/fullstack-agent-swarm:build-feature <describe what you want built>
/fullstack-agent-swarm:fix-bug <describe what's broken>
/fullstack-agent-swarm:create-agent <describe a capability the swarm is missing>
/fullstack-agent-swarm:check-agents <describe how the swarm itself is misbehaving>
```

`build-feature` is the main one — it kicks off the full pipeline starting at `planner-engineer`.
The other three are narrower entry points for when you don't need the full plan-from-scratch flow.

You can also invoke any agent directly via Claude Code's `Agent` tool with
`subagent_type: "<agent-name>"` if you want to skip straight into the middle of the pipeline.

## The roster

| # | Agent | Job |
|---|---|---|
| 1 | `planner-engineer` | Turns a raw requirement into a staged, optimized technical plan. Entry point. |
| 2 | `requirements-analyst` | Figures out what only the human can supply (keys, credentials, constraints) and asks. |
| 3 | `routing-coordinator` | Central dispatcher — decides which specialist runs next, in what order. |
| 4 | `database-architect` | Designs schema/indexes for fast, correct search and fetch. |
| 5 | `api-architect` | Designs backend endpoints against the schema, built for scale. |
| 6 | `integration-guardian` | Owns the UI<->backend contract so either side can change without breaking the other. |
| 7 | `ui-designer` | Builds UI that matches user intent and the project's existing look/feel. |
| 8 | `dataflow-tracker` | Traces data end-to-end to catch silent mismatches/blocks that throw no error. |
| 9 | `error-watcher` | Detects and classifies errors (build/lint/test/runtime). Never fixes. |
| 10 | `error-corrector` | Root-causes and fixes errors, adds a regression guard. |
| 11 | `qa-tester` | End-to-end verification across frontend, backend, and database. |
| 12 | `agent-factory` | Writes a new agent definition when a genuine capability gap appears. |
| 13 | `agent-doctor` | Fixes the agent system itself (bad definitions, broken routing) — not product bugs. |

## How a build flows

```
user requirement
      |
      v
planner-engineer --> requirements-analyst --> routing-coordinator
                                                     |
                       +------------------------------+------------------------------+
                       v                              v                              v
             database-architect --> api-architect --> integration-guardian --> ui-designer
                       |                    |                    |                    |
                       +--------------------+---------+----------+--------------------+
                                                        v
                                                dataflow-tracker
                                                        |
                                                        v
                                                  error-watcher
                                                  (found issue?)
                                            yes --+-- no
                                             |         |
                                             v         v
                                     error-corrector   qa-tester --> done
                                             |
                                             +--> back to routing-coordinator to resume
```

`agent-factory` and `agent-doctor` sit outside this flow and are reached via their skills or
directly through `routing-coordinator` when needed.

## Handoff packet

Every agent passes this shape forward to the next one (as readable text in the `Agent` call's
`prompt`, not a strictly-parsed schema — clarity over rigidity):

```json
{
  "from": "<this agent's name>",
  "to": "<next agent's name>",
  "goal": "<one-line restatement of what the overall feature/fix is>",
  "summary": "<what this agent did or decided>",
  "artifacts": ["<file paths or resources touched/produced>"],
  "constraints": ["<budget, stack, performance, compliance constraints already known>"],
  "open_questions": ["<anything unresolved the next agent needs to account for>"],
  "blockers": ["<anything that stopped forward progress>"],
  "next_action": "<the specific, concrete thing the next agent must do>"
}
```

## Standing rules every agent follows

- **No agent invents requirements.** Unknowns (a credential, a business rule, a design preference)
  go to `requirements-analyst`, which asks the user — never guessed.
- **No agent skips verification.** `error-watcher` and `qa-tester` are not optional steps; a
  feature isn't done until both have run.
- **Fixes go to root cause.** `error-corrector` doesn't patch symptoms.
- **Destructive actions still require confirmation.** Every agent runs under Claude Code's normal
  permission system — dropping data, force-pushing, deleting migrations, etc. still needs your
  explicit confirmation. Being a subagent is not a way around that.
- **Secrets are never typed into chat or committed.** `requirements-analyst` asks *whether* you
  have a credential and *where* it'll be configured (an env var name), never for the literal value.
- **Minimal necessary tools.** Each agent is scoped to only the tools its job needs.

## Extending the swarm

Use `/fullstack-agent-swarm:create-agent` to add a new specialist, or hand-write a new
`agents/<name>.md` following the existing files' conventions and wire it into
`agents/routing-coordinator.md`'s dependency notes. If something in the swarm itself misbehaves
(wrong agent picked, a routing loop, a malformed definition), use
`/fullstack-agent-swarm:check-agents`.

## License

MIT — see [LICENSE](LICENSE).
