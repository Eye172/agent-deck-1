# Agent Deck — Research supplement

An AI-assisted companion study of structural completion gates and sequential role workflows. This is a supplement to Agent Deck, not a validation of its 64 architecture families or 384 application presets.

[Research overview](https://eye172.github.io/agent-deck-1/research/index.html) · [Working paper](paper.pdf) · [HTML paper](paper.html) · [Evidence archive](evidence.zip) · [Per-trial CSV](trials.csv) · [Statistics](statistics.json)

## Completed first series

- 2,880 original assigned attempts: 2,876 completed; four infrastructure-interrupted outcomes remain unknown and were never retried.
- Six synthetic templates, four structural settings, five evaluation draws per cell: 120 draws, 115 distinct semantic payloads.
- Four conditions, three repeats, two related Qwen 0.5B / Q4_K_M checkpoints, local Ollama 0.40.2.
- 8,549 completed-trial model calls and 6,155,745 measured input+output tokens; 96 preflight trials excluded.
- 49 passing final admitted apparatus tests; all 2,876 completed traces replayed and 57 frozen inputs verified. All 186 owned process jobs have cleanup attestation.
- 14-page working paper, 18 references. Independent scientific review and peer review have not occurred.

The required structural gate produced no observed correctness benefit under the tested conditions. Conditional uncertainty envelopes include zero. Recovery shortcuts account for 232/246 correct Coder plans and 5/5 General plans. The study therefore does not establish general reasoning ability or an architecture ranking. Coverage, accepted-error rates, missingness bounds, split overlap, grader defects and rejected repair candidates are disclosed.

## Evidence and replay

The 23.22 MiB ZIP contains 7,566 files, including the original controller/tasks/protocol, tests, analysis, raw traces, incidents, figures and dependency provenance. It excludes model weights, native Ollama binaries and private runtime keys. Extract into a new directory on D. Preserve the `structured-study` and `v2-study` relative layout. The captured environment is Windows / Python 3.10 / NumPy 1.24.2 / tokenizers 0.22.1; a compatible installed Python with NumPy is required. Do not run new model inference inside this completed snapshot.

For a separate-extraction offline audit, run the [replay helper](replay.py) with an installed compatible Python and the extracted study root:

```sh
python -B replay.py D:/your-extraction/structured-study
```

It verifies all 57 frozen inputs, forces the portable guard-evidence path, replays completed and partial traces, recomputes statistics and requires exact equality with the sealed result. It makes no model calls and writes no result files. The saved [replay check](replay-check.json) records the original successful same-machine extraction audit; it is not independent scientific replication. The archived environment and dependencies are Windows-specific.

Original source, output and control paths may appear in historical records. The paper/archive describe the completed local snapshot, including then-current local-only availability and website-preservation statements. This page publishes that snapshot afterward without changing the original records. [Publication metadata and SHA-256 hashes](publication.json) identify the published files.

## Planned, not yet run

1. Remove order/ID shortcuts, enforce all public grader rules, reject semantic overlap and obtain independent task review before a new protocol freeze.
2. Qualify stronger models and compare workflows with matched realized compute.
3. Test held-out templates and controlled task perturbations.
4. Bind selected implemented blueprints to exact preset/runtime/task/model/budget versions.
5. Add an inspectable trace viewer and seek independent scientific review.

AI assistance covered design, implementation, execution support, analysis and writing. Original project material uses MIT; bundled upstream dependencies and cited works retain their licenses. The archived tokenizer Apache-2.0 notice and model/runtime provenance remain intact. Model outputs are finite JSON data, not executed code; native Ollama/OS components remain trusted and were not isolated against compromise.
