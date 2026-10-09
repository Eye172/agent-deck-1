import {define as d} from './families-core.mjs';
export const advancedFamilies=[
d('reflexion','Reflexion adaptation','Memory','Advanced','Feedback loop','reflexion','Store actionable feedback between bounded attempts without updating model weights.',[
'Attempt|llm|Solve the task using checked memory from earlier attempts.',
'Feedback|gate|Measure outcome against the task checker.',
'Reflect|llm|Write a specific lesson tied to actual failure evidence.',
'Remember|memory|Store the lesson with task scope and an expiry.'
],'0>1;1>2:failed;2>3;3>0:attempt_remaining','Incorrect reflections can become persistent bad advice.',{iterations:3}),
d('episodic-memory','Episodic case memory','Memory','Advanced','Memory retrieval','reflexion,memgpt','Retrieve similar past cases but distinguish historical results from current evidence.',[
'Recall|memory|Retrieve access-scoped cases by task and verified outcome.',
'Adapt|llm|Identify differences from the current case.',
'Execute|llm|Produce a result using current inputs, not copied past conclusions.',
'Store|memory|Persist only an outcome-checked minimal case summary.'
],'0>1;1>2;2>3','Similar past cases can have different governing assumptions.'),
d('memory-tiers','Tiered context memory','Memory','Expert','Memory controller','memgpt','Manage active context, summaries and archival records with explicit retrieval boundaries.',[
'Inspect context|gate|Check context size and relevance of active records.',
'Page memory|memory|Load required archival records or evict low-value records.',
'Work|llm|Operate on the active evidence with stable archival references.',
'Commit|memory|Persist a minimal summary and verified pointers.'
],'0>1;1>2;2>3;3>0:context_pressure','Summary errors compound when original records cannot be recovered.'),
d('skill-library','Versioned skill library','Memory','Expert','Skill selection','voyager','Select reusable task skills with preconditions, versioning and success checks.',[
'Select skill|memory|Retrieve a candidate skill by preconditions and verified history.',
'Validate|gate|Check version, input types and permitted tool scope.',
'Apply|tool|Execute through the declared sandboxed skill adapter.',
'Promote|memory|Store a new skill version only after successful checks.'
],'0>1;1>2:compatible;2>3:verified','A skill working once may fail under changed environments.'),
d('graph-memory','Entity graph memory','Memory','Expert','Graph memory','graphrag,memgpt','Maintain versioned entity relations with evidence and explicit expiry.',[
'Read graph|memory|Retrieve scoped entities and relevant provenance.',
'Reconcile|llm|Separate new evidence from conflicting prior relations.',
'Use|llm|Answer from current evidence and unresolved relation conflicts.',
'Update|memory|Append checked relations without erasing conflicting history.'
],'0>1;1>2;2>3','Incorrect entity resolution links unrelated people or documents.'),
d('compressed-context','Verified context compression','Memory','Advanced','Compression','memgpt,persist','Compress long context while retaining task-critical facts and original evidence pointers.',[
'Select|gate|Identify fields needed for future task steps.',
'Compress|llm|Summarize selected facts with immutable original references.',
'Verify|gate|Compare summary claims against original records.',
'Resume|llm|Continue from checked context and retrieve originals when needed.'
],'0>1;1>2;2>1:summary_invalid_and_budget;2>3:verified','Compression can erase exceptions or misstate evidence.',{iterations:2}),
d('task-journal','Append-only task journal','Memory','Advanced','Journal','persist,custom','Persist observable decisions, tool results and checkpoints for replay.',[
'Observe|tool|Record the input hash and actual tool outputs.',
'Decide|llm|Choose the next scoped action with a concise evidence summary.',
'Journal|memory|Append action, result, timestamp and state version.',
'Replay check|gate|Check that the journal reconstructs required state.'
],'0>1;1>2;2>3;3>0:task_remaining','A journal must not silently store credentials or private raw inputs.'),
d('preference-memory','Consent-based preference memory','Memory','Intermediate','Memory retrieval','memgpt,multi','Apply explicit user preferences without turning inferred behavior into permanent identity.',[
'Reconcile|memory|Load consented preferences and their source.',
'Apply|llm|Adapt output to relevant preferences only.',
'Check|gate|Ensure the current request takes precedence.',
'Offer update|memory|Propose a preference update; persist only after consent.'
],'0>1;1>2;2>3','Stale preferences can override the user’s present intent.'),
d('human-gate','Human approval gate','Reliability','Intermediate','Interrupt','interrupts','Pause before a consequential action and resume only with recorded approval.',[
'Prepare|llm|Build a concrete action proposal and its expected effect.',
'Review|gate|Show the proposal and await approval or rejection.',
'Apply|tool|Execute only the exact approved action through the adapter.',
'Report|gate|Verify the observable outcome and preserve the decision record.'
],'0>1;1>2:approved;1>3:rejected;2>3','Approval for one action is not authorization for arbitrary follow-ups.'),
d('checkpoint-recovery','Checkpoint and recovery','Reliability','Advanced','Checkpoint','persist','Recover from failures at explicit state boundaries without repeating completed side effects.',[
'Checkpoint|memory|Persist state and completed action IDs before advancing.',
'Execute|tool|Run an idempotent bounded action.',
'Recover|gate|Inspect failure state and retry only incomplete actions.',
'Commit|memory|Mark actual completion with result evidence.'
],'0>1;1>2:failure;2>1:retry_allowed;1>3:success','Checkpointing alone does not make external actions idempotent.',{iterations:2}),
d('policy-gateway','Deterministic tool gateway','Reliability','Advanced','Policy gate','custom,interrupts','Validate proposed tools and arguments against code-enforced scope before execution.',[
'Propose|llm|Propose a typed tool call with evidence for necessity.',
'Authorize|gate|Validate tool, path, permissions and action scope.',
'Execute|tool|Run only validated arguments through the adapter.',
'Audit|gate|Check the result and log allowed or rejected actions.'
],'0>1;1>2:allowed;1>3:denied;2>3','A prompt is not an access-control implementation.'),
d('model-cascade','Budgeted model cascade','Reliability','Advanced','Cascade','router,custom','Use a cheaper path first and escalate from explicit failed checks rather than model confidence.',[
'Small path|llm|Produce a bounded candidate with a low-cost model role.',
'Check|gate|Evaluate against externally defined correctness conditions.',
'Escalate|llm|Use a stronger model only for unresolved failed checks.',
'Verify|gate|Apply the same acceptance criteria to the escalated result.'
],'0>1;1>2:failed_and_budget;1>3:passed;2>3','Self-reported confidence is a weak escalation signal.'),
d('verify-repair','Verify–repair pipeline','Reliability','Advanced','Repair loop','selfrefine,custom','Deterministic validators report localized defects for constrained repairs.',[
'Generate|llm|Return the artifact in the declared format.',
'Validate|gate|Run schema and task-specific validators.',
'Repair|llm|Repair only the listed defects using original constraints.',
'Deliver|gate|Revalidate and expose any remaining failures.'
],'0>1;1>2:failed;2>1:repair_remaining;1>3:pass_or_budget','Schema validity does not imply semantic correctness.',{iterations:2}),
d('fallback-path','Tool failure fallback','Reliability','Intermediate','Fallback','custom,persist','Handle timeouts, missing tools and partial results without fabricated outputs.',[
'Primary|tool|Call the intended tool with a timeout.',
'Classify failure|gate|Distinguish retryable, unavailable and forbidden outcomes.',
'Fallback|tool|Use an explicitly allowed alternate or return partial evidence.',
'Report|llm|Explain degradation and what could not be verified.'
],'0>1:failed;0>3:success;1>2:allowed_fallback;1>3:no_fallback;2>3','Fallbacks can change semantics; identify the alternate evidence source.'),
d('quorum-review','Independent review quorum','Reliability','Expert','Ensemble','debate,consistency','Independent reviewers evaluate an artifact before an explicit quorum decision.',[
'Distribute|tool|Provide the same artifact and rubric to isolated reviewers.',
'Reviewers|llm|Return criterion-level findings without seeing other reviews.',
'Quorum|gate|Apply the declared voting rule and retain dissent.',
'Resolve|llm|Repair supported defects or escalate unresolved disputes.'
],'0>1;1>2;2>3','Correlated reviewers weaken apparent independence.',{replicas:3}),
d('evidence-audit','Claim-level evidence audit','Reliability','Advanced','Audit','rag,crag','Validate each consequential claim against accessible evidence before release.',[
'Extract claims|llm|List atomic factual claims in the candidate artifact.',
'Resolve sources|retrieve|Resolve each cited passage and access scope.',
'Check entailment|gate|Test whether the passage actually supports the claim.',
'Repair answer|llm|Remove unsupported claims and preserve uncertainty.'
],'0>1;1>2;2>3','Source existence is not the same as source support.'),
d('react','ReAct tool loop','Planning','Intermediate','Tool loop','react','Choose an action, observe its outcome and adapt the next step.',[
'Decide|llm|Choose the next allowed action or finish from current evidence.',
'Act|tool|Execute validated arguments and capture actual observations.',
'Observe|gate|Check tool success, new evidence and remaining budget.',
'Answer|llm|Deliver a concise evidence-based result.'
],'0>1:action_needed;0>3:complete;1>2;2>0:budget_remaining;2>3:budget_exhausted','Long loops accumulate context and tool errors.',{iterations:6}),
d('plan-execute','Plan and execute','Planning','Advanced','Plan loop','planning','Build a dependency-aware plan and replan only when observations invalidate it.',[
'Plan|llm|Define steps, dependencies and measurable completion criteria.',
'Execute|tool|Perform the next permitted step.',
'Replan|llm|Revise remaining steps from actual observations.',
'Complete|gate|Verify the original objective or return partial progress.'
],'0>1;1>2;2>1:steps_remaining;2>3:complete_or_budget','A plausible initial plan may rely on nonexistent tools.',{iterations:5}),
d('rewoo','ReWOO adaptation','Planning','Advanced','Evidence plan','rewoo,planning','Plan evidence references first, resolve tool dependencies and synthesize once.',[
'Planner|llm|Create named evidence requests and dependency references.',
'Worker|tool|Resolve requests in dependency order.',
'Solver|llm|Synthesize using actual evidence records.',
'Validate|gate|Check unresolved references and final claims.'
],'0>1;1>2:dependencies_resolved;2>3','Preplanned calls struggle with unexpected tool observations.'),
d('llmcompiler','LLMCompiler adaptation','Planning','Expert','DAG scheduler','compiler,planning','Dispatch independent tool calls as dependency-ready tasks in an explicit DAG.',[
'Compile|llm|Emit a typed acyclic plan of calls and dependencies.',
'Schedule|gate|Dispatch only nodes whose dependencies are complete.',
'Execute|tool|Run ready tasks concurrently with resource limits.',
'Join|merge|Resolve outputs and return checked results or a bounded replan.'
],'0>1;1>2;2>1:pending_tasks;1>3:all_resolved','Incorrect dependency declarations cause races or invalid parallelism.',{replicas:4}),
d('lats','Language Agent Tree Search','Planning','Expert','Monte Carlo search','lats','Explore actions with rollout feedback and a bounded search tree.',[
'Select node|tool|Select a frontier state using the configured exploration rule.',
'Expand action|llm|Propose legal actions from the selected state.',
'Rollout|tool|Evaluate in a resettable sandbox with real outcome feedback.',
'Backpropagate|gate|Update node values and retain a checked best trajectory.'
],'0>1;1>2;2>3;3>0:search_budget','Search requires resettable state; irreversible actions cannot be safely rolled back.',{branches:3,iterations:8}),
d('budget-planner','Budget-aware planner','Planning','Expert','Budget scheduler','planning,compiler','Choose the next work item against remaining cost, time and evidence value.',[
'Estimate|llm|Estimate task value and uncertainty as planning heuristics.',
'Budget gate|gate|Apply remaining call, step and time limits.',
'Execute|tool|Perform one permitted work item and measure actual usage.',
'Reconcile|gate|Update budgets and stop or choose the next item.'
],'0>1;1>2:within_budget;2>3;3>0:work_and_budget','Estimated value and cost are not measured utility; reconcile actual usage.'),
d('hierarchical-plan','Hierarchical task decomposition','Planning','Expert','Hierarchy','planning,custom','Refine high-level objectives into checked subplans with preconditions.',[
'Decompose|llm|Propose high-level methods and their required preconditions.',
'Validate methods|gate|Check method feasibility and declared dependencies.',
'Refine|llm|Expand the chosen method into bounded executable steps.',
'Execute|tool|Run permitted steps and report precondition failures.'
],'0>1;1>2:feasible;2>3;3>0:precondition_changed','This composition needs a real method library; free-form subplans are not formal HTN proofs.'),
d('sandbox-lookahead','Sandbox lookahead planner','Planning','Expert','World-model loop','lats,webarena','Compare action proposals in a disposable environment before selecting a real step.',[
'Observe|tool|Capture a versioned environment state.',
'Propose|llm|Generate candidate actions with explicit preconditions.',
'Simulate|tool|Evaluate candidates in an isolated resettable environment.',
'Select|gate|Choose a checked action; require separate approval for real-world effects.'
],'0>1;1>2;2>3;3>0:next_step','Simulation-to-reality mismatch can invalidate the chosen action.',{branches:3}),
d('adaptive-rag','Adaptive retrieval routing','Retrieval','Expert','Router','adaptive,router','Route between supplied context, single retrieval and iterative evidence gathering.',[
'Assess|llm|Classify evidence needs using a fixed rule-based rubric.',
'Route|gate|Select no retrieval, single retrieval or an iterative subworkflow.',
'Gather|retrieve|Execute the selected access-scoped evidence path.',
'Answer|llm|Return grounded output and report the selected path.'
],'0>1;1>2:retrieval_needed;1>3:context_sufficient;2>3','The original paper trains a router; this is an explicitly prompted adaptation.'),
d('multi-query','Multi-query retrieval','Retrieval','Advanced','Fan-out','contextual,router','Search diverse query formulations and deduplicate their evidence.',[
'Rewrite|llm|Generate distinct formulations without changing user intent.',
'Search|retrieve|Retrieve for each formulation under the same access policy.',
'Merge|merge|Deduplicate hits by document and passage version.',
'Answer|llm|Use combined real passages with exact citations.'
],'0>1;1>2:queries_complete;2>3','Query expansion may drift from the original question.',{replicas:3,topK:10}),
d('rank-fusion','Reciprocal rank fusion','Retrieval','Advanced','Rank fusion','rrf-paper,contextual,custom','Combine independent ranked evidence lists using a declared deterministic fusion rule.',[
'Search lists|retrieve|Get ranked results from each configured search path.',
'Fuse ranks|tool|Apply reciprocal rank fusion with a stated constant.',
'Check passages|gate|Check provenance, access and duplicate versions.',
'Answer|llm|Answer from fused evidence and retain passage IDs.'
],'0>1;1>2;2>3','Ranks from poor retrievers still yield poor fused results.',{replicas:3,topK:10,rrfK:60}),
d('multimodal-evidence','Multimodal evidence retrieval','Retrieval','Expert','Multimodal retrieval','rag,custom','Combine image regions, text and metadata while preserving original evidence locations.',[
'Parse|tool|Extract text and image-region references without discarding originals.',
'Retrieve|retrieve|Search accessible text and image evidence with modality labels.',
'Cross-check|llm|Compare OCR text with original regions and flag ambiguity.',
'Answer|llm|Cite passage or region IDs and avoid unsupported visual claims.'
],'0>1;1>2;2>3','OCR and visual interpretation have different failure modes; preserve originals.'),
d('event-driven','Event-driven agent workflow','Operations','Expert','Event bus','custom,persist','Typed events trigger bounded handlers with deduplication and explicit state ownership.',[
'Receive|tool|Validate event schema, source and deduplication key.',
'Dispatch|gate|Select an authorized handler and reserve state ownership.',
'Handle|llm|Produce a typed result without unapproved side effects.',
'Acknowledge|tool|Persist actual completion before acknowledging delivery.'
],'0>1;1>2;2>3','At-least-once delivery requires idempotency and careful acknowledgement.'),
d('saga','Compensating workflow','Operations','Expert','Saga','saga-paper,custom,persist','Sequence external steps with explicit compensation and human escalation.',[
'Prepare|gate|Validate preconditions and compensation coverage.',
'Execute|tool|Run only authorized idempotent actions.',
'Compensate|tool|Apply declared compensation for completed steps after failure.',
'Report|gate|Verify final state and escalate irreversible partial outcomes.'
],'0>1;1>2:failure;1>3:success;2>3','Compensation is not guaranteed rollback; some actions are irreversible.'),
d('dynamic-team','Dynamic specialist roster','Operations','Expert','Selector','selector,multi','Select the next specialist from task state rather than a fixed speaking order.',[
'Inspect|gate|Compute missing requirements and eligible specialist scopes.',
'Select|llm|Choose an eligible specialist with a concrete work order.',
'Contribute|llm|Return a bounded typed result and completion evidence.',
'Update|merge|Integrate contributions and terminate on objective or budget.'
],'0>1;1>2;2>3;3>0:gap_and_budget','Selection can repeatedly favor the same specialist and leave gaps.',{replicas:4,iterations:5}),
d('contract-team','Contract-based task allocation','Operations','Expert','Contract net','contractnet-paper,multi,custom','Allocate scoped work through offers and checked acceptance contracts.',[
'Announce|llm|Publish a typed subtask with inputs, limits and acceptance criteria.',
'Offers|llm|Return eligible capability offers without claiming nonexistent tools.',
'Award|gate|Choose a feasible offer under the task budget.',
'Accept result|gate|Check contractual evidence and reallocate failed work only within budget.'
],'0>1;1>2;2>3;3>0:failed_and_budget','A capability claim must be checked against the actual tool registry.',{replicas:3})
];
