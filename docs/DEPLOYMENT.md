# Hosting and publication — 9 October 2026

Agent Deck is a dependency-free static website. Deploy the generated **dist/** directory. No model API, database or server process is needed.

## Selected publication route: GitHub Pages

Suitable for a public, open-source portfolio repository. GitHub Free supports Pages from public repositories. Its published-site limit is 1 GB and its soft bandwidth limit is 100 GB/month; see [official Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

Build with Node 24 in a Pages Actions workflow and publish **dist as the Pages artifact**, rather than serving the source tree. The generated .nojekyll file prevents Jekyll processing for branch-based publishing. Relative paths have been tested under /agent-deck/, including fonts, deep links and downloads.

GitHub Pages does not apply Cloudflare/Netlify _headers rules. The generated HTML includes a CSP fallback, but frame-ancestors, X-Frame-Options and Permissions-Policy require host response-header support and do not come from that fallback.

The repository includes [.github/workflows/pages.yml](../.github/workflows/pages.yml). It runs the Node tests, builds the website and portable skill, uploads only dist, and publishes successful main-branch builds. Pull requests run verification without deployment. Enable Settings → Pages → Source → GitHub Actions before the first deployment. The intended repository is Eye172/agent-deck; the intended URL is https://Eye172.github.io/agent-deck/.

## Alternative: Cloudflare Pages

Use a Git-connected Pages project for automatic preview/production builds from a GitHub or GitLab repository. If the repository contains only this project, its root is the build root.

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | node scripts/build.mjs |
| Build output | dist |
| Node version | 24 (set NODE_VERSION if necessary) |
| Dependency installation | No project dependencies to install |

The checked Free-plan limits are 500 builds/month, 20,000 files and 25 MiB per file. This build has 804 files and a largest file of approximately 6.69 MiB, so it fits those limits. See the official [limits](https://developers.cloudflare.com/pages/platform/limits/) and [Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/).

The generated _headers file applies the security policy to static assets. Cloudflare supports that format; see [custom headers](https://developers.cloudflare.com/pages/configuration/headers/). No Pages Functions are included.

A direct upload of a locally built dist is another publication route. Choose the project workflow deliberately; Git-connected and direct-upload project modes have integration constraints. The Git workflow is preferable for maintaining this portfolio project.

## Alternative: Netlify Free

Useful for Git integration, preview deployments or a manual dist upload. The checked Free plan is $0 with **300 credits/month**. A production deploy consumes 15 credits; bandwidth consumes 20 credits/GB and web requests consume 2 credits/10,000 requests. These uses share the allowance; 300 credits should not be described as 20 guaranteed monthly deploys. Free sites may pause when the allowance is exhausted. Older accounts may use legacy plans. See [current pricing](https://www.netlify.com/pricing/).

The project includes netlify.toml with the build command, dist output and Node 24. The generated _headers rules are supported; see [Netlify headers](https://docs.netlify.com/manage/routing/headers/).

## Static IDE distribution

The build now includes agent-deck-skill.zip, its SHA-256 file and ide-guide.md. These are ordinary static downloads and work with GitHub Pages. The locally simulated /agent-deck/ deployment includes a verified ZIP download. No backend, MCP service, API key or paid package host is required. See [IDE_INTEGRATION.md](IDE_INTEGRATION.md). The final artifact has 804 files and approximately 20.2 MB of content, with the same approximately 6.69 MiB largest file.

## Before publishing

1. Run node --test tests/*.test.mjs, then node scripts/build.mjs.
2. Keep LICENSE, THIRD_PARTY_NOTICES.md and the two font-license files in the deployed artifact.
3. Publish only dist. Do not upload output, tests, internal documentation, local profiles or environment files.
4. Configure the build root correctly if the repository contains several mini-projects.
5. Use the provider's HTTPS URL initially. Custom-domain and registrar choices can follow separately.

The app uses query-based deep links on the index page. It does not require an SPA rewrite of every URL to index.html; unknown paths should retain a real 404.

## Check the actual hosted result

- Open the home page and a preset query link directly, then refresh.
- Check application UI, search, facet counts, saved items, comparison and detail tabs.
- Confirm the .mjs assets have a JavaScript MIME type; JSON and Markdown downloads contain the intended preset.
- Test the full collection download, both local fonts and mobile/reduced-motion behavior.
- Request an unknown path and confirm the intended 404.
- Inspect response headers where supported: CSP, nosniff, no-referrer, framing restrictions and Permissions-Policy. Check the console for CSP violations.
- Confirm no secret/local files are served and that browsing does not start unexpected external requests.

Hosting configuration has been prepared and local/subpath verification passed. **No remote repository, account, domain or hosted deployment has been created by this audit.** Pricing and limits above were checked on 9 October 2026 and may change.
