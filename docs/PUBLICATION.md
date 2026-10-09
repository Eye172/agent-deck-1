# GitHub Pages publication — 9 October 2026

- Website: [Agent Deck](https://eye172.github.io/agent-deck-1/)
- Repository: [Eye172/agent-deck-1](https://github.com/Eye172/agent-deck-1)
- IDE package: [Download the offline skill](https://eye172.github.io/agent-deck-1/agent-deck-skill.zip)
- Verified deployment: [GitHub Actions run](https://github.com/Eye172/agent-deck-1/actions/runs/37936842488)
- Application revision tested: d70680fc40bc8d9d0106ed48641ebe0d89234588

The GitHub Pages source is GitHub Actions. A push to main runs the Node tests, builds the static output and publishes dist. Pull requests verify and build without deployment. No backend, custom domain or paid host is configured. Repository creation was performed by the maintainer; source push and Pages configuration used authenticated Git/CLI.

## Hosted verification

The production site passed 11 Chromium application scenarios: search, facets, detail tabs, keyboard use, custom downloads, saved collection, comparison, reading room, pagination/deep links, static exports, mobile layout and reduced motion. The local-server POST method assertion was omitted from the hosted run; provider method handling is not claimed. Desktop and mobile screenshots were reviewed.

Three skill UI groups passed: installation layout at 1440, 768, 390 and 320 px, actual ZIP/guide downloads with canonical bytes and keyboard disclosure. The published ZIP SHA-256 is 8939a32124fe68fc507641b701eb8f849aabc5acd2396520bef81bb27bdf93d7.

Four additional HTTP/browser groups passed: HTTPS home and CSP meta; JavaScript MIME and canonical bytes for selected exports, ZIP and both fonts; deep-link index responses and custom 404s for unknown/private source paths; and font loading without external browser requests, script errors or CSP violations in the sampled page load. GitHub serves the ZIP as application/x-zip-compressed, which the browser downloads correctly. TLS checks used the system CA store.

GitHub response headers included HSTS. CSP is supplied by the HTML meta fallback; custom framing, permissions and nosniff headers from _headers are not applied by GitHub Pages. The prior 768-file canonical export sweep was local; hosted byte comparisons covered selected exports and the complete skill ZIP.

Reports and screenshots are generated locally in output/hosted and are ignored by Git. The committed metrics are in [audit-results.json](audit-results.json). Subsequent documentation-only commits do not alter the application artifact.

## Scope

These are design specifications, not benchmarked executable agents. Hosted checks do not establish model quality, actual discovery inside all four IDE products, physical-device behavior or Safari/Firefox compatibility. See [VERIFICATION.md](VERIFICATION.md) and [IDE_INTEGRATION.md](IDE_INTEGRATION.md).
