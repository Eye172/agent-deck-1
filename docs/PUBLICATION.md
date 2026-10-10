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

## Research supplement — 10 October 2026

A footer link and README section now connect Agent Deck to an AI-assisted research supplement. The supplement publishes the sealed 14-page working paper, full HTML paper, six PNG/SVG figure assets, per-trial CSV, statistics, diagnostics, a 23.22 MiB evidence ZIP and an offline replay helper.

The first series accounts for 2,880 assignments: 2,876 completed and four unknown infrastructure-interrupted outcomes. Completed trials contain 8,549 calls and 6,155,745 measured tokens. Results are limited to four finite-plan workflows, six synthetic templates and two related Qwen 0.5B checkpoints; catalogue presets are not marked evaluated. Planned follow-up work and independent-review status are explicit.

The evidence archive and PDF preserve their original SHA-256 values. Research file bytes are exempted from Git line-ending normalization so the CSV and publication hashes survive a Linux Pages checkout. The build injects CSP metadata into the overview and full HTML paper; publication metadata distinguishes HTML source hashes from exact download hashes. CI checks research hashes, CSV counts and costs before deployment.

Local verification passed the 30 existing Agent Deck tests and eight research browser groups, including 1440/768/390/320 px layouts, project-subpath navigation, material responses and an actual canonical ZIP download. No browser errors or external resource requests were observed. The existing catalogue, actor assets and IDE skill ZIP remain byte-identical; their prior performance disclaimers remain in place. Hosted deployment verification is recorded separately after publication.

### Hosted research verification

The research application revision `04ab127d9c102b1688fe451ad76b282805f2c0a5` deployed successfully through [GitHub Actions run 38009607024](https://github.com/Eye172/agent-deck-1/actions/runs/38009607024).

Eight hosted Chromium verification groups passed: the footer link and existing catalogue search; research layouts at 1440, 768, 390 and 320 px; all linked materials and their canonical SHA-256 values; an actual browser evidence ZIP download; and the complete HTML paper with 12 tables. No page errors, page overflow or off-origin resource requests were observed. PDF and evidence ZIP bytes match the sealed original study. Independent HTTPS byte comparisons also confirm that the full catalogue JSON and IDE skill ZIP are unchanged from before the supplement.

[Open Research](https://eye172.github.io/agent-deck-1/research/index.html). Local reports are retained in ignored `output/research-work/`; no machine-specific browser profiles are committed. These publication checks establish delivery and sampled browser behavior, not model performance or independent scientific review. This documentation update does not change the verified application artifact.


## Usage analytics — 10 October 2026

Optional Umami Cloud collection now measures landing/research-overview page views and bounded catalogue actions. There are no accounts for visitors. Search text, URL query strings/fragments, referrer paths, saved shelves and custom blueprint content are excluded. DNT, GPC, local preview, unavailable browser storage and stored opt-out suppress tracking. The privacy page exposes the browser preference and explains provider processing and count limits. The offline IDE skill is unchanged and sends no usage data.

Local verification passed 36 unit tests, six analytics browser groups using the current public vendor script with the collector intercepted, and eight research browser groups. The real vendor snapshot used for compatibility had SHA-256 91a876d767646fd5b7701b6fabf97f8a99ae53b94e7e5b58d465bad1e5d763e0. No synthetic test visitors were sent to the service. These checks establish client behavior; account-side delivery is checked separately after deployment. Historical no-analytics/no-external-request statements above describe the earlier build.

Catalogue JSON, IDE skill ZIP and all sealed research downloads retain their prior bytes. Only the research overview HTML and its recorded source hash change for the shared Privacy link and analytics module. The collector is explicitly pinned to gateway.umami.is and the script to cloud.umami.is in CSP; no broad wildcard was added.
