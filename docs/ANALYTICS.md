# Usage analytics

Agent Deck uses optional Umami Cloud web analytics. The production integration is configured for the Agent Deck website in the account-selected EU region. Setting websiteId to null in analytics.config.json disables collection. The ID is public, not a credential. Never put a password or API key in this file.

## Activation

1. Create an Umami Cloud account, select the data region and free Hobby plan.
2. Add Agent Deck with domain eye172.github.io and copy the Tracking code.
3. Put its data-website-id UUID in analytics.config.json. The supported tracker is https://cloud.umami.is/script.js with the explicit https://gateway.umami.is collector; unexpected destinations fail the build rather than expanding CSP.
4. Run the unit tests, production build and scripts/analytics-qa.mjs using existing Playwright/Chromium paths. Publish through the existing GitHub Pages workflow.
5. Check one real page view and action in the Umami dashboard. The dashboard and provider retention are administered by the account owner; CI and mocks cannot verify account-side delivery.

Only HTTPS on eye172.github.io is tracked. Localhost previews, the privacy preference page, Do Not Track, Global Privacy Control and a stored opt-out suppress requests. A blocked/unavailable tracker does not block browsing or exports. There are no retries, identity calls, session replay, heatmaps or tracking cookies in our integration. If browser storage is inaccessible, tracking stays off by default.

## Measurements

| Event | Accepted data | Meaning |
| --- | --- | --- |
| Page view | Page path/title, language, screen dimensions, referrer origin | One initial view of the landing or research overview page; URL state changes do not count as more views |
| preset-open | Canonical preset ID | A valid detail view opened while the tracker was ready |
| preset-download | Canonical preset ID, json/markdown/custom-json | Export action, not proof of completed download |
| filter-change | category/level/scenario/topology, add/remove | A checkbox changed; neither search text nor filter values are sent |
| compare-open | Count of 2 or 3 | A comparison view opened |
| collection-download | None | Full catalogue export requested |
| skill-download | None | IDE skill link clicked; offline use is not monitored |
| install-guide-download | None | Installation guide link clicked |
| research-open | None | Research overview link clicked |
| research-material-click | Allowlisted material filename | Paper/data/archive link clicked, not a completed download |

The before-send hook rebuilds an allowlisted payload and drops unknown events or pages. Raw query strings, fragments, referrer paths, names, emails, IDs assigned to visitors, local saved state, copy text and custom blueprint contents are not sent. Umami still receives IP/browser information when serving the script and processing analytics. Its approximate visitor/device/country metrics are not verified people; ad blockers, repeated visits and automation affect counts.

The public privacy notice explains third-party processing and the browser opt-out. Changing analytics endpoints, data fields or collection features requires a new privacy/CSP review. Do not bypass ad blockers or privacy preferences. Free-plan retention is finite; archive aggregate reports separately if needed for portfolio evidence, and state the measurement dates.

## Verification boundary

Browser tests intercept the exact Umami script URL and collector and capture sanitized payloads. Set UMAMI_TRACKER_FILE to a locally saved official tracker snapshot to test its actual code; otherwise a small API mock is used. Both modes run without sending synthetic visitors to the provider. They cover GitHub Pages paths, leakage, local preview, opt-out, privacy signals, blocked storage, tracker failure and export/UI behavior. They do not establish real provider delivery or vendor internals. A fetched vendor snapshot exercises the current public script, not every future vendor revision. The sealed research downloads and canonical catalogue/skill remain unchanged.

Primary documentation: [Collect data](https://docs.umami.is/docs/collect-data), [Tracker configuration](https://docs.umami.is/docs/tracker-configuration), [Tracker functions](https://docs.umami.is/docs/tracker-functions), [Pricing](https://umami.is/pricing).
