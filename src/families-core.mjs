// Original blueprints; source references do not assert that these domain presets were benchmarked.
export const define=(id,name,category,level,topology,refs,summary,stages,edges,tradeoff,settings={})=>({id,name,category,level,topology,refs:refs.split(','),summary,stages:stages.map((s,i)=>{const [name,kind,instruction]=s.split('|');return {id:'n'+i,name,kind,instruction};}),edges:edges.split(';').map(e=>{const [route,condition='always']=e.split(':');const [from,to]=route.split('>');return {from:'n'+from,to:'n'+to,condition};}),tradeoff,settings,origin:'Editorial adaptation'});
const d=define;
export const coreFamilies=[
d('chain','Prompt chain','Workflows','Basic','Sequence','effective,workflows','A fixed sequence transforms a request through inspectable intermediate artifacts.',[
'Extract|llm|Extract constraints and normalize the input.',
'Transform|llm|Produce a result from normalized inputs without adding unsupported facts.',
'Validate|gate|Check required fields and content against the rubric.',
'Deliver|llm|Format the checked result and retain unresolved issues.'
],'0>1;1>2;2>3:checked','Early mistakes propagate; test content, not only format.'),
d('router','Task router','Workflows','Basic','Router','effective,router','Classify a request and send it to a scoped handler.',[
'Classify|llm|Choose a declared route or explicitly return unknown.',
'Specialist|llm|Use only route-specific inputs and tools.',
'Check|gate|Verify route-specific output and escalation rules.',
'Respond|llm|Return the result or ask for missing routing information.'
],'0>1:known;0>3:unknown;1>2;2>3','Misrouting is an upstream failure. Evaluate it separately.'),
d('parallel-sections','Parallel sections','Workflows','Intermediate','Fan-out','effective,workflows','Independent sections run concurrently and merge without shared mutable context.',[
'Partition|llm|Create non-overlapping sections with output contracts.',
'Workers|llm|Process each section independently with attached evidence.',
'Merge|merge|Wait for required sections and expose failed workers.',
'Audit|gate|Check coverage and conflicting conclusions.'
],'0>1;1>2:workers_complete;2>3','Parallelism increases total cost when context is duplicated.',{replicas:3}),
d('parallel-vote','Parallel voting','Workflows','Intermediate','Ensemble','effective,consistency','Normalize independent candidate answers before counting agreement.',[
'Candidates|llm|Generate independent candidates without sharing drafts.',
'Normalize|tool|Canonicalize final answers while retaining originals.',
'Vote|merge|Count agreement, ties and disagreement.',
'Check|gate|Use external validity checks before accepting a winner.'
],'0>1;1>2;2>3','Agreement is not calibrated confidence.',{replicas:5}),
d('map-reduce','Map-reduce synthesis','Workflows','Intermediate','Fan-out','mapreduce-paper,workflows,custom','Extract local records from chunks and reduce them into a global result.',[
'Chunk|tool|Split input with stable offsets and boundary overlap.',
'Map|llm|Extract findings and references from each chunk.',
'Reduce|merge|Deduplicate records and preserve conflicting evidence.',
'Verify|gate|Check omitted cross-chunk relationships.'
],'0>1;1>2:all_chunks_complete;2>3','Chunking can lose relationships spanning boundaries.',{replicas:4}),
d('evaluator-optimizer','Evaluator–optimizer','Workflows','Intermediate','Loop','effective,selfrefine','A separate rubric-based evaluator guides bounded revisions.',[
'Draft|llm|Create a candidate with evidence and explicit constraints.',
'Evaluate|llm|Return localized actionable violations against a fixed rubric.',
'Revise|llm|Repair violations without changing correct material.',
'Deliver|gate|Stop on success or exhausted revision budget.'
],'0>1;1>2:violations;2>1:budget_remaining;1>3:pass_or_budget','A weak evaluator rewards superficial improvement.',{iterations:3}),
d('orchestrator-workers','Orchestrator–workers','Workflows','Advanced','Supervisor','effective,research-team','Discover subtasks dynamically and dispatch bounded work orders.',[
'Orchestrate|llm|Create scoped subtasks with budgets and acceptance criteria.',
'Workers|llm|Return typed findings, evidence and explicit failures.',
'Integrate|merge|Join outputs and identify uncovered requirements.',
'Review|gate|Deliver or request one bounded follow-up.'
],'0>1;1>2:complete;2>3;3>0:gap_and_budget','Poor delegation creates duplication and integration overhead.',{replicas:3,iterations:2}),
d('state-machine','Explicit state machine','Workflows','Intermediate','State machine','custom,persist','Deterministic state transitions make execution inspectable and resumable.',[
'Intake|gate|Validate inputs and initialize versioned state.',
'Process|llm|Read and change only fields allowed in this state.',
'Transition|gate|Apply declared predicates and reject invalid transitions.',
'Finalize|tool|Persist final state with transition evidence.'
],'0>1:valid;1>2;2>1:more_work;2>3:terminal','Rigid states need explicit exception and escalation routes.'),
d('tree-of-thoughts','Tree of Thoughts','Reasoning','Advanced','Tree search','tot','Explore partial solutions and retain a bounded search frontier.',[
'Expand|llm|Propose distinct next states from the active frontier.',
'Evaluate|llm|Assess feasibility using the task criteria.',
'Select|tool|Prune duplicates and retain parent-linked frontier states.',
'Resolve|llm|Return a checked terminal result or unresolved outcome.'
],'0>1;1>2;2>0:depth_remaining;2>3:terminal_or_budget','Model value estimates may prefer plausible wrong branches.',{branches:3,iterations:3}),
d('graph-of-thoughts','Graph of Thoughts','Reasoning','Expert','Graph search','got','Reuse, merge and refine compatible intermediate results in a dependency graph.',[
'Branch|llm|Create candidate records with stable dependency IDs.',
'Aggregate|merge|Merge compatible records while retaining provenance.',
'Refine|llm|Revise records against cited upstream results.',
'Evaluate|gate|Check dependencies and select a supported final artifact.'
],'0>1;1>2;2>3;3>0:unresolved_and_budget','Merging incompatible assumptions silently corrupts results.',{branches:3,iterations:2}),
d('self-consistency','Self-consistency','Reasoning','Intermediate','Ensemble','consistency','Sample independent solutions and aggregate normalized final answers.',[
'Sample|llm|Generate independent solutions with varied seeds.',
'Extract|tool|Canonicalize candidate final answers.',
'Aggregate|merge|Select the modal answer and expose alternative counts.',
'Validate|gate|Check actual correctness independently of consistency.'
],'0>1;1>2;2>3','Open-ended tasks need a defensible normalization contract.',{replicas:5,temperature:0.7}),
d('least-to-most','Least-to-most','Reasoning','Intermediate','Sequence','least','Solve ordered subproblems using validated earlier results.',[
'Decompose|llm|Identify minimal subproblems in dependency order.',
'Solve|llm|Solve the next subproblem from checked previous results.',
'Check|gate|Validate and store the subresult and assumptions.',
'Combine|llm|Assemble checked subresults into a final artifact.'
],'0>1;1>2;2>1:remaining;2>3:all_checked','Faulty decomposition can omit the real problem.',{iterations:5}),
d('program-aided','Program-aided reasoning','Reasoning','Advanced','Tool loop','pal','A model specifies a small program; an isolated interpreter performs computation.',[
'Specify|llm|Define typed variables, units and expected calculations.',
'Program|llm|Write minimal code for the declared sandbox interface.',
'Execute|tool|Run with no network and strict resource limits.',
'Interpret|llm|Explain actual returned values and assumptions.'
],'0>1;1>2;2>3:success;2>1:repair_and_budget','Correct execution cannot repair an incorrectly specified calculation.',{iterations:2}),
d('self-refine','Self-Refine','Reasoning','Intermediate','Loop','selfrefine','Generate, critique and revise with a bounded single-model loop.',[
'Generate|llm|Create an artifact satisfying the supplied brief.',
'Critique|llm|List defects with locations and concrete changes.',
'Refine|llm|Apply targeted revisions preserving original intent.',
'Stop|gate|Stop on success, no progress or exhausted budget.'
],'0>1;1>2;2>3;3>1:improving_and_budget','Self-critique may reinforce the same model bias.',{iterations:3}),
d('step-back','Step-back abstraction','Reasoning','Advanced','Sequence','stepback','Ground a general principle before applying it to a concrete case.',[
'Abstract|llm|Identify relevant concepts without presupposing the answer.',
'Ground|retrieve|Find evidence for principle and case separately.',
'Apply|llm|Connect the principle while preserving case-specific exceptions.',
'Check|gate|Reject answers supported only by broad analogy.'
],'0>1;1>2;2>3','Abstraction can erase important exceptions.'),
d('self-discover','Self-Discover adaptation','Reasoning','Expert','Meta-plan','discover','Select reasoning modules and compose a task-specific execution structure.',[
'Select|llm|Choose modules from an explicit finite library.',
'Adapt|llm|Specialize modules into task steps and checks.',
'Structure|gate|Validate dependencies and the typed plan.',
'Execute|llm|Follow the checked plan with concise evidence summaries.'
],'0>1;1>2;2>3','Module selection is another fallible inference step.'),
d('supervisor','Specialist supervisor','Multi-agent','Advanced','Supervisor','subagents,multi','A manager selects specialists and integrates their bounded outputs.',[
'Dispatch|llm|Send a minimally scoped work order to a selected specialist.',
'Specialist|llm|Return typed results using only allowed tools.',
'Supervisor|llm|Integrate results and request material missing details.',
'Complete|gate|Check original-task coverage and terminate.'
],'0>1;1>2;2>0:gap_and_budget;2>3:complete','A manager can become a bottleneck or distort specialist evidence.',{replicas:3,iterations:3}),
d('handoff','Specialist handoff','Multi-agent','Intermediate','Handoff','handoffs','Move control to a specialist with explicit state ownership.',[
'Triage|llm|Select the specialist and minimal transfer record.',
'Handoff|gate|Validate ownership and permitted state fields.',
'Specialist|llm|Continue without inheriting unnecessary history.',
'Resolve|gate|Finish or route to the declared escalation owner.'
],'0>1;1>2;2>3','Unbounded transfers create loops and leak context.'),
d('debate','Bounded agent debate','Multi-agent','Advanced','Debate','debate','Challenge independent proposals before evidence-based selection.',[
'Propose|llm|Generate independent answers with evidence and assumptions.',
'Challenge|llm|Identify a localized weakness in another proposal.',
'Revise|llm|Respond to valid critiques and retain disagreements.',
'Judge|gate|Select against external checks and show unresolved disputes.'
],'0>1;1>2;2>1:round_remaining;2>3:round_limit','Discussion can create correlated agreement without correctness.',{replicas:3,iterations:2}),
d('role-crew','Sequential role crew','Multi-agent','Intermediate','Sequence','crew,crewai','Different roles own successive artifacts and handoff contracts.',[
'Investigate|llm|Gather findings with evidence.',
'Produce|llm|Build an artifact from the investigator record.',
'Review|llm|Apply a rubric and return a precise change list.',
'Deliver|gate|Check handoff contracts and final constraints.'
],'0>1;1>2;2>3','Role names do not create expertise without distinct inputs and checks.'),
d('blackboard','Shared blackboard','Multi-agent','Expert','Blackboard','blackboard-paper,custom,autogen','Specialists contribute typed facts under a deterministic shared-state scheduler.',[
'Schedule|gate|Choose a contributor from missing facts and state version.',
'Contribute|llm|Propose a sourced fact without overwriting other records.',
'Commit|tool|Append with schema validation and version checking.',
'Resolve|merge|Resolve dependencies or schedule another bounded contribution.'
],'0>1;1>2;2>3;3>0:missing_and_budget','Concurrent writers need conflict handling and version control.',{replicas:3,iterations:4}),
d('hierarchical-team','Hierarchical teams','Multi-agent','Expert','Hierarchy','crew,research-team','A coordinator delegates to leads who manage scoped specialist groups.',[
'Coordinator|llm|Assign independently owned team objectives.',
'Team leads|llm|Allocate specialist budgets and output contracts.',
'Specialists|llm|Return scoped findings with source references.',
'Integrate|merge|Merge team summaries preserving evidence and gaps.'
],'0>1;1>2;2>1:subtask_gap;1>3:team_complete','Extra coordination layers can compress away crucial evidence.',{replicas:4,iterations:2}),
d('mixture-of-agents','Mixture-of-Agents adaptation','Multi-agent','Expert','Layered ensemble','mixture','Aggregate diverse candidate layers into a revised answer.',[
'Proposers|llm|Create independent candidates using a diverse roster.',
'Aggregate|llm|Synthesize supported claims and retain alternatives.',
'Refine layer|llm|Revise the synthesis using another bounded layer.',
'Validate|gate|Check support independently of the aggregation model.'
],'0>1;1>2;2>3','Several models can amplify shared misconceptions.',{replicas:3,iterations:2}),
d('research-swarm','Coordinator research swarm','Multi-agent','Expert','Supervisor','research-team','Assign disjoint research leads and audit evidence before synthesis.',[
'Lead|llm|Define leads, source requirements and worker budgets.',
'Investigators|llm|Return compact source-backed finding ledgers.',
'Citation audit|gate|Check evidence, duplicates and uncovered claims.',
'Synthesis|llm|Write a coherent brief preserving contradictions.'
],'0>1;1>2;2>0:gaps_and_budget;2>3:coverage_sufficient','Open-ended research needs coverage and budget stops.',{replicas:4,iterations:2}),
d('basic-rag','Grounded retrieval','Retrieval','Basic','Retrieval','rag','Retrieve passages and answer with exact source references.',[
'Query|llm|Prepare a query and document access scope.',
'Retrieve|retrieve|Return passages with IDs and versions.',
'Answer|llm|Answer only from the retrieved evidence.',
'Check|gate|Validate citations and abstain on evidence gaps.'
],'0>1;1>2;2>3','Missed or wrong-version passages directly affect answers.',{topK:6}),
d('hybrid-rag','Hybrid retrieval + reranking','Retrieval','Intermediate','Retrieval','contextual','Combine exact-term and semantic search before reranking evidence.',[
'Search|retrieve|Run lexical and dense search in the same access scope.',
'Fuse|merge|Deduplicate and combine ranked lists.',
'Rerank|tool|Apply the configured reranker, preserving metadata.',
'Answer|llm|Cite selected passages and disclose gaps.'
],'0>1;1>2;2>3','Reranking cannot recover documents missed by both search methods.',{topK:8,replicas:2}),
d('corrective-rag','Corrective RAG adaptation','Retrieval','Advanced','Conditional retrieval','crag','Grade evidence and perform a bounded alternate retrieval when necessary.',[
'Retrieve|retrieve|Fetch the initial authorized evidence.',
'Grade|llm|Classify it as sufficient, incomplete or irrelevant.',
'Correct|retrieve|Rewrite the query or search an authorized alternate corpus.',
'Answer|llm|Answer from checked evidence or report missing support.'
],'0>1;1>2:insufficient;2>1:retry_remaining;1>3:sufficient_or_budget','A faulty grader can accept weak evidence.',{iterations:2,topK:8}),
d('self-rag','Self-RAG-inspired critique','Retrieval','Advanced','Loop','selfrag','A prompted controller decides when retrieval is needed and checks claim support.',[
'Need evidence|llm|Decide whether available context supports the question.',
'Retrieve|retrieve|Fetch necessary access-scoped evidence.',
'Draft|llm|Draft with claim-to-passage references.',
'Critique|gate|Request focused retrieval if claims remain unsupported.'
],'0>1:needed;0>2:context_sufficient;1>2;2>3;3>1:unsupported_and_budget','A prompted adaptation does not reproduce the paper’s trained reflection tokens.',{iterations:2}),
d('graph-rag','GraphRAG adaptation','Retrieval','Expert','Graph retrieval','graphrag','Retrieve entities and community summaries with passage-level provenance.',[
'Scope|llm|Select local entity or corpus-level evidence.',
'Graph search|retrieve|Find allowed entities, edges and community summaries.',
'Expand|retrieve|Resolve graph claims to original passages.',
'Synthesize|llm|Answer with source citations and version checks.'
],'0>1;1>2;2>3','Extraction errors and stale summaries can distort graph evidence.',{topK:12}),
d('raptor','RAPTOR-inspired tree retrieval','Retrieval','Expert','Hierarchical retrieval','raptor','Search summary depths and ground broad summaries in original leaves.',[
'Choose depth|llm|Choose broad or fine-grained retrieval.',
'Tree search|retrieve|Query the access-filtered summary tree.',
'Expand leaves|retrieve|Resolve promising nodes to source passages.',
'Answer|llm|Combine broad structure with leaf citations.'
],'0>1;1>2;2>3','Lossy summaries hide exceptions; original leaves must remain available.',{topK:10}),
d('hyde','HyDE retrieval adaptation','Retrieval','Advanced','Retrieval','hyde','Use a hypothetical document for search while excluding it from evidence.',[
'Hypothesize|llm|Create hypothetical text solely as a search aid.',
'Search|retrieve|Search the real corpus using its embedding.',
'Filter|gate|Exclude hypothetical text from the evidence set.',
'Answer|llm|Use only real passage references.'
],'0>1;1>2;2>3','A hypothetical answer can steer retrieval toward a false premise.',{topK:8}),
d('contextual-rag','Contextual chunk retrieval','Retrieval','Advanced','Retrieval','contextual','Index chunks with context while keeping original passages as evidence.',[
'Index context|tool|Prepare document-scoped chunk descriptions offline.',
'Retrieve|retrieve|Search contextualized chunks with access filtering.',
'Rerank|tool|Resolve ranked hits to unmodified original passages.',
'Answer|llm|Cite original text rather than generated chunk context.'
],'0>1;1>2;2>3','Generated indexing context can be inaccurate.',{topK:8})
];
