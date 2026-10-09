# Architecture taxonomy

64 mechanism families, grouped for navigation. Six domain adaptations of each mechanism are generated separately. Complexity and wiring labels are editorial; several mechanisms overlap and can be composed.

## Workflows (8)

### Prompt chain

**ID:** chain · **Level:** Basic · **Wiring:** Sequence

A fixed sequence transforms a request through inspectable intermediate artifacts.

Stages: Extract → Transform → Validate → Deliver.

Invariant: Every stage consumes a checked predecessor artifact.

Tradeoff: Early mistakes propagate; test content, not only format.

Failure probe: Supply a malformed intermediate artifact; downstream delivery must stop.

State: normalized_input, intermediate_artifacts, validation_result.

Required mechanism adapters: validate_stage_contract.

References: [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), [Workflows and agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents).

### Task router

**ID:** router · **Level:** Basic · **Wiring:** Router

Classify a request and send it to a scoped handler.

Stages: Classify → Specialist → Check → Respond.

Invariant: Unknown classifications take the explicit unknown route.

Tradeoff: Misrouting is an upstream failure. Evaluate it separately.

Failure probe: Supply a request outside every declared route; check abstention.

State: route, route_evidence, handler_contract.

Required mechanism adapters: validate_stage_contract.

References: [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), [Router](https://docs.langchain.com/oss/python/langchain/multi-agent/router).

### Parallel sections

**ID:** parallel-sections · **Level:** Intermediate · **Wiring:** Fan-out

Independent sections run concurrently and merge without shared mutable context.

Stages: Partition → Workers → Merge → Audit.

Invariant: Merge requires every mandatory section or explicitly reports missing sections.

Tradeoff: Parallelism increases total cost when context is duplicated.

Failure probe: Fail one worker and check that the missing section is visible.

State: sections, worker_results, worker_failures.

Required mechanism adapters: join_stage_artifacts, validate_stage_contract.

References: [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), [Workflows and agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents).

### Parallel voting

**ID:** parallel-vote · **Level:** Intermediate · **Wiring:** Ensemble

Normalize independent candidate answers before counting agreement.

Stages: Candidates → Normalize → Vote → Check.

Invariant: Votes use canonical final answers; agreement alone cannot establish correctness.

Tradeoff: Agreement is not calibrated confidence.

Failure probe: Supply agreeing wrong candidates and a failed external checker.

State: candidates, canonical_answers, vote_counts, ties.

Required mechanism adapters: normalize_answers, join_stage_artifacts, validate_stage_contract.

References: [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), [Self-Consistency](https://arxiv.org/abs/2203.11171).

### Map-reduce synthesis

**ID:** map-reduce · **Level:** Intermediate · **Wiring:** Fan-out

Extract local records from chunks and reduce them into a global result.

Stages: Chunk → Map → Reduce → Verify.

Invariant: Each input chunk is accounted for exactly once.

Tradeoff: Chunking can lose relationships spanning boundaries.

Failure probe: Duplicate a chunk and omit another; verify coverage detection.

State: chunk_ids, chunk_hashes, map_results, reduction_coverage.

Required mechanism adapters: chunk_input, join_stage_artifacts, validate_stage_contract.

References: [MapReduce](https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/), [Workflows and agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents), [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow).

### Evaluator–optimizer

**ID:** evaluator-optimizer · **Level:** Intermediate · **Wiring:** Loop

A separate rubric-based evaluator guides bounded revisions.

Stages: Draft → Evaluate → Revise → Deliver.

Invariant: Only rubric-linked revisions continue; budget exhaustion retains known violations.

Tradeoff: A weak evaluator rewards superficial improvement.

Failure probe: Use a checker that never passes; verify bounded termination.

State: draft, rubric_violations, revision_count, best_checked_draft.

Required mechanism adapters: validate_stage_contract.

References: [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), [Self-Refine](https://arxiv.org/abs/2303.17651).

### Orchestrator–workers

**ID:** orchestrator-workers · **Level:** Advanced · **Wiring:** Supervisor

Discover subtasks dynamically and dispatch bounded work orders.

Stages: Orchestrate → Workers → Integrate → Review.

Invariant: Worker claims stay attached to evidence during synthesis.

Tradeoff: Poor delegation creates duplication and integration overhead.

Failure probe: Return conflicting worker evidence and check conflict preservation.

State: subtasks, worker_contracts, dependency_results, coverage_gaps.

Required mechanism adapters: join_stage_artifacts, validate_stage_contract.

References: [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system).

### Explicit state machine

**ID:** state-machine · **Level:** Intermediate · **Wiring:** State machine

Deterministic state transitions make execution inspectable and resumable.

Stages: Intake → Process → Transition → Finalize.

Invariant: Only declared transitions can change the current state.

Tradeoff: Rigid states need explicit exception and escalation routes.

Failure probe: Send an invalid event and verify it does not advance the workflow.

State: state_name, allowed_transitions, event_history.

Required mechanism adapters: validate_stage_contract, persist_workflow_state.

References: [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow), [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence).

## Reasoning (8)

### Tree of Thoughts

**ID:** tree-of-thoughts · **Level:** Advanced · **Wiring:** Tree search

Explore partial solutions and retain a bounded search frontier.

Stages: Expand → Evaluate → Select → Resolve.

Invariant: Evaluate candidate states before pruning; retain parent links for backtracking.

Tradeoff: Model value estimates may prefer plausible wrong branches.

Failure probe: Construct a promising dead end and verify alternate-branch exploration.

State: frontier, parent_links, state_scores, search_depth, pruned_states.

Required mechanism adapters: manage_search_frontier.

References: [Tree of Thoughts](https://arxiv.org/abs/2305.10601).

### Graph of Thoughts

**ID:** graph-of-thoughts · **Level:** Expert · **Wiring:** Graph search

Reuse, merge and refine compatible intermediate results in a dependency graph.

Stages: Branch → Aggregate → Refine → Evaluate.

Invariant: Merged artifacts retain provenance from every contributing branch.

Tradeoff: Merging incompatible assumptions silently corrupts results.

Failure probe: Merge contradictory branches and check that evidence is not silently overwritten.

State: state_graph, merge_provenance, revisions, acyclic_dependencies.

Required mechanism adapters: join_stage_artifacts, validate_stage_contract.

References: [Graph of Thoughts](https://arxiv.org/abs/2308.09687).

### Self-consistency

**ID:** self-consistency · **Level:** Intermediate · **Wiring:** Ensemble

Sample independent solutions and aggregate normalized final answers.

Stages: Sample → Extract → Aggregate → Validate.

Invariant: Samples remain independent before answer aggregation.

Tradeoff: Open-ended tasks need a defensible normalization contract.

Failure probe: Mix equivalent answer forms and confirm correct normalization.

State: samples, normalized_answers, answer_frequencies.

Required mechanism adapters: normalize_answers, join_stage_artifacts, validate_stage_contract.

References: [Self-Consistency](https://arxiv.org/abs/2203.11171).

### Least-to-most

**ID:** least-to-most · **Level:** Intermediate · **Wiring:** Sequence

Solve ordered subproblems using validated earlier results.

Stages: Decompose → Solve → Check → Combine.

Invariant: Dependent subproblems consume checked earlier solutions.

Tradeoff: Faulty decomposition can omit the real problem.

Failure probe: Make an early subproblem fail and verify dependent work is blocked.

State: subproblem_order, checked_solutions, dependency_map.

Required mechanism adapters: validate_stage_contract.

References: [Least-to-Most Prompting](https://arxiv.org/abs/2205.10625).

### Program-aided reasoning

**ID:** program-aided · **Level:** Advanced · **Wiring:** Tool loop

A model specifies a small program; an isolated interpreter performs computation.

Stages: Specify → Program → Execute → Interpret.

Invariant: Numeric claims are tied to actual sandbox execution.

Tradeoff: Correct execution cannot repair an incorrectly specified calculation.

Failure probe: Generate a program with a unit error; verify rejection and bounded repair.

State: program, execution_result, unit_checks, repair_count.

Required mechanism adapters: run_sandboxed_program.

References: [PAL: Program-aided Language Models](https://arxiv.org/abs/2211.10435).

### Self-Refine

**ID:** self-refine · **Level:** Intermediate · **Wiring:** Loop

Generate, critique and revise with a bounded single-model loop.

Stages: Generate → Critique → Refine → Stop.

Invariant: Feedback maps to concrete edits and a bounded stop condition.

Tradeoff: Self-critique may reinforce the same model bias.

Failure probe: Repeat identical feedback and verify the loop does not continue forever.

State: draft, feedback, revision_history, stop_reason.

Required mechanism adapters: validate_stage_contract.

References: [Self-Refine](https://arxiv.org/abs/2303.17651).

### Step-back abstraction

**ID:** step-back · **Level:** Advanced · **Wiring:** Sequence

Ground a general principle before applying it to a concrete case.

Stages: Abstract → Ground → Apply → Check.

Invariant: Abstraction guides the answer without replacing task-specific evidence.

Tradeoff: Abstraction can erase important exceptions.

Failure probe: Include a task exception that conflicts with a general principle.

State: abstract_principles, task_constraints, concrete_answer.

Required mechanism adapters: retrieve_authorized_evidence, validate_stage_contract.

References: [Take a Step Back](https://arxiv.org/abs/2310.06117).

### Self-Discover adaptation

**ID:** self-discover · **Level:** Expert · **Wiring:** Meta-plan

Select reasoning modules and compose a task-specific execution structure.

Stages: Select → Adapt → Structure → Execute.

Invariant: Only declared reasoning modules may enter the adapted structure.

Tradeoff: Module selection is another fallible inference step.

Failure probe: Select an incompatible module and verify the structure checker rejects it.

State: selected_modules, adapted_modules, execution_structure.

Required mechanism adapters: validate_stage_contract.

References: [Self-Discover](https://arxiv.org/abs/2402.03620).

## Planning (8)

### ReAct tool loop

**ID:** react · **Level:** Intermediate · **Wiring:** Tool loop

Choose an action, observe its outcome and adapt the next step.

Stages: Decide → Act → Observe → Answer.

Invariant: Decisions consume actual observations and every loop checks remaining budgets.

Tradeoff: Long loops accumulate context and tool errors.

Failure probe: Make a tool repeatedly return errors; verify a bounded honest partial result.

State: next_action, observations, tool_errors, stop_reason.

Required mechanism adapters: run_authorized_tool, validate_stage_contract.

References: [ReAct](https://arxiv.org/abs/2210.03629).

### Plan and execute

**ID:** plan-execute · **Level:** Advanced · **Wiring:** Plan loop

Build a dependency-aware plan and replan only when observations invalidate it.

Stages: Plan → Execute → Replan → Complete.

Invariant: Replanning uses observed failures without repeating completed effects.

Tradeoff: A plausible initial plan may rely on nonexistent tools.

Failure probe: Invalidate a future step after an earlier step has already completed.

State: plan_steps, completed_steps, plan_revision.

Required mechanism adapters: execute_ready_plan_step, validate_stage_contract.

References: [Plan-and-Execute Agents](https://www.langchain.com/blog/planning-agents).

### ReWOO adaptation

**ID:** rewoo · **Level:** Advanced · **Wiring:** Evidence plan

Plan evidence references first, resolve tool dependencies and synthesize once.

Stages: Planner → Worker → Solver → Validate.

Invariant: Evidence references resolve to real prior results before execution.

Tradeoff: Preplanned calls struggle with unexpected tool observations.

Failure probe: Reference an unresolved evidence variable and fail a dependent tool.

State: plan, evidence_variables, evidence_dependencies, tool_results.

Required mechanism adapters: resolve_evidence_plan, validate_stage_contract.

References: [ReWOO](https://arxiv.org/abs/2305.18323), [Plan-and-Execute Agents](https://www.langchain.com/blog/planning-agents).

### LLMCompiler adaptation

**ID:** llmcompiler · **Level:** Expert · **Wiring:** DAG scheduler

Dispatch independent tool calls as dependency-ready tasks in an explicit DAG.

Stages: Compile → Schedule → Execute → Join.

Invariant: Only ready tasks execute; dependencies and joins survive task failure.

Tradeoff: Incorrect dependency declarations cause races or invalid parallelism.

Failure probe: Use a diamond dependency graph and fail one predecessor.

State: task_dag, ready_queue, completed_tasks, join_state.

Required mechanism adapters: schedule_dependency_ready_tasks, validate_stage_contract, execute_ready_tool_calls, join_stage_artifacts.

References: [LLMCompiler](https://arxiv.org/abs/2312.04511), [Plan-and-Execute Agents](https://www.langchain.com/blog/planning-agents).

### Language Agent Tree Search

**ID:** lats · **Level:** Expert · **Wiring:** Monte Carlo search

Explore actions with rollout feedback and a bounded search tree.

Stages: Select node → Expand action → Rollout → Backpropagate.

Invariant: Tree search records selection, expansion, feedback and backpropagated values.

Tradeoff: Search requires resettable state; irreversible actions cannot be safely rolled back.

Failure probe: Use a high-scoring dead end and verify alternate action exploration.

State: search_tree, visit_counts, value_estimates, environment_feedback.

Required mechanism adapters: select_search_node, evaluate_resettable_rollout, backpropagate_search_values, validate_stage_contract.

References: [Language Agent Tree Search](https://arxiv.org/abs/2310.04406).

### Budget-aware planner

**ID:** budget-planner · **Level:** Expert · **Wiring:** Budget scheduler

Choose the next work item against remaining cost, time and evidence value.

Stages: Estimate → Budget gate → Execute → Reconcile.

Invariant: Allocation cannot exceed the enforced call or time allowance.

Tradeoff: Estimated value and cost are not measured utility; reconcile actual usage.

Failure probe: Provide optimistic estimates and unexpectedly expensive tool calls.

State: remaining_calls, step_estimates, selected_steps, spent_budget.

Required mechanism adapters: validate_stage_contract, execute_budgeted_step.

References: [Plan-and-Execute Agents](https://www.langchain.com/blog/planning-agents), [LLMCompiler](https://arxiv.org/abs/2312.04511).

### Hierarchical task decomposition

**ID:** hierarchical-plan · **Level:** Expert · **Wiring:** Hierarchy

Refine high-level objectives into checked subplans with preconditions.

Stages: Decompose → Validate methods → Refine → Execute.

Invariant: Subplans execute only while their preconditions still hold.

Tradeoff: This composition needs a real method library; free-form subplans are not formal HTN proofs.

Failure probe: Change a required environment condition midway through execution.

State: goal_tree, preconditions, task_methods, completed_effects.

Required mechanism adapters: validate_stage_contract, execute_checked_subplan.

References: [Plan-and-Execute Agents](https://www.langchain.com/blog/planning-agents), [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow).

### Sandbox lookahead planner

**ID:** sandbox-lookahead · **Level:** Expert · **Wiring:** World-model loop

Compare action proposals in a disposable environment before selecting a real step.

Stages: Observe → Propose → Simulate → Select.

Invariant: Simulated outcomes are labeled predictions and checked against actual feedback.

Tradeoff: Simulation-to-reality mismatch can invalidate the chosen action.

Failure probe: Use a systematically wrong simulator and detect prediction mismatch.

State: candidate_actions, simulated_outcomes, simulation_error, selected_action.

Required mechanism adapters: simulate_scoped_action, capture_environment_snapshot, validate_stage_contract.

References: [Language Agent Tree Search](https://arxiv.org/abs/2310.04406), [WebArena](https://arxiv.org/abs/2307.13854).

## Multi-agent (8)

### Specialist supervisor

**ID:** supervisor · **Level:** Advanced · **Wiring:** Supervisor

A manager selects specialists and integrates their bounded outputs.

Stages: Dispatch → Specialist → Supervisor → Complete.

Invariant: The manager preserves specialist evidence and enforces delegated scope.

Tradeoff: A manager can become a bottleneck or distort specialist evidence.

Failure probe: Have a specialist request an out-of-scope action; verify the boundary.

State: delegations, specialist_results, manager_decisions, unresolved_gaps.

Required mechanism adapters: validate_stage_contract.

References: [Subagents](https://docs.langchain.com/oss/python/langchain/multi-agent/subagents), [Multi-agent patterns](https://docs.langchain.com/oss/python/langchain/multi-agent).

### Specialist handoff

**ID:** handoff · **Level:** Intermediate · **Wiring:** Handoff

Move control to a specialist with explicit state ownership.

Stages: Triage → Handoff → Specialist → Resolve.

Invariant: Exactly one agent owns the case after a handoff.

Tradeoff: Unbounded transfers create loops and leak context.

Failure probe: Request a transfer missing mandatory case fields.

State: active_agent, handoff_payload, context_scope.

Required mechanism adapters: validate_stage_contract.

References: [Handoffs](https://docs.langchain.com/oss/python/langchain/multi-agent/handoffs).

### Bounded agent debate

**ID:** debate · **Level:** Advanced · **Wiring:** Debate

Challenge independent proposals before evidence-based selection.

Stages: Propose → Challenge → Revise → Judge.

Invariant: Debate rounds cannot convert unsupported agreement into evidence.

Tradeoff: Discussion can create correlated agreement without correctness.

Failure probe: Make all participants repeat the same unsupported claim.

State: independent_positions, critique_rounds, remaining_disagreements.

Required mechanism adapters: validate_stage_contract.

References: [Multiagent Debate](https://arxiv.org/abs/2305.14325).

### Sequential role crew

**ID:** role-crew · **Level:** Intermediate · **Wiring:** Sequence

Different roles own successive artifacts and handoff contracts.

Stages: Investigate → Produce → Review → Deliver.

Invariant: Role transitions preserve required fields and authorship.

Tradeoff: Role names do not create expertise without distinct inputs and checks.

Failure probe: Omit one role output and check that the dependent role cannot claim completion.

State: role_outputs, role_dependencies, final_artifact.

Required mechanism adapters: validate_stage_contract.

References: [Processes](https://docs.crewai.com/en/concepts/processes), [CrewAI](https://github.com/crewAIInc/crewAI).

### Shared blackboard

**ID:** blackboard · **Level:** Expert · **Wiring:** Blackboard

Specialists contribute typed facts under a deterministic shared-state scheduler.

Stages: Schedule → Contribute → Commit → Resolve.

Invariant: Updates use version checks and retain conflicting contributions.

Tradeoff: Concurrent writers need conflict handling and version control.

Failure probe: Submit simultaneous incompatible writes to the same board field.

State: shared_board, board_version, contributions, conflicts.

Required mechanism adapters: read_blackboard, append_blackboard, validate_stage_contract, join_stage_artifacts.

References: [Hearsay II: blackboard organization](https://iiif.library.cmu.edu/file/Newell_box00034_fld02331_doc0001/Newell_box00034_fld02331_doc0001.pdf), [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow), [AutoGen](https://github.com/microsoft/autogen).

### Hierarchical teams

**ID:** hierarchical-team · **Level:** Expert · **Wiring:** Hierarchy

A coordinator delegates to leads who manage scoped specialist groups.

Stages: Coordinator → Team leads → Specialists → Integrate.

Invariant: Delegated budgets and scopes cannot expand at lower levels.

Tradeoff: Extra coordination layers can compress away crucial evidence.

Failure probe: Have a subteam exceed its delegated call allowance.

State: team_tree, delegation_scopes, subteam_results.

Required mechanism adapters: join_stage_artifacts.

References: [Processes](https://docs.crewai.com/en/concepts/processes), [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system).

### Mixture-of-Agents adaptation

**ID:** mixture-of-agents · **Level:** Expert · **Wiring:** Layered ensemble

Aggregate diverse candidate layers into a revised answer.

Stages: Proposers → Aggregate → Refine layer → Validate.

Invariant: Each aggregation layer records which prior outputs it consumed.

Tradeoff: Several models can amplify shared misconceptions.

Failure probe: Feed one fabricated candidate and check the final evidence ledger.

State: layer_outputs, aggregation_inputs, source_attribution.

Required mechanism adapters: validate_stage_contract.

References: [Mixture-of-Agents](https://arxiv.org/abs/2406.04692).

### Coordinator research swarm

**ID:** research-swarm · **Level:** Expert · **Wiring:** Supervisor

Assign disjoint research leads and audit evidence before synthesis.

Stages: Lead → Investigators → Citation audit → Synthesis.

Invariant: Coverage counts independently supported findings, not repeated citations.

Tradeoff: Open-ended research needs coverage and budget stops.

Failure probe: Use duplicate URLs across workers and a contradictory primary source.

State: research_questions, worker_findings, source_coverage, contradictions.

Required mechanism adapters: validate_stage_contract.

References: [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system).

## Retrieval (12)

### Grounded retrieval

**ID:** basic-rag · **Level:** Basic · **Wiring:** Retrieval

Retrieve passages and answer with exact source references.

Stages: Query → Retrieve → Answer → Check.

Invariant: Every supported answer claim has an accessible passage.

Tradeoff: Missed or wrong-version passages directly affect answers.

Failure probe: Ask an unanswerable question and verify abstention.

State: retrieved_passages, passage_versions, citation_map.

Required mechanism adapters: retrieve_authorized_evidence, validate_stage_contract.

References: [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401).

### Hybrid retrieval + reranking

**ID:** hybrid-rag · **Level:** Intermediate · **Wiring:** Retrieval

Combine exact-term and semantic search before reranking evidence.

Stages: Search → Fuse → Rerank → Answer.

Invariant: Retrieval fusion deduplicates by document identity and version.

Tradeoff: Reranking cannot recover documents missed by both search methods.

Failure probe: Supply lexical and dense hits from different document versions.

State: lexical_results, dense_results, fused_passages.

Required mechanism adapters: search_lexical, search_dense, join_stage_artifacts, rerank_passages.

References: [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval).

### Corrective RAG adaptation

**ID:** corrective-rag · **Level:** Advanced · **Wiring:** Conditional retrieval

Grade evidence and perform a bounded alternate retrieval when necessary.

Stages: Retrieve → Grade → Correct → Answer.

Invariant: Corrective retrieval is triggered by evidence grading and remains bounded.

Tradeoff: A faulty grader can accept weak evidence.

Failure probe: Supply irrelevant passages and an unavailable fallback retriever.

State: retrieval_grade, correction_strategy, retrieval_attempts.

Required mechanism adapters: retrieve_authorized_evidence.

References: [Corrective RAG](https://arxiv.org/abs/2401.15884).

### Self-RAG-inspired critique

**ID:** self-rag · **Level:** Advanced · **Wiring:** Loop

A prompted controller decides when retrieval is needed and checks claim support.

Stages: Need evidence → Retrieve → Draft → Critique.

Invariant: Prompted reflection checks are explicitly distinguished from trained reflection tokens.

Tradeoff: A prompted adaptation does not reproduce the paper’s trained reflection tokens.

Failure probe: Disable retrieval and provide an unsupported candidate answer.

State: retrieval_decision, support_check, reflection_labels.

Required mechanism adapters: retrieve_authorized_evidence, validate_stage_contract.

References: [Self-RAG](https://arxiv.org/abs/2310.11511).

### GraphRAG adaptation

**ID:** graph-rag · **Level:** Expert · **Wiring:** Graph retrieval

Retrieve entities and community summaries with passage-level provenance.

Stages: Scope → Graph search → Expand → Synthesize.

Invariant: Community summaries remain traceable to source spans.

Tradeoff: Extraction errors and stale summaries can distort graph evidence.

Failure probe: Ask a global question over a graph containing a wrong entity merge.

State: entity_graph, community_summaries, source_spans.

Required mechanism adapters: query_evidence_graph, resolve_source_passages.

References: [GraphRAG: From Local to Global](https://arxiv.org/abs/2404.16130).

### RAPTOR-inspired tree retrieval

**ID:** raptor · **Level:** Expert · **Wiring:** Hierarchical retrieval

Search summary depths and ground broad summaries in original leaves.

Stages: Choose depth → Tree search → Expand leaves → Answer.

Invariant: Summary-tree results retain retrievable original leaves.

Tradeoff: Lossy summaries hide exceptions; original leaves must remain available.

Failure probe: Remove a leaf supporting a parent summary and verify support failure.

State: summary_tree, summary_levels, original_leaf_refs.

Required mechanism adapters: query_summary_tree, resolve_original_leaves.

References: [RAPTOR](https://arxiv.org/abs/2401.18059).

### HyDE retrieval adaptation

**ID:** hyde · **Level:** Advanced · **Wiring:** Retrieval

Use a hypothetical document for search while excluding it from evidence.

Stages: Hypothesize → Search → Filter → Answer.

Invariant: Synthetic query documents are retrieval hints and never evidence.

Tradeoff: A hypothetical answer can steer retrieval toward a false premise.

Failure probe: Generate a plausible but false hypothetical document.

State: hypothetical_document, query_embedding, retrieved_evidence.

Required mechanism adapters: embed_query_hint, search_authorized_embeddings, validate_stage_contract.

References: [Hypothetical Document Embeddings](https://arxiv.org/abs/2212.10496).

### Contextual chunk retrieval

**ID:** contextual-rag · **Level:** Advanced · **Wiring:** Retrieval

Index chunks with context while keeping original passages as evidence.

Stages: Index context → Retrieve → Rerank → Answer.

Invariant: Added chunk context is traceable to the original document.

Tradeoff: Generated indexing context can be inaccurate.

Failure probe: Use a chunk whose surrounding context reverses its meaning.

State: contextual_chunks, context_source_refs, reranked_hits.

Required mechanism adapters: build_contextual_index, retrieve_authorized_evidence, rerank_passages.

References: [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval).

### Adaptive retrieval routing

**ID:** adaptive-rag · **Level:** Expert · **Wiring:** Router

Route between supplied context, single retrieval and iterative evidence gathering.

Stages: Assess → Route → Gather → Answer.

Invariant: Explicit rule routing is distinguished from the paper’s learned classifier.

Tradeoff: The original paper trains a router; this is an explicitly prompted adaptation.

Failure probe: Supply an apparently simple question requiring multiple evidence hops.

State: complexity_class, retrieval_route, route_check.

Required mechanism adapters: validate_stage_contract, retrieve_authorized_evidence.

References: [Adaptive-RAG](https://arxiv.org/abs/2403.14403), [Router](https://docs.langchain.com/oss/python/langchain/multi-agent/router).

### Multi-query retrieval

**ID:** multi-query · **Level:** Advanced · **Wiring:** Fan-out

Search diverse query formulations and deduplicate their evidence.

Stages: Rewrite → Search → Merge → Answer.

Invariant: Query variants stay within the task scope and deduplicate source evidence.

Tradeoff: Query expansion may drift from the original question.

Failure probe: Generate redundant variants and one variant with altered task intent.

State: query_variants, per_query_hits, deduplicated_hits.

Required mechanism adapters: retrieve_authorized_evidence, join_stage_artifacts.

References: [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval), [Router](https://docs.langchain.com/oss/python/langchain/multi-agent/router).

### Reciprocal rank fusion

**ID:** rank-fusion · **Level:** Advanced · **Wiring:** Rank fusion

Combine independent ranked evidence lists using a declared deterministic fusion rule.

Stages: Search lists → Fuse ranks → Check passages → Answer.

Invariant: Fusion uses declared rank rules and stable identity keys.

Tradeoff: Ranks from poor retrievers still yield poor fused results.

Failure probe: Mix differently scaled retriever scores; verify rank-based fusion.

State: ranked_lists, rank_scores, fused_ids.

Required mechanism adapters: retrieve_authorized_evidence, apply_reciprocal_rank_fusion, validate_stage_contract.

References: [Reciprocal Rank Fusion](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf), [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval), [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow).

### Multimodal evidence retrieval

**ID:** multimodal-evidence · **Level:** Expert · **Wiring:** Multimodal retrieval

Combine image regions, text and metadata while preserving original evidence locations.

Stages: Parse → Retrieve → Cross-check → Answer.

Invariant: Cross-modal claims retain region coordinates and uncertainty.

Tradeoff: OCR and visual interpretation have different failure modes; preserve originals.

Failure probe: Give conflicting OCR text and visual evidence.

State: regions, ocr_text, modality_links, source_coordinates.

Required mechanism adapters: read_scoped_media, extract_region_text, retrieve_authorized_evidence.

References: [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401), [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow).

## Memory (8)

### Reflexion adaptation

**ID:** reflexion · **Level:** Advanced · **Wiring:** Feedback loop

Store actionable feedback between bounded attempts without updating model weights.

Stages: Attempt → Feedback → Reflect → Remember.

Invariant: Stored lessons reference measured feedback and expire with scope.

Tradeoff: Incorrect reflections can become persistent bad advice.

Failure probe: Supply incorrect feedback and check quarantine before future use.

State: attempt_outcomes, feedback_lessons, lesson_scope.

Required mechanism adapters: read_memory, write_scoped_memory, validate_stage_contract.

References: [Reflexion](https://arxiv.org/abs/2303.11366).

### Episodic case memory

**ID:** episodic-memory · **Level:** Advanced · **Wiring:** Memory retrieval

Retrieve similar past cases but distinguish historical results from current evidence.

Stages: Recall → Adapt → Execute → Store.

Invariant: Historical outcomes do not count as current evidence.

Tradeoff: Similar past cases can have different governing assumptions.

Failure probe: Retrieve a superficially similar case with a different governing constraint.

State: retrieved_cases, case_differences, verified_outcome.

Required mechanism adapters: read_memory, write_scoped_memory.

References: [Reflexion](https://arxiv.org/abs/2303.11366), [MemGPT](https://arxiv.org/abs/2310.08560).

### Tiered context memory

**ID:** memory-tiers · **Level:** Expert · **Wiring:** Memory controller

Manage active context, summaries and archival records with explicit retrieval boundaries.

Stages: Inspect context → Page memory → Work → Commit.

Invariant: Paging preserves original references and enforces access scope.

Tradeoff: Summary errors compound when original records cannot be recovered.

Failure probe: Force eviction of a task-critical exception and recover it from archive.

State: active_context, archival_refs, eviction_records, context_size.

Required mechanism adapters: read_memory, write_scoped_memory, validate_stage_contract.

References: [MemGPT](https://arxiv.org/abs/2310.08560).

### Versioned skill library

**ID:** skill-library · **Level:** Expert · **Wiring:** Skill selection

Select reusable task skills with preconditions, versioning and success checks.

Stages: Select skill → Validate → Apply → Promote.

Invariant: Skill promotion requires a successful checker on the declared environment.

Tradeoff: A skill working once may fail under changed environments.

Failure probe: Run a prior skill against a changed API version.

State: skill_id, skill_version, precondition_check, skill_outcome.

Required mechanism adapters: read_skill_registry, run_scoped_skill, write_skill_registry, validate_stage_contract.

References: [Voyager](https://arxiv.org/abs/2305.16291).

### Entity graph memory

**ID:** graph-memory · **Level:** Expert · **Wiring:** Graph memory

Maintain versioned entity relations with evidence and explicit expiry.

Stages: Read graph → Reconcile → Use → Update.

Invariant: Memory updates append provenance without erasing conflicting history.

Tradeoff: Incorrect entity resolution links unrelated people or documents.

Failure probe: Create ambiguous entity matches and expired relations.

State: entity_versions, relation_sources, expiry_records, conflicts.

Required mechanism adapters: query_evidence_graph, append_evidence_graph.

References: [GraphRAG: From Local to Global](https://arxiv.org/abs/2404.16130), [MemGPT](https://arxiv.org/abs/2310.08560).

### Verified context compression

**ID:** compressed-context · **Level:** Advanced · **Wiring:** Compression

Compress long context while retaining task-critical facts and original evidence pointers.

Stages: Select → Compress → Verify → Resume.

Invariant: Compression retains governing exceptions and recoverable originals.

Tradeoff: Compression can erase exceptions or misstate evidence.

Failure probe: Hide a crucial exception in a long document and test its preservation.

State: selected_facts, summary, original_refs, summary_check.

Required mechanism adapters: read_memory, write_scoped_memory, validate_stage_contract.

References: [MemGPT](https://arxiv.org/abs/2310.08560), [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence).

### Append-only task journal

**ID:** task-journal · **Level:** Advanced · **Wiring:** Journal

Persist observable decisions, tool results and checkpoints for replay.

Stages: Observe → Decide → Journal → Replay check.

Invariant: Events append in order with stable task identity and input hashes.

Tradeoff: A journal must not silently store credentials or private raw inputs.

Failure probe: Replay after a crash and detect duplicate or mismatched inputs.

State: journal_events, sequence_number, state_versions, input_hash.

Required mechanism adapters: append_journal, read_journal, observe_scoped_tool, validate_stage_contract.

References: [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence), [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow).

### Consent-based preference memory

**ID:** preference-memory · **Level:** Intermediate · **Wiring:** Memory retrieval

Apply explicit user preferences without turning inferred behavior into permanent identity.

Stages: Reconcile → Apply → Check → Offer update.

Invariant: Only explicitly consented preferences persist across tasks.

Tradeoff: Stale preferences can override the user’s present intent.

Failure probe: Withdraw consent and verify the preference is not reused.

State: consented_preferences, preference_expiry, consent_record.

Required mechanism adapters: read_memory, write_scoped_memory, validate_stage_contract.

References: [MemGPT](https://arxiv.org/abs/2310.08560), [Multi-agent patterns](https://docs.langchain.com/oss/python/langchain/multi-agent).

## Reliability (8)

### Human approval gate

**ID:** human-gate · **Level:** Intermediate · **Wiring:** Interrupt

Pause before a consequential action and resume only with recorded approval.

Stages: Prepare → Review → Apply → Report.

Invariant: Paused work resumes only with approval for the same action and inputs.

Tradeoff: Approval for one action is not authorization for arbitrary follow-ups.

Failure probe: Change action arguments after approval and require a new check.

State: approval_request, approval_scope, approval_result.

Required mechanism adapters: request_human_review, validate_stage_contract, run_exact_approved_action.

References: [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts).

### Checkpoint and recovery

**ID:** checkpoint-recovery · **Level:** Advanced · **Wiring:** Checkpoint

Recover from failures at explicit state boundaries without repeating completed side effects.

Stages: Checkpoint → Execute → Recover → Commit.

Invariant: Recovery never repeats a completed external effect without idempotency protection.

Tradeoff: Checkpointing alone does not make external actions idempotent.

Failure probe: Crash after an effect but before acknowledgment.

State: checkpoint, state_version, idempotency_keys, retry_count.

Required mechanism adapters: save_checkpoint, load_checkpoint, run_idempotent_action, validate_stage_contract.

References: [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence).

### Deterministic tool gateway

**ID:** policy-gateway · **Level:** Advanced · **Wiring:** Policy gate

Validate proposed tools and arguments against code-enforced scope before execution.

Stages: Propose → Authorize → Execute → Audit.

Invariant: Rejected actions never reach the execution adapter.

Tradeoff: A prompt is not an access-control implementation.

Failure probe: Pass a valid-shaped action outside the authorized scope.

State: action_arguments, authorization_scope, policy_result.

Required mechanism adapters: validate_authorization, validate_stage_contract, run_authorized_tool.

References: [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow), [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts).

### Budgeted model cascade

**ID:** model-cascade · **Level:** Advanced · **Wiring:** Cascade

Use a cheaper path first and escalate from explicit failed checks rather than model confidence.

Stages: Small path → Check → Escalate → Verify.

Invariant: Escalation follows an observable failed check within budget.

Tradeoff: Self-reported confidence is a weak escalation signal.

Failure probe: Let the cheap model sound confident while failing the task checker.

State: cheap_result, acceptance_check, escalation_reason.

Required mechanism adapters: validate_stage_contract.

References: [Router](https://docs.langchain.com/oss/python/langchain/multi-agent/router), [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow).

### Verify–repair pipeline

**ID:** verify-repair · **Level:** Advanced · **Wiring:** Repair loop

Deterministic validators report localized defects for constrained repairs.

Stages: Generate → Validate → Repair → Deliver.

Invariant: Repair claims require a subsequent checker pass.

Tradeoff: Schema validity does not imply semantic correctness.

Failure probe: Cause a repair to resolve one failure while introducing another.

State: candidate, violations, repair_attempts, final_check.

Required mechanism adapters: validate_stage_contract.

References: [Self-Refine](https://arxiv.org/abs/2303.17651), [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow).

### Tool failure fallback

**ID:** fallback-path · **Level:** Intermediate · **Wiring:** Fallback

Handle timeouts, missing tools and partial results without fabricated outputs.

Stages: Primary → Classify failure → Fallback → Report.

Invariant: Fallback preserves access scope and labels degraded results.

Tradeoff: Fallbacks can change semantics; identify the alternate evidence source.

Failure probe: Try a fallback requiring broader access than the primary adapter.

State: primary_failure, fallback_compatibility, selected_path.

Required mechanism adapters: run_primary_tool, validate_stage_contract, run_compatible_fallback.

References: [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow), [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence).

### Independent review quorum

**ID:** quorum-review · **Level:** Expert · **Wiring:** Ensemble

Independent reviewers evaluate an artifact before an explicit quorum decision.

Stages: Distribute → Reviewers → Quorum → Resolve.

Invariant: Quorum rules and disagreement handling are declared before review.

Tradeoff: Correlated reviewers weaken apparent independence.

Failure probe: Return a tie and a correlated unsupported majority.

State: reviewer_votes, reviewer_evidence, quorum_rule, tie_state.

Required mechanism adapters: distribute_isolated_reviews, validate_stage_contract.

References: [Multiagent Debate](https://arxiv.org/abs/2305.14325), [Self-Consistency](https://arxiv.org/abs/2203.11171).

### Claim-level evidence audit

**ID:** evidence-audit · **Level:** Advanced · **Wiring:** Audit

Validate each consequential claim against accessible evidence before release.

Stages: Extract claims → Resolve sources → Check entailment → Repair answer.

Invariant: Every claim is individually checked for entailment and source access.

Tradeoff: Source existence is not the same as source support.

Failure probe: Cite a real source that does not support the attached claim.

State: claim_ledger, evidence_links, unsupported_claims.

Required mechanism adapters: retrieve_authorized_evidence, validate_stage_contract.

References: [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401), [Corrective RAG](https://arxiv.org/abs/2401.15884).

## Operations (4)

### Event-driven agent workflow

**ID:** event-driven · **Level:** Expert · **Wiring:** Event bus

Typed events trigger bounded handlers with deduplication and explicit state ownership.

Stages: Receive → Dispatch → Handle → Acknowledge.

Invariant: Duplicate events do not repeat completed effects.

Tradeoff: At-least-once delivery requires idempotency and careful acknowledgement.

Failure probe: Redeliver an event and supply an invalid event schema.

State: event_ids, event_schema, consumer_offsets, dead_letters.

Required mechanism adapters: read_event_queue, acknowledge_event, validate_stage_contract.

References: [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow), [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence).

### Compensating workflow

**ID:** saga · **Level:** Expert · **Wiring:** Saga

Sequence external steps with explicit compensation and human escalation.

Stages: Prepare → Execute → Compensate → Report.

Invariant: Compensation runs only for completed effects and reports incomplete recovery.

Tradeoff: Compensation is not guaranteed rollback; some actions are irreversible.

Failure probe: Fail a late step and then fail a compensating action.

State: completed_steps, compensation_stack, compensation_results.

Required mechanism adapters: run_authorized_compensation, validate_stage_contract, run_idempotent_authorized_action.

References: [Sagas](https://www.cs.princeton.edu/research/techreps/598), [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow), [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence).

### Dynamic specialist roster

**ID:** dynamic-team · **Level:** Expert · **Wiring:** Selector

Select the next specialist from task state rather than a fixed speaking order.

Stages: Inspect → Select → Contribute → Update.

Invariant: Role selection respects declared capabilities and a termination condition.

Tradeoff: Selection can repeatedly favor the same specialist and leave gaps.

Failure probe: Select an unavailable specialist and test repeated role cycling.

State: available_roles, role_selection, participation_history.

Required mechanism adapters: validate_stage_contract, join_stage_artifacts.

References: [Selector Group Chat](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/selector-group-chat.html), [Multi-agent patterns](https://docs.langchain.com/oss/python/langchain/multi-agent).

### Contract-based task allocation

**ID:** contract-team · **Level:** Expert · **Wiring:** Contract net

Allocate scoped work through offers and checked acceptance contracts.

Stages: Announce → Offers → Award → Accept result.

Invariant: The awarded contract fixes scope, budget and success conditions.

Tradeoff: A capability claim must be checked against the actual tool registry.

Failure probe: Return an attractive bid that cannot satisfy mandatory preconditions.

State: task_offer, bids, awarded_contract, result_checks.

Required mechanism adapters: validate_stage_contract.

References: [The Contract Net Protocol](https://reidgsmith.com/The_Contract_Net_Protocol_Dec-1980.pdf), [Multi-agent patterns](https://docs.langchain.com/oss/python/langchain/multi-agent), [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow).
