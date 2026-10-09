# Pre-deployment audit — 9 October 2026

**Verdict: ready to publish as a static catalog of design specifications.** No unresolved defect was found in the checks below. This does not certify operational agent performance or a hosting provider's deployed configuration. This section records the pre-publication audit. The subsequent successful deployment and live checks are recorded in [PUBLICATION.md](PUBLICATION.md).

## Content and attribution

The catalog contains **64 editorial mechanism families, 46 wiring labels, 384 application presets and 53 references**. Each family has six task adaptations. The adaptations change inputs, tools, privacy boundaries and acceptance contracts; they are not 384 independently validated architectures. Families can overlap conceptually.

Primary pages, paper abstracts/metadata, official documentation, repository descriptions and book pages were reviewed for attribution and the core concepts described here. This was not a full-text review of every paper or book, a peer-review-status audit, or a reproduction of published experiments. Some research-tool results are cached/indexed; opening them does not establish a current direct HTTP status.

Five historical sources were added for MapReduce, reciprocal rank fusion, blackboard systems, sagas and contract net. Their original distributed-system or retrieval mechanisms are credited; the LLM applications are editorial adaptations. Original RAG, Self-RAG, Adaptive-RAG and Voyager implementations have capabilities or training requirements that a prompted workflow does not reproduce. These distinctions are documented.

AutoGen's official repository currently describes maintenance mode; its reference now reflects that. ReasonMaxxer is a separate post-training research reference. The verified implementation and associated research are credited. The current relationship of the user-supplied Arka04bro fork could not be reverified; it is retained as a supplied reference in RESEARCH.md, rather than asserted as the primary implementation.

All diagrams, interface code, CSS hardware and blueprint prose are project-authored. No ReasonMaxxer implementation or reference photograph is redistributed. The two local fonts retain their SIL OFL 1.1 notices. The source works retain their own copyright and licenses.

## Corrections made

- Assigned mechanism operations to their actual stages, including sandboxed program execution, search state, evidence fusion, scoped memory, checkpoints and compensation.
- Replaced positional stage-output guesses with phase-specific artifact contracts.
- Specified honest failed/blocked/partial results. Reaching the last diagram phase does not imply task acceptance.
- Validated customization ranges and kept step budgets consistent with model-call budgets.
- Fixed inherited-property IDs in deep links and saved state that could otherwise crash the UI.
- Added a CSP, framing/content-type/referrer/permission headers, an HTML CSP fallback and a standalone 404.
- Made production builds clean and reproducible, including removal of stale generated output.
- Removed redundant input/result captions and increased mobile context-node height to eliminate title/caption overlap.

## Verification evidence

| Check | Result and scope |
| --- | --- |
| Unit checks | 30 passed: catalog, source references, reachability, task contracts, filters, exports, runtime invariants, explanation identity, adapters, settings, invalid IDs, portable skill coverage, CLI contracts and deterministic packaging |
| Functional browser checks | 11 Chromium scenarios passed: search, facets, detail tabs, keyboard, downloads, favorites, comparison, sources, pagination, deep links, mobile and reduced motion |
| Diagram checks | 128 passed: all 64 families at 1440 and 390 px; 11 layouts and 6–12 explanatory nodes; no title/caption overlap, horizontal label overflow or page overflow |
| Cartridge layout | All 384 labels at 320, 375, 390, 768, 1024 and 1440 px; no clipping/page overflow; both self-hosted fonts loaded |
| Export integrity | Every one of 384 JSON and 384 Markdown files matches its canonical generator; collection JSON matches all presets |
| Production checks | Eight groups passed: repeat-build hash equality, stale-file removal, case-sensitive public paths/imports, HTTP/MIME/headers/path confinement, invalid links/escaping, subpath hosting, browser storage/clipboard fallback and local-only browsing |

The diagram confirmation follows the caption correction. Unit, functional browser and production checks were rerun after adding the IDE skill download. Diagram and cartridge-layout confirmations precede that additive UI section; their code was not changed.

Runtime: Windows, Node.js 24.14.0, Chromium and an existing Playwright installation. All authored files, profiles, downloads, screenshots and temporary test artifacts use D. Temporary profiles are removed.

The production artifact contains **804 files, 20,218,627 bytes**. The largest file is catalog.json: **7,010,311 bytes**, SHA-256 **a644e9e156dfb412fe7c57936ced6a9a38207f514cfdb9e12697efe0ed74b2b7**. It meets the checked Cloudflare Pages file/count limits. Metrics and concise evidence are preserved in [audit-results.json](audit-results.json).

Detailed local reports: output/predeploy-qa.json, output/browser-qa.json, output/architecture-qa.json, output/material-review.json and output/source-verification.json. These generated artifacts are ignored by Git. A direct external-URL probe could not complete because fetches failed in the environment; output/source-network-check.json is not evidence of broken source links.

## Remaining limits and publication checks

Presets require actual provider/tool/storage adapters, predicates, task validators, scheduling and budget enforcement. They are not executable agents or drop-in framework configurations. No LLM quality, accuracy, cost, latency, robustness or training experiment has been run. Search lookahead needs an appropriate environment; compensating actions can fail and cannot universally undo effects.

Viewport checks are not physical-device or Safari/Firefox tests. Local and simulated-subpath checks are not live HTTPS hosting checks. There is no backend, API credential, analytics service or model integration in this build. Local browsing generated no external network requests, script errors or CSP violations in the tested flows; this is not a general security certification.

After publication, verify the live HTTPS URL, deep links, .mjs MIME types, downloads, fonts, 404 and response headers using the checklist in [DEPLOYMENT.md](DEPLOYMENT.md). The selected repository and hosted URL are recorded in [PUBLICATION.md](PUBLICATION.md).

## IDE skill follow-up

The build now includes a free MIT offline skill ZIP (1,886,828 bytes; 392 entries). All 384 packaged JSON contracts match the canonical website blueprints. The catalog helper searches a compact index and loads selected contracts; it has no external dependencies, network access or filesystem-write operation.

The bundled skill passed the official skill-creator quick validator. Six additional unit checks cover coverage/provenance, unrelated working directories, advanced filters/comparison, honest exports, invalid/traversal IDs and deterministic ZIP creation. Three additional Chromium groups cover installation layout at 1440/768/390/320 px, real ZIP/guide downloads and keyboard disclosure. The project-subpath production check now downloads the IDE ZIP too.

An independent Python zipfile CRC/decompression check passed. The extracted package worked in a path with spaces from another working directory; CLI calls changed no package files. Reports: output/skill-qa.json and output/skill-package-verification.json.

Official project discovery paths were reviewed for Codex, Cursor, Claude Code and Copilot. Actual discovery, automatic invocation and model decisions inside those four products have not been tested. The package is not an MCP server or IDE extension; it uses an existing assistant and does not provide paid IDE subscriptions or model credits. See [IDE_INTEGRATION.md](IDE_INTEGRATION.md).
