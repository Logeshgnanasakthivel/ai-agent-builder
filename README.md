# ai-agent-builder

A Claude Code plugin: a pipeline of cooperating subagents that plan, design, build, wire together,
test, and self-repair a full-stack feature end-to-end — plus meta-agents that extend and fix the
swarm itself. General-purpose, not tied to any one stack or project.

Repo: https://github.com/Logeshgnanasakthivel/ai-agent-builder

## Get it

Requires [Claude Code](https://claude.com/claude-code). Pick whichever fits:

**Option A — install as a plugin (recommended, no manual cloning needed)**

Inside a Claude Code session:
```
/plugin add Logeshgnanasakthivel/ai-agent-builder
```
Restart the session, then use the slash commands below.

**Option B — clone it and point Claude Code at the folder**
```bash
git clone https://github.com/Logeshgnanasakthivel/ai-agent-builder.git
claude --plugin-dir ./ai-agent-builder
```
Good for trying it out locally or hacking on the agent definitions before publishing your own fork.

**Option C — clone it and install the agents globally (simplest, skips the plugin/skill layer)**
```bash
git clone https://github.com/Logeshgnanasakthivel/ai-agent-builder.git
# Windows (PowerShell):
Copy-Item ai-agent-builder\agents\*.md "$env:USERPROFILE\.claude\agents\" -Force
# macOS/Linux:
cp ai-agent-builder/agents/*.md ~/.claude/agents/
```
This makes all 13 agents available in **every** project you open in Claude Code, forever — no
`/plugin add`, no slash commands, just ask for an agent by name ("use the planner-engineer agent to
build X") or call it directly with `Agent({subagent_type: "planner-engineer", ...})`. You lose the
`/ai-agent-builder:*` skill shortcuts from Option A, but the agents themselves work identically.

Either way, **restart your Claude Code session** afterward — the agent roster loads at session
start, so it won't pick up new agents mid-conversation.

## Use

If you installed via Option A (the plugin), four entry points:

```
/ai-agent-builder:build-feature <describe what you want built>
/ai-agent-builder:fix-bug <describe what's broken>
/ai-agent-builder:create-agent <describe a capability the swarm is missing>
/ai-agent-builder:check-agents <describe how the swarm itself is misbehaving>
```

`build-feature` is the main one — it kicks off the full pipeline starting at `planner-engineer`.
The other three are narrower entry points for when you don't need the full plan-from-scratch flow.

If you installed via Option B or C, there are no slash commands — just invoke any agent directly
via Claude Code's `Agent` tool with `subagent_type: "<agent-name>"`, starting with
`planner-engineer` for a new feature.

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

Use `/ai-agent-builder:create-agent` to add a new specialist, or hand-write a new
`agents/<name>.md` following the existing files' conventions and wire it into
`agents/routing-coordinator.md`'s dependency notes. If something in the swarm itself misbehaves
(wrong agent picked, a routing loop, a malformed definition), use
`/ai-agent-builder:check-agents`.

## License

MIT — see [LICENSE](LICENSE).
