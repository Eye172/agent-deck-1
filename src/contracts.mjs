// Original implementation requirements, not copied framework configurations.
const contract=(fields,invariant,probe,adapters=[])=>({state_fields:fields.split(',').filter(Boolean),invariant,mechanism_probe:probe,adapters});
export const mechanismContracts={
 'chain':contract('normalized_input,intermediate_artifacts,validation_result','Every stage consumes a checked predecessor artifact.','Supply a malformed intermediate artifact; downstream delivery must stop.'),
 'router':contract('route,route_evidence,handler_contract','Unknown classifications take the explicit unknown route.','Supply a request outside every declared route; check abstention.'),
 'parallel-sections':contract('sections,worker_results,worker_failures','Merge requires every mandatory section or explicitly reports missing sections.','Fail one worker and check that the missing section is visible.'),
 'parallel-vote':contract('candidates,canonical_answers,vote_counts,ties','Votes use canonical final answers; agreement alone cannot establish correctness.','Supply agreeing wrong candidates and a failed external checker.'),
 'map-reduce':contract('chunk_ids,chunk_hashes,map_results,reduction_coverage','Each input chunk is accounted for exactly once.','Duplicate a chunk and omit another; verify coverage detection.'),
 'evaluator-optimizer':contract('draft,rubric_violations,revision_count,best_checked_draft','Only rubric-linked revisions continue; budget exhaustion retains known violations.','Use a checker that never passes; verify bounded termination.'),
 'orchestrator-workers':contract('subtasks,worker_contracts,dependency_results,coverage_gaps','Worker claims stay attached to evidence during synthesis.','Return conflicting worker evidence and check conflict preservation.'),
 'state-machine':contract('state_name,allowed_transitions,event_history','Only declared transitions can change the current state.','Send an invalid event and verify it does not advance the workflow.'),
 'tree-of-thoughts':contract('frontier,parent_links,state_scores,search_depth,pruned_states','Evaluate candidate states before pruning; retain parent links for backtracking.','Construct a promising dead end and verify alternate-branch exploration.'),
 'graph-of-thoughts':contract('state_graph,merge_provenance,revisions,acyclic_dependencies','Merged artifacts retain provenance from every contributing branch.','Merge contradictory branches and check that evidence is not silently overwritten.'),
 'self-consistency':contract('samples,normalized_answers,answer_frequencies','Samples remain independent before answer aggregation.','Mix equivalent answer forms and confirm correct normalization.'),
 'least-to-most':contract('subproblem_order,checked_solutions,dependency_map','Dependent subproblems consume checked earlier solutions.','Make an early subproblem fail and verify dependent work is blocked.'),
 'program-aided':contract('program,execution_result,unit_checks,repair_count','Numeric claims are tied to actual sandbox execution.','Generate a program with a unit error; verify rejection and bounded repair.'),
 'self-refine':contract('draft,feedback,revision_history,stop_reason','Feedback maps to concrete edits and a bounded stop condition.','Repeat identical feedback and verify the loop does not continue forever.'),
 'step-back':contract('abstract_principles,task_constraints,concrete_answer','Abstraction guides the answer without replacing task-specific evidence.','Include a task exception that conflicts with a general principle.'),
 'self-discover':contract('selected_modules,adapted_modules,execution_structure','Only declared reasoning modules may enter the adapted structure.','Select an incompatible module and verify the structure checker rejects it.'),
 'supervisor':contract('delegations,specialist_results,manager_decisions,unresolved_gaps','The manager preserves specialist evidence and enforces delegated scope.','Have a specialist request an out-of-scope action; verify the boundary.'),
 'handoff':contract('active_agent,handoff_payload,context_scope','Exactly one agent owns the case after a handoff.','Request a transfer missing mandatory case fields.'),
 'debate':contract('independent_positions,critique_rounds,remaining_disagreements','Debate rounds cannot convert unsupported agreement into evidence.','Make all participants repeat the same unsupported claim.'),
 'role-crew':contract('role_outputs,role_dependencies,final_artifact','Role transitions preserve required fields and authorship.','Omit one role output and check that the dependent role cannot claim completion.'),
 'blackboard':contract('shared_board,board_version,contributions,conflicts','Updates use version checks and retain conflicting contributions.','Submit simultaneous incompatible writes to the same board field.',['read_blackboard','append_blackboard']),
 'hierarchical-team':contract('team_tree,delegation_scopes,subteam_results','Delegated budgets and scopes cannot expand at lower levels.','Have a subteam exceed its delegated call allowance.'),
 'mixture-of-agents':contract('layer_outputs,aggregation_inputs,source_attribution','Each aggregation layer records which prior outputs it consumed.','Feed one fabricated candidate and check the final evidence ledger.'),
 'research-swarm':contract('research_questions,worker_findings,source_coverage,contradictions','Coverage counts independently supported findings, not repeated citations.','Use duplicate URLs across workers and a contradictory primary source.'),
 'basic-rag':contract('retrieved_passages,passage_versions,citation_map','Every supported answer claim has an accessible passage.','Ask an unanswerable question and verify abstention.'),
 'hybrid-rag':contract('lexical_results,dense_results,fused_passages','Retrieval fusion deduplicates by document identity and version.','Supply lexical and dense hits from different document versions.'),
 'corrective-rag':contract('retrieval_grade,correction_strategy,retrieval_attempts','Corrective retrieval is triggered by evidence grading and remains bounded.','Supply irrelevant passages and an unavailable fallback retriever.'),
 'self-rag':contract('retrieval_decision,support_check,reflection_labels','Prompted reflection checks are explicitly distinguished from trained reflection tokens.','Disable retrieval and provide an unsupported candidate answer.'),
 'graph-rag':contract('entity_graph,community_summaries,source_spans','Community summaries remain traceable to source spans.','Ask a global question over a graph containing a wrong entity merge.',['query_evidence_graph']),
 'raptor':contract('summary_tree,summary_levels,original_leaf_refs','Summary-tree results retain retrievable original leaves.','Remove a leaf supporting a parent summary and verify support failure.',['query_summary_tree']),
 'hyde':contract('hypothetical_document,query_embedding,retrieved_evidence','Synthetic query documents are retrieval hints and never evidence.','Generate a plausible but false hypothetical document.'),
 'contextual-rag':contract('contextual_chunks,context_source_refs,reranked_hits','Added chunk context is traceable to the original document.','Use a chunk whose surrounding context reverses its meaning.'),
 'reflexion':contract('attempt_outcomes,feedback_lessons,lesson_scope','Stored lessons reference measured feedback and expire with scope.','Supply incorrect feedback and check quarantine before future use.',['read_memory','write_scoped_memory']),
 'episodic-memory':contract('retrieved_cases,case_differences,verified_outcome','Historical outcomes do not count as current evidence.','Retrieve a superficially similar case with a different governing constraint.',['read_memory','write_scoped_memory']),
 'memory-tiers':contract('active_context,archival_refs,eviction_records,context_size','Paging preserves original references and enforces access scope.','Force eviction of a task-critical exception and recover it from archive.',['read_memory','write_scoped_memory']),
 'skill-library':contract('skill_id,skill_version,precondition_check,skill_outcome','Skill promotion requires a successful checker on the declared environment.','Run a prior skill against a changed API version.',['read_skill_registry','run_scoped_skill','write_skill_registry']),
 'graph-memory':contract('entity_versions,relation_sources,expiry_records,conflicts','Memory updates append provenance without erasing conflicting history.','Create ambiguous entity matches and expired relations.',['query_evidence_graph','append_evidence_graph']),
 'compressed-context':contract('selected_facts,summary,original_refs,summary_check','Compression retains governing exceptions and recoverable originals.','Hide a crucial exception in a long document and test its preservation.',['read_memory','write_scoped_memory']),
 'task-journal':contract('journal_events,sequence_number,state_versions,input_hash','Events append in order with stable task identity and input hashes.','Replay after a crash and detect duplicate or mismatched inputs.',['append_journal','read_journal']),
 'preference-memory':contract('consented_preferences,preference_expiry,consent_record','Only explicitly consented preferences persist across tasks.','Withdraw consent and verify the preference is not reused.',['read_memory','write_scoped_memory']),
 'human-gate':contract('approval_request,approval_scope,approval_result','Paused work resumes only with approval for the same action and inputs.','Change action arguments after approval and require a new check.',['request_human_review']),
 'checkpoint-recovery':contract('checkpoint,state_version,idempotency_keys,retry_count','Recovery never repeats a completed external effect without idempotency protection.','Crash after an effect but before acknowledgment.',['save_checkpoint','load_checkpoint']),
 'policy-gateway':contract('action_arguments,authorization_scope,policy_result','Rejected actions never reach the execution adapter.','Pass a valid-shaped action outside the authorized scope.',['validate_authorization']),
 'model-cascade':contract('cheap_result,acceptance_check,escalation_reason','Escalation follows an observable failed check within budget.','Let the cheap model sound confident while failing the task checker.'),
 'verify-repair':contract('candidate,violations,repair_attempts,final_check','Repair claims require a subsequent checker pass.','Cause a repair to resolve one failure while introducing another.'),
 'fallback-path':contract('primary_failure,fallback_compatibility,selected_path','Fallback preserves access scope and labels degraded results.','Try a fallback requiring broader access than the primary adapter.'),
 'quorum-review':contract('reviewer_votes,reviewer_evidence,quorum_rule,tie_state','Quorum rules and disagreement handling are declared before review.','Return a tie and a correlated unsupported majority.'),
 'evidence-audit':contract('claim_ledger,evidence_links,unsupported_claims','Every claim is individually checked for entailment and source access.','Cite a real source that does not support the attached claim.'),
 'react':contract('next_action,observations,tool_errors,stop_reason','Decisions consume actual observations and every loop checks remaining budgets.','Make a tool repeatedly return errors; verify a bounded honest partial result.'),
 'plan-execute':contract('plan_steps,completed_steps,plan_revision','Replanning uses observed failures without repeating completed effects.','Invalidate a future step after an earlier step has already completed.'),
 'rewoo':contract('plan,evidence_variables,evidence_dependencies,tool_results','Evidence references resolve to real prior results before execution.','Reference an unresolved evidence variable and fail a dependent tool.'),
 'llmcompiler':contract('task_dag,ready_queue,completed_tasks,join_state','Only ready tasks execute; dependencies and joins survive task failure.','Use a diamond dependency graph and fail one predecessor.'),
 'lats':contract('search_tree,visit_counts,value_estimates,environment_feedback','Tree search records selection, expansion, feedback and backpropagated values.','Use a high-scoring dead end and verify alternate action exploration.'),
 'budget-planner':contract('remaining_calls,step_estimates,selected_steps,spent_budget','Allocation cannot exceed the enforced call or time allowance.','Provide optimistic estimates and unexpectedly expensive tool calls.'),
 'hierarchical-plan':contract('goal_tree,preconditions,task_methods,completed_effects','Subplans execute only while their preconditions still hold.','Change a required environment condition midway through execution.'),
 'sandbox-lookahead':contract('candidate_actions,simulated_outcomes,simulation_error,selected_action','Simulated outcomes are labeled predictions and checked against actual feedback.','Use a systematically wrong simulator and detect prediction mismatch.',['simulate_scoped_action']),
 'adaptive-rag':contract('complexity_class,retrieval_route,route_check','Explicit rule routing is distinguished from the paper’s learned classifier.','Supply an apparently simple question requiring multiple evidence hops.'),
 'multi-query':contract('query_variants,per_query_hits,deduplicated_hits','Query variants stay within the task scope and deduplicate source evidence.','Generate redundant variants and one variant with altered task intent.'),
 'rank-fusion':contract('ranked_lists,rank_scores,fused_ids','Fusion uses declared rank rules and stable identity keys.','Mix differently scaled retriever scores; verify rank-based fusion.'),
 'multimodal-evidence':contract('regions,ocr_text,modality_links,source_coordinates','Cross-modal claims retain region coordinates and uncertainty.','Give conflicting OCR text and visual evidence.',['read_scoped_media']),
 'event-driven':contract('event_ids,event_schema,consumer_offsets,dead_letters','Duplicate events do not repeat completed effects.','Redeliver an event and supply an invalid event schema.',['read_event_queue','acknowledge_event']),
 'saga':contract('completed_steps,compensation_stack,compensation_results','Compensation runs only for completed effects and reports incomplete recovery.','Fail a late step and then fail a compensating action.',['run_authorized_compensation']),
 'dynamic-team':contract('available_roles,role_selection,participation_history','Role selection respects declared capabilities and a termination condition.','Select an unavailable specialist and test repeated role cycling.'),
 'contract-team':contract('task_offer,bids,awarded_contract,result_checks','The awarded contract fixes scope, budget and success conditions.','Return an attractive bid that cannot satisfy mandatory preconditions.')
};
// Stage operations are adapter requirements, not implemented tools.
const operationAdapters={
 'parallel-vote':{n1:['normalize_answers']},'self-consistency':{n1:['normalize_answers']},
 'map-reduce':{n0:['chunk_input']},'tree-of-thoughts':{n2:['manage_search_frontier']},
 'program-aided':{n2:['run_sandboxed_program']},'state-machine':{n3:['persist_workflow_state']},
 'blackboard':{n2:['append_blackboard'],n0:['read_blackboard']},
 'hybrid-rag':{n0:['search_lexical','search_dense'],n2:['rerank_passages']},
 'graph-rag':{n1:['query_evidence_graph'],n2:['resolve_source_passages']},
 'raptor':{n1:['query_summary_tree'],n2:['resolve_original_leaves']},
 'hyde':{n1:['embed_query_hint','search_authorized_embeddings']},
 'contextual-rag':{n0:['build_contextual_index'],n2:['rerank_passages']},
 'compressed-context':{n0:['read_memory'],n1:['read_memory'],n2:['read_memory','write_scoped_memory'],n3:['read_memory']},
 'reflexion':{n3:['write_scoped_memory']},
 'episodic-memory':{n0:['read_memory'],n3:['write_scoped_memory']},
 'memory-tiers':{n1:['read_memory','write_scoped_memory'],n3:['write_scoped_memory']},
 'skill-library':{n0:['read_skill_registry'],n2:['run_scoped_skill'],n3:['write_skill_registry']},
 'graph-memory':{n0:['query_evidence_graph'],n3:['append_evidence_graph']},
 'task-journal':{n0:['observe_scoped_tool'],n2:['append_journal'],n3:['read_journal']},
 'preference-memory':{n0:['read_memory'],n3:['write_scoped_memory']},
 'human-gate':{n1:['request_human_review'],n2:['run_exact_approved_action']},
 'checkpoint-recovery':{n0:['save_checkpoint'],n1:['run_idempotent_action'],n2:['load_checkpoint'],n3:['save_checkpoint']},
 'policy-gateway':{n1:['validate_authorization'],n2:['run_authorized_tool']},
 'fallback-path':{n0:['run_primary_tool'],n2:['run_compatible_fallback']},
 'quorum-review':{n0:['distribute_isolated_reviews']},
 'react':{n1:['run_authorized_tool']},'plan-execute':{n1:['execute_ready_plan_step']},
 'rewoo':{n1:['resolve_evidence_plan']},'llmcompiler':{n1:['schedule_dependency_ready_tasks'],n2:['execute_ready_tool_calls']},
 'lats':{n0:['select_search_node'],n2:['evaluate_resettable_rollout'],n3:['backpropagate_search_values']},
 'budget-planner':{n2:['execute_budgeted_step']},'hierarchical-plan':{n3:['execute_checked_subplan']},
 'sandbox-lookahead':{n0:['capture_environment_snapshot'],n2:['simulate_scoped_action']},
 'rank-fusion':{n1:['apply_reciprocal_rank_fusion']},
 'multimodal-evidence':{n0:['read_scoped_media','extract_region_text']},
 'event-driven':{n0:['read_event_queue'],n3:['acknowledge_event']},
 'saga':{n1:['run_idempotent_authorized_action'],n2:['run_authorized_compensation']}
};
function stageAdapters(family,c){
 return Object.fromEntries(family.stages.map(stage=>{
  const declared=operationAdapters[family.id]?.[stage.id];
  const defaults=stage.kind==='gate'?['validate_stage_contract']:stage.kind==='merge'?['join_stage_artifacts']:stage.kind==='retrieve'?['retrieve_authorized_evidence']:stage.kind==='memory'?c.adapters:stage.kind==='tool'?['execute_scoped_stage_operation']:[];
  return [stage.id,[...new Set([...(declared||defaults),...(stage.kind==='gate'?['validate_stage_contract']:[])])]];
 }));
};
export function runtimeContract(family){
 const c=mechanismContracts[family.id];
 if(!c)throw new Error('Missing runtime contract: '+family.id);
 const perStage=stageAdapters(family,c);
 return {...c,adapters:[...new Set([...c.adapters,...Object.values(perStage).flat()])],stage_adapters:perStage,replication:{mode:family.id==='dynamic-team'?'select-one-from-pool':'bounded-fan-out',stage_ids:replicaStages[family.id]||[],capacity:family.settings.replicas||1,instance_contract:'Capacity is an upper bound. Assign separate task shards, retrieval modes, candidate seeds or roles; preserve instance IDs and join results. Managers and aggregators remain single unless explicitly listed.'},representation:'control-flow-template',expansion_note:'Replica workers, search frontiers and data structures are runtime expansions of these control stages.',
  artifact_schema:{required:['stage_id','status','artifact','evidence_refs','unresolved'],status_values:['passed','partial','failed','blocked'],evidence_refs:'Accessible source IDs or actual tool-result IDs; never synthetic proof of execution.'},
  stop_contract:'Acceptance, cancellation or any exhausted call/step/time budget ends the run. Retry edges must not override this rule.'};
}
export const replicaStages={
 'parallel-sections':['n1'],'parallel-vote':['n0'],'map-reduce':['n1'],
 'orchestrator-workers':['n1'],'self-consistency':['n0'],'supervisor':['n1'],
 'debate':['n0','n1','n2'],'blackboard':['n1'],'hierarchical-team':['n2'],
 'mixture-of-agents':['n0','n2'],'research-swarm':['n1'],'hybrid-rag':['n0'],
 'quorum-review':['n1'],'llmcompiler':['n2'],'multi-query':['n1'],
 'rank-fusion':['n0'],'dynamic-team':[],'contract-team':['n1']
};
