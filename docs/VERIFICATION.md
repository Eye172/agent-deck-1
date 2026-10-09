# Verification — 9 October 2026

The final pre-deployment audit is in [PREDEPLOY_AUDIT.md](PREDEPLOY_AUDIT.md). Reproducible hosting settings are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Passed

- 30 Node tests covering catalog composition, provenance, graph reachability, six task contracts, exports, filters, runtime invariants, logical actor identity, mechanism adapters, customization ranges, failure/acceptance semantics and invalid IDs.
- 11 Chromium browser scenarios covering search/facets, detail tabs and keyboard, custom downloads, favorites, comparison, reading room, pagination/deep links, static exports, mobile and reduced motion.
- 128 architecture renderings: 64 families at 1440 and 390 px, 11 layouts and 6–12 nodes. No title/caption overlap, horizontal label overflow, page overflow or JavaScript errors.
- All 384 cartridge labels at 320, 375, 390, 768, 1024 and 1440 px. No clipping/page overflow. Landing hardware remains upright and both locally hosted fonts load.
- Every one of 768 JSON/Markdown exports matches its canonical generator. Full catalog JSON contains the same 384 presets.
- Eight production-check groups covering clean reproducible builds, case-sensitive public imports, HTTP/MIME/security/path confinement, query escaping and invalid links, project-subpath hosting, storage/clipboard failure and local-only requests.

Unit, production and functional browser checks were rerun after adding the IDE section. Three additional skill UI groups check four widths, actual downloads and keyboard installation disclosure. Six new unit checks cover offline skill content, CLI behavior and packaging. The 128-diagram and six-width cartridge confirmations precede this additive section; their implementation was unchanged. An independent Python ZIP CRC/extraction and relocated-CLI test also passed.

Runtime: Windows, Node.js 24.14.0 and existing Chromium/Playwright. All authored files and test artifacts use D. Temporary test profiles are removed.

## Reproduce

Run the unit and build commands in README.md. Optional browser scripts require an existing running localhost preview and explicit PLAYWRIGHT_MODULE, CHROMIUM_PATH, TEMP and TMP paths. They install no packages or browsers.

Local evidence is in output/browser-qa.json, output/architecture-qa.json, output/material-review.json, output/predeploy-qa.json, output/source-verification.json, output/skill-qa.json and output/skill-package-verification.json. The committed summary is [audit-results.json](audit-results.json). output is generated and ignored by Git.

## Limits

Hosted HTTPS publication and subsequent checks are recorded in [PUBLICATION.md](PUBLICATION.md). No physical-device/cross-browser test, live discovery in each IDE, model API integration, agent execution or model quality/cost/latency benchmark was performed. Source verification covers metadata, authors and described core concepts; it is not a full-text review or live status check of every source URL. Diagrams remain explanatory templates, not execution traces.
