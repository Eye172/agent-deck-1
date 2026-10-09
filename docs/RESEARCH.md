# Research notes: an agent architecture catalog

Research window: 8–9 October 2026. These notes synthesize selected primary papers, official engineering documentation, repository descriptions and relevant book material. They do not claim a complete reading of every book, reproduction of experiments, or measured performance for our presets.

## Product conclusion

Build inspectable specifications: explain the mechanism, state, adapters, stop conditions, failures and evaluation. A generic system prompt alone cannot express scheduling, persistent memory, checkpoints or search trees.

The collection contains 64 mechanism families, 46 wiring labels, eight editorial categories and six domain contracts. A family combined with a domain is an application preset, not a new scientific architecture. Both counts appear in the interface.

## ReasonMaxxer: the starting reference

The supplied [Arka04bro reference](https://github.com/Arka04bro/ReasonMaxxer) was the starting link. It could not be fetched again during the 9 October audit (browser fetch returned a cache miss); this does not establish that the repository is deleted. The reading room now links directly to the verified [research implementation](https://github.com/farukakgul/ReasonMaxxer). Its README describes offline LoRA post-training, sparse contrastive updates, entropy-based selection and a KL anchor. The current fork relationship has not been independently revalidated. The associated [paper](https://arxiv.org/abs/2605.06241) credits Ömer Faruk Akgül, Rajgopal Kannan, Willie Neiswanger and Viktor Prasanna.

This concerns model training and policy selection. Agent wiring concerns inference-time tools and state. Our catalog treats it as research reference material and records the supplied reference separately from the verified research authors. Their implementation, weights and datasets are not redistributed.

## Four design axes

| Axis | What it changes | Catalog treatment |
| --- | --- | --- |
| Training | Learned model behavior | References; no training implemented |
| Inference/search | Candidates, branching, evaluation, selection | Reasoning and planning |
| Orchestration | Roles, dependencies, delegation, control | Workflows, teams, operations |
| Retrieval/state | Evidence, context, history, durable execution | Retrieval, memory, reliability |

Axes can be combined. Navigation categories are editorial and overlap conceptually.

## Workflows and added autonomy

[Anthropic's guide](https://www.anthropic.com/engineering/building-effective-agents) separates prearranged workflows from model-directed behavior and discusses chains, routing, parallel work, workers and evaluator loops. [LangGraph's official examples](https://docs.langchain.com/oss/python/langgraph/workflows-agents) make those structures explicit.

Our design inference: start with the least complex mechanism that expresses the task. A chain suits known steps; routing adds classification failures; parallelism needs independent work and a join policy; evaluation loops need acceptance checks and stop budgets. More agents are not a measured quality improvement by themselves.

## Planning and search

- [ReAct](https://arxiv.org/abs/2210.03629) alternates decisions, actions and observations. Our controller stores actual tool results and returns an honest partial result on budget exhaustion.
- [ReWOO](https://arxiv.org/html/2305.18323v1) separates an evidence-variable plan from tool work and solving. Dependency resolution is central: missing evidence cannot be replaced with fabricated results.
- [LLMCompiler](https://arxiv.org/abs/2312.04511) schedules dependent function calls. The preset needs a task DAG, ready queue and join state rather than indiscriminate parallel calls.
- [Tree of Thoughts](https://arxiv.org/html/2305.10601v2) uses candidate states, evaluation, pruning and exploration. Our controller requires a frontier, parent links and a depth bound. The diagram shows controller stages rather than every generated state.
- [Graph of Thoughts](https://arxiv.org/abs/2308.09687) motivates combination and revision between intermediate results. Our adaptation preserves merge provenance.
- [LATS](https://arxiv.org/abs/2310.04406) combines tree search with action and environment feedback. Its contract includes visits, value estimates, selection, expansion and feedback propagation.
- [Self-Discover](https://arxiv.org/abs/2402.03620) constructs a task-specific structure from reasoning modules. Our adaptation adds compatibility checking.

Paper scores depend on their models, tasks and setups. They are not transplanted into catalog ratings.

## Retrieval extensions

The [original RAG paper](https://arxiv.org/abs/2005.11401) is conceptual reference material; our four-stage workflow is an adaptation.

| Problem | Mechanisms | Required distinction |
| --- | --- | --- |
| Query mismatch | HyDE, multi-query, contextual retrieval | Synthetic hints are not source evidence |
| Different retrieval signals | Hybrid retrieval, rank fusion | Stable document/version IDs and declared fusion rules |
| Weak evidence | Corrective retrieval | Evidence grading and a bounded fallback |
| Retrieval need/support | Self-RAG, Adaptive-RAG adaptations | Training-specific parts are not reproduced |
| Corpus-wide relationships | GraphRAG | Summaries retain source provenance |
| Multiple abstraction levels | RAPTOR | Summary parents resolve to original leaves |
| Multiple media | Multimodal evidence | Region coordinates and uncertainty |

Primary references: [HyDE](https://arxiv.org/abs/2212.10496), [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval), [CRAG](https://arxiv.org/abs/2401.15884), [Self-RAG](https://arxiv.org/abs/2310.11511), [Adaptive-RAG](https://arxiv.org/abs/2403.14403), [GraphRAG](https://arxiv.org/abs/2404.16130), [RAPTOR](https://arxiv.org/abs/2401.18059).

Self-RAG trains reflection tokens; our design uses prompted checks. Adaptive-RAG uses a learned complexity classifier; our specification uses declared rules. Both differences appear in source notes and invariants.

## Multi-agent ownership and evidence

[Anthropic's research-system description](https://www.anthropic.com/engineering/multi-agent-research-system) provides a lead/worker engineering example. [LangChain's multi-agent documentation](https://docs.langchain.com/oss/python/langchain/multi-agent) separates central subagents, handoffs, routers and custom workflows. [AutoGen selectors](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/selector-group-chat.html) and [CrewAI processes](https://docs.crewai.com/en/concepts/processes) supply concrete engineering references.

Our contracts require one case owner after handoff, scoped delegation budgets, independent positions before debate, provenance on merged outputs, versioned blackboard conflicts, and termination rules for dynamic teams. Majority agreement is not a calibrated probability of correctness.

## Memory and durable execution

[Reflexion](https://arxiv.org/abs/2303.11366) carries feedback between attempts without changing weights. [MemGPT](https://arxiv.org/abs/2310.08560) motivates management of active and external memory. [Voyager](https://arxiv.org/abs/2305.16291) motivates reusable skills in Minecraft; our domain designs do not reproduce that environment.

Memory presets declare separate storage/skill adapters, access scope, checked outcomes, version references and expiry. Persistent errors must not become unqualified instructions for future tasks.

[LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence) and [interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts) inform checkpoints and human gates. Our specifications require input hashes, state versions and idempotency. Saga and event-driven designs are original engineering combinations, not claimed as named algorithms from a particular LLM paper.

## ML/DL foundations

The books supply foundations rather than a ready-made agent catalog:

1. [Deep Learning](https://www.deeplearningbook.org/) — Ian Goodfellow, Yoshua Bengio and Aaron Courville. Relevant areas: probability, representations, machine-learning basics and optimization. The large ML chapter page could not be fetched in the later research pass; the book landing page and reading structure are reference material.
2. [Dive into Deep Learning](https://d2l.ai/chapter_attention-mechanisms-and-transformers/index.html) — Aston Zhang, Zachary C. Lipton, Mu Li and Alexander J. Smola. Attention/transformer material helps distinguish a model's internal architecture from application orchestration.
3. [Probabilistic Machine Learning: Advanced Topics](https://probml.github.io/pml-book/book2.html) — Kevin P. Murphy. Uncertainty, decision-making and evaluation inform selectors and comparisons.

A useful experiment compares paired tasks under the same provider and source pack, recording correctness, abstention, model/tool calls, tokens and elapsed time. Subjective drafting quality needs blind human review. Repeated model agreement alone is insufficient validation.

## Portfolio evidence

The current deliverable is a functioning catalog with reproducible build, data checks and browser scenarios. The natural research extension is an executed comparison of a direct-call baseline, chain, ReAct, ReWOO and retrieval/checking design. Keep fixtures, actual traces, failures and settings; publish real dates and limitations.

No model experiments have been run. Fixture descriptions and mechanism probes are plans. Data/interface checks establish software behavior, not model performance.

The full reference registry follows.

<!-- reference-registry -->

## Reference registry (53)

### Guide

- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — Erik Schluntz & Barry Zhang · Anthropic. Fixed workflows and model-directed agents solve different kinds of problems.
- [Plan-and-Execute Agents](https://www.langchain.com/blog/planning-agents) — LangChain team. Planning, evidence dependencies and task scheduling.
- [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) — Anthropic engineering.
- [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) — Anthropic research.

### Paper

- [MapReduce](https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/) — Jeffrey Dean & Sanjay Ghemawat. Map/reduce programming model; the catalog adapts it to artifact synthesis, not distributed cluster execution.
- [Reciprocal Rank Fusion](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf) — Gordon V. Cormack, Charles L. A. Clarke & Stefan Büttcher. Fusion sums 1 / (k + rank) across ranked lists. k = 60 was the paper’s fixed experimental choice, not a universal optimum.
- [Hearsay II: blackboard organization](https://iiif.library.cmu.edu/file/Newell_box00034_fld02331_doc0001/Newell_box00034_fld02331_doc0001.pdf) — Victor R. Lesser, Richard D. Fennell, Lee D. Erman & D. Raj Reddy. A primary historical description of independent knowledge sources communicating through a global blackboard. Our LLM workflow is an adaptation.
- [Sagas](https://www.cs.princeton.edu/research/techreps/598) — Hector Garcia-Molina & Kenneth Salem. Database transactions and compensating transactions. The catalog applies the idea to authorized tool workflows; external compensation can fail.
- [The Contract Net Protocol](https://reidgsmith.com/The_Contract_Net_Protocol_Dec-1980.pdf) — Reid G. Smith. Negotiated task distribution through announcements, bids and awards. Our simplified LLM preset does not implement the complete protocol.
- [ReAct](https://arxiv.org/abs/2210.03629) — Shunyu Yao et al. Interleaves decisions, actions and observations.
- [ReWOO](https://arxiv.org/abs/2305.18323) — Binfeng Xu et al. Separates evidence planning from tool execution.
- [Tree of Thoughts](https://arxiv.org/abs/2305.10601) — Shunyu Yao et al. Search over candidate intermediate states.
- [Graph of Thoughts](https://arxiv.org/abs/2308.09687) — Maciej Besta et al. Branches, merges and revises intermediate results.
- [Self-Consistency](https://arxiv.org/abs/2203.11171) — Xuezhi Wang et al. Aggregates independently sampled answers.
- [Least-to-Most Prompting](https://arxiv.org/abs/2205.10625) — Denny Zhou et al. Solves simpler subproblems before dependent ones.
- [PAL: Program-aided Language Models](https://arxiv.org/abs/2211.10435) — Luyu Gao et al. Uses a program interpreter for calculations.
- [Multiagent Debate](https://arxiv.org/abs/2305.14325) — Yilun Du et al. Independent proposals and bounded rounds of critique.
- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401) — Patrick Lewis et al. Generation grounded in retrieved documents.
- [Corrective RAG](https://arxiv.org/abs/2401.15884) — Shi-Qi Yan et al. Changes retrieval strategy after evaluating evidence.
- [Self-RAG](https://arxiv.org/abs/2310.11511) — Akari Asai et al. The paper trains reflection tokens. Catalog workflows are prompted adaptations.
- [GraphRAG: From Local to Global](https://arxiv.org/abs/2404.16130) — Darren Edge et al. Graph communities support corpus-level questions.
- [RAPTOR](https://arxiv.org/abs/2401.18059) — Parth Sarthi et al. Retrieval from recursively summarized document trees.
- [Hypothetical Document Embeddings](https://arxiv.org/abs/2212.10496) — Luyu Gao et al. A hypothetical document steers retrieval; it is not evidence.
- [Reflexion](https://arxiv.org/abs/2303.11366) — Noah Shinn et al. Feedback is carried between attempts without changing weights.
- [Self-Refine](https://arxiv.org/abs/2303.17651) — Aman Madaan et al. Bounded generation, feedback and revision.
- [MemGPT](https://arxiv.org/abs/2310.08560) — Charles Packer et al. Explicit management of active context and external memory.
- [Voyager](https://arxiv.org/abs/2305.16291) — Guanzhi Wang et al. Its Minecraft skill library inspires domain adaptations here.
- [Rethinking RL for LLM Reasoning](https://arxiv.org/abs/2605.06241) — Ömer Faruk Akgül, Rajgopal Kannan, Willie Neiswanger & Viktor Prasanna. The published results are not performance claims for our catalog.
- [Language Agent Tree Search](https://arxiv.org/abs/2310.04406) — Andy Zhou et al. Monte Carlo tree search with environment feedback.
- [LLMCompiler](https://arxiv.org/abs/2312.04511) — Sehoon Kim et al. Dependency-aware parallel function execution.
- [Self-Discover](https://arxiv.org/abs/2402.03620) — Pei Zhou et al. Selects and adapts reasoning modules into a task structure.
- [Take a Step Back](https://arxiv.org/abs/2310.06117) — Huaixiu Steven Zheng et al. Abstraction can guide a subsequent concrete answer.
- [Mixture-of-Agents](https://arxiv.org/abs/2406.04692) — Junlin Wang et al. Layered candidate generation and aggregation.
- [Adaptive-RAG](https://arxiv.org/abs/2403.14403) — Soyeong Jeong et al. The original router is learned; these recipes use explicit routing rules instead.
- [WebArena](https://arxiv.org/abs/2307.13854) — Shuyan Zhou et al. A benchmark environment, not a claim that these workflows have passed it.

### Documentation

- [Workflows and agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents) — LangChain contributors. Chaining, parallelization and evaluator loops.
- [Multi-agent patterns](https://docs.langchain.com/oss/python/langchain/multi-agent) — LangChain contributors.
- [Handoffs](https://docs.langchain.com/oss/python/langchain/multi-agent/handoffs) — LangChain contributors.
- [Subagents](https://docs.langchain.com/oss/python/langchain/multi-agent/subagents) — LangChain contributors.
- [Router](https://docs.langchain.com/oss/python/langchain/multi-agent/router) — LangChain contributors.
- [Custom workflow](https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow) — LangChain contributors.
- [Processes](https://docs.crewai.com/en/concepts/processes) — CrewAI contributors.
- [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence) — LangChain contributors.
- [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts) — LangChain contributors.
- [Selector Group Chat](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/selector-group-chat.html) — Microsoft AutoGen contributors.

### Repository

- [LangGraph](https://github.com/langchain-ai/langgraph) — LangChain open-source contributors.
- [AutoGen](https://github.com/microsoft/autogen) — Microsoft open-source contributors. The official repository reports maintenance mode. Microsoft Agent Framework is its successor; this remains a historical pattern reference.
- [CrewAI](https://github.com/crewAIInc/crewAI) — CrewAI open-source contributors.
- [GenAI Agents](https://github.com/NirDiamant/GenAI_Agents) — Nir Diamant & contributors. Further-reading tutorials; no source code copied into this project.
- [ReasonMaxxer](https://github.com/farukakgul/ReasonMaxxer) — Ömer Faruk Akgül et al. Offline LoRA post-training, not an agent architecture. The user-supplied Arka04bro reference is recorded in the research notes; no implementation is redistributed.

### Book

- [Deep Learning](https://www.deeplearningbook.org/) — Ian Goodfellow, Yoshua Bengio & Aaron Courville. Foundations: optimization, representations and probabilistic models.
- [Dive into Deep Learning](https://d2l.ai/) — Aston Zhang, Zachary C. Lipton, Mu Li & Alexander J. Smola. Practical foundations: attention, transformers and evaluation.
- [Probabilistic Machine Learning](https://probml.github.io/pml-book/) — Kevin P. Murphy. Uncertainty, statistical evaluation and model selection.

## Source audit — 9 October 2026

The 48 existing reading-room references were checked through the browser research tool. Five direct historical sources were added for MapReduce, reciprocal rank fusion, blackboards, sagas and the contract net, bringing the reading room to 53 references. Paper identifiers, displayed lead authors and core mechanisms were compared with primary metadata and abstracts. Official guides, repository descriptions and book landing pages were checked for their stated scope. This is not a claim of full-text review of every work, successful reproduction, or a direct live HTTP status test: outbound Node fetches were unavailable in this environment. AutoGen is marked as a maintenance-mode reference. See PREDEPLOY_AUDIT.md for scope and evidence.

## Classical mechanisms and source specificity

These application presets combine older distributed-system ideas with LLM workflows. They are editorial adaptations, not implementations of every original protocol:

- [MapReduce](https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/) — Jeffrey Dean & Sanjay Ghemawat. Map/reduce programming model; the catalog adapts it to artifact synthesis, not distributed cluster execution.
- [Reciprocal Rank Fusion](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf) — Gordon V. Cormack, Charles L. A. Clarke & Stefan Büttcher. Fusion sums 1 / (k + rank) across ranked lists. k = 60 was the paper’s fixed experimental choice, not a universal optimum.
- [Hearsay II: blackboard organization](https://iiif.library.cmu.edu/file/Newell_box00034_fld02331_doc0001/Newell_box00034_fld02331_doc0001.pdf) — Victor R. Lesser, Richard D. Fennell, Lee D. Erman & D. Raj Reddy. A primary historical description of independent knowledge sources communicating through a global blackboard. Our LLM workflow is an adaptation.
- [Sagas](https://www.cs.princeton.edu/research/techreps/598) — Hector Garcia-Molina & Kenneth Salem. Database transactions and compensating transactions. The catalog applies the idea to authorized tool workflows; external compensation can fail.
- [The Contract Net Protocol](https://reidgsmith.com/The_Contract_Net_Protocol_Dec-1980.pdf) — Reid G. Smith. Negotiated task distribution through announcements, bids and awards. Our simplified LLM preset does not implement the complete protocol.
