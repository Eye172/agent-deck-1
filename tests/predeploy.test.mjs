import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,catalogById,blueprint,markdown,sources} from '../src/catalog.mjs';
test('mechanisms declare actual operational adapters instead of relying on domain read tools',()=>{
 const checks={'program-aided':['run_sandboxed_program'],'contextual-rag':['build_contextual_index','rerank_passages'],'rank-fusion':['apply_reciprocal_rank_fusion'],'llmcompiler':['schedule_dependency_ready_tasks','execute_ready_tool_calls'],'lats':['evaluate_resettable_rollout','backpropagate_search_values'],'saga':['run_authorized_compensation']};
 for(const [family,tools] of Object.entries(checks)){const b=blueprint(catalogById[family+'--research']);for(const tool of tools){assert.ok(b.tools.some(t=>t.name===tool),family+': '+tool);assert.ok(b.orchestration.nodes.some(n=>n.tools.includes(tool)),family+': unassigned '+tool);}}
 for(const item of catalog){const b=blueprint(item),declared=new Set(b.tools.map(t=>t.name));for(const n of b.orchestration.nodes){for(const tool of n.tools)assert.ok(declared.has(tool),item.id);if(['gate','merge','memory','tool','retrieve'].includes(n.kind))assert.ok(n.tools.length>0,item.id+' '+n.name);}}
});
test('stage contracts describe the actual phase and preserve failure and task acceptance semantics',()=>{
 for(const item of catalog){const b=blueprint(item);for(const n of b.orchestration.nodes){assert.ok(n.output_contract.includes(n.name.toLowerCase()),item.id+' '+n.name);assert.ok(n.input_contract.includes('predecessor artifacts'));assert.ok(n.failure_contract.includes('cannot emit a passed artifact'));}assert.ok(b.orchestration.terminal_rule.includes('Reaching the last controller phase does not establish task success'));}
});
test('custom budgets remain valid and cannot inject unknown or non-finite settings',()=>{
 const item=catalogById['chain--research'],b=blueprint(item,{maxModelCalls:80});assert.ok(b.orchestration.maxSteps>=80);
 for(const value of [0,81,NaN,Infinity,1.5,'17'])assert.throws(()=>blueprint(item,{maxModelCalls:value}),RangeError);
 assert.throws(()=>blueprint(item,{temperature:2.1}),RangeError);assert.throws(()=>blueprint(item,{timeoutSeconds:29}),RangeError);assert.throws(()=>blueprint(item,{unlisted:true}),RangeError);
});
test('classical mechanisms have specific primary attribution and no borrowed benchmark claims',()=>{
 const refs={'map-reduce':'mapreduce-paper','rank-fusion':'rrf-paper','blackboard':'blackboard-paper','saga':'saga-paper','contract-team':'contractnet-paper'};
 for(const [family,id] of Object.entries(refs)){const item=catalogById[family+'--research'];assert.ok(item.references.some(r=>r.id===id));assert.ok(markdown(item).includes(sources.find(s=>s.id===id).url));assert.equal(blueprint(item).evaluation.status,'not-run');}
 assert.match(sources.find(s=>s.id==='autogen').note,/maintenance mode/);
});
test('untrusted deep-link and saved IDs cannot resolve inherited object properties',()=>{
 for(const id of ['__proto__','constructor','toString','hasOwnProperty','nonexistent-preset'])assert.equal(catalogById[id],undefined);
 assert.ok(catalogById['react--research']);
});
