# Contributing

Agent Deck is a catalog of inspectable design specifications. Contributions can improve mechanisms, task contracts, explanations, source attribution, accessibility or the offline skill.

Edit the canonical modules in src rather than generated dist or output files. Keep the distinction between mechanism families and application adaptations. Credit primary sources and label editorial inferences. Do not describe an unrun experiment as a measured result.

When changing a mechanism, preserve valid transitions and stage-specific adapter requirements, state, failure recovery, budgets and task acceptance. When adding a task adaptation, make its inputs, tool scope, privacy boundary and acceptance criteria meaningful.

Run node --test tests/*.test.mjs and node scripts/build.mjs. For interface changes, inspect relevant desktop/mobile states and use the optional existing-browser checks described in README. Keep new validation focused on observable behavior.

Skill resources are generated from the same catalog as the site. Test the relocated package as well as its metadata when changing its helper or packaging. Maintain the MIT notice and source attribution.

Open a pull request explaining the user-visible change, rationale and validation. Keep unrelated generated files, local profiles, credentials and environment files out of commits.
