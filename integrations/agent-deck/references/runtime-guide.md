# Implementing an Agent Deck blueprint

A blueprint describes intent, contracts and an evaluation plan. Its JSON is not a framework configuration or a running system.

## Runtime decisions

- Implement the declared mechanism-specific adapters as well as domain tools. A tool name is a contract; it does not establish tool availability or authorization.
- Map each named edge condition to a tested predicate. Decide route priority, join behavior and what happens when no route matches.
- Separate a normal controller phase exit from task acceptance. Emit success only after the user's task-level criteria pass; retain failed, partial or blocked outcomes.
- Bound model calls, controller steps and wall time independently. Starting budgets and sampling settings are editorial; provider support differs.
- Apply declared replication to the specified worker/candidate stages, not every role. A roster is select-one unless its contract says otherwise.
- Persist state only where required. Define storage scope, consistency, TTL and writes. A checkpoint requires actual durable data and appropriate recovery semantics.
- Compensation is a best-effort remedy, not universal undo. External writes need their own authorization and idempotency.
- Search/lookahead needs a state/evaluation model and an appropriate environment. Colored candidate nodes are illustrative states, not proof of an implemented search algorithm.

## Validation

Use the preset's mechanism probe and domain fixture as starting points, then adapt them to the user's task. Compare with a simpler baseline using matched inputs and model/provider settings. Record observable correctness, latency, model calls, tokens and tool failures only when measured. Keep source attribution, unresolved assumptions and evaluation status visible.

Training-based features of the original RAG, Self-RAG or Adaptive-RAG papers do not emerge from a prompt alone. Voyager's environment-specific skill learning is not reproduced by copying a workflow. Treat the source works as references, not promises of preset performance.
