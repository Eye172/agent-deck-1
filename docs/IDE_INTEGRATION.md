# Agent Deck for AI coding tools

A free, MIT-licensed offline skill containing all **64 architecture families and 384 application presets**. Search the catalog, compare mechanisms and read one full contract when needed. No Agent Deck account, API key, paid service or background server is required.

The skill does not supply a model, an IDE subscription or credits for a provider. It uses your coding assistant's existing capabilities. Presets are design specifications; their model performance has not been benchmarked.

## Install

1. Download agent-deck-skill.zip from the website and extract it.
2. Copy the extracted **agent-deck folder in full**, including scripts and references, to one project location below. Keep the folder name agent-deck.
3. Open the project in your coding tool. Reload skills or start a fresh session if the tool does not detect it.

| Tool | Project location | Explicit invocation |
| --- | --- | --- |
| Codex | .agents/skills/agent-deck/ | $agent-deck |
| Cursor | .agents/skills/agent-deck/ or .cursor/skills/agent-deck/ | /agent-deck |
| Claude Code | .claude/skills/agent-deck/ | /agent-deck |
| VS Code / GitHub Copilot | .agents/skills/agent-deck/ or .github/skills/agent-deck/ | /agent-deck |

Choose one supported location per tool; duplicate names in multiple discovered locations can produce duplicate entries. For a project used by Codex, Cursor and Copilot, .agents/skills is the common choice. Claude Code uses its .claude/skills location. These are manual project-folder installations; no plugin marketplace registration is required.

For a D-only Windows workspace, keep extraction and project folders on D. This package has no global installer and never changes the user's home directory or IDE settings.

Official discovery guidance checked on 9 October 2026: [Codex](https://learn.chatgpt.com/docs/build-skills), [Cursor](https://cursor.com/docs/context/skills), [Claude Code](https://code.claude.com/docs/en/skills), [VS Code / Copilot](https://code.visualstudio.com/docs/agent-customization/agent-skills). Installed-version behavior can differ. Discovery/automatic invocation has not been exercised inside all four products by this project.

## Use

For example, ask your assistant:

> Use Agent Deck to choose a retrieval architecture for my local document assistant. Compare a simple baseline with one advanced alternative, then adapt the selected contract to my existing stack.

For Codex you can explicitly mention $agent-deck; for the other tools use /agent-deck. Automatic invocation depends on the tool, model and matching task. Do not expect it to run on every coding request.

The intended workflow is **search → shortlist → read selected contract → adapt → validate**. The helper does not choose a statistically optimal architecture.

## Offline command line

Requires Node.js 20 or newer. No npm install and no dependencies.

From your project root after installing at .agents/skills/agent-deck:

~~~text
node .agents/skills/agent-deck/scripts/deck.mjs facets
node .agents/skills/agent-deck/scripts/deck.mjs search --query "retrieval" --scenario knowledge --limit 6
node .agents/skills/agent-deck/scripts/deck.mjs search --category Multi-agent --level Expert --scenario coding
node .agents/skills/agent-deck/scripts/deck.mjs compare basic-rag--knowledge graph-rag--knowledge
node .agents/skills/agent-deck/scripts/deck.mjs get graph-rag--knowledge
node .agents/skills/agent-deck/scripts/deck.mjs get graph-rag--knowledge --format markdown
~~~

Use the corresponding installed folder for other locations. The helper resolves catalog files relative to itself, so invoking it by absolute path works from any working directory. Commands write to stdout only, read the bundled catalog, and do not request a network connection or inspect the user's repository.

search supports --query, --category, --level, --scenario, --topology, --limit and --offset. facets lists valid values and counts. Search matches every query word literally and orders results by complexity and title. The six application IDs are research, coding, knowledge, data, content and support.

If Node is unavailable, ask the assistant to search references/index.json with its file tools and open references/presets/<exact-id>.json. This fallback is a compact metadata index followed by one full preset, not a request to load every blueprint.

## Contents and boundaries

SKILL.md contains the selection/adaptation workflow. scripts/deck.mjs is a read-only catalog helper. references/index.json is the compact search index; references/presets contains the 384 full canonical blueprints. references/runtime-guide.md explains implementation boundaries. references/snapshot.json identifies the bundled catalog; LICENSE is the MIT license for project-authored material.

The index and preset files are generated from the same sources as the website. The package does not copy third-party implementations or font assets. Original research authors and links remain in the selected blueprint.

Using a blueprint does not spawn workers, enforce a runtime budget or implement memory by itself. A coding assistant can map roles to its existing tools; a real agent service needs tool/model adapters, routing predicates, state, failure recovery and acceptance checks. The skill preserves the user's task scope and existing authorization.

This release is a portable skill and offline CLI, not an MCP server or an IDE extension. It works without a published website once downloaded.

## Build and update

Maintainers run node scripts/build.mjs from the Agent Deck project root. This builds the website and creates dist/agent-deck-skill.zip, its SHA-256 file and dist/ide-guide.md. The unpacked generated skill is in output/skills/agent-deck.

A download is an offline snapshot. To update, replace the installed folder with a newly built/released package after reviewing changes. There is no background updater, telemetry or network fetch.
