
import {runtimeContract} from './contracts.mjs';
import {actorColors,roleColors} from './agents.mjs';

const notes={
 'react':'The same agent decides the next action and writes the final answer. Tool results return as observations; a failed tool must not be presented as success.',
 'supervisor':'One coordinator owns dispatch and integration. Specialist instances work in separate scoped contexts; the coordinator asks for follow-up only while the budget permits.',
 'orchestrator-workers':'The task determines work orders. The drawn worker slots are capacity limits, not a fixed list of subtasks or a claim that every slot runs.',
 'parallel-sections':'Workers receive disjoint sections. The merge waits for required outputs and keeps worker failures visible.',
 'parallel-vote':'Candidate contexts stay independent until normalization and voting. A majority can still be wrong.',
 'self-consistency':'Colors distinguish independent sample contexts. Agreement is counted after answer normalization; it is not calibrated confidence.',
 'debate':'Separate actors propose, challenge and revise across bounded rounds. Phase links represent exchanged artifacts, not a prescribed peer-message network.',
 'hierarchical-team':'Coordination has two levels: coordinator and team lead. Specialist slots sit below them; task-specific team membership is supplied by the runtime.',
 'mixture-of-agents':'Independent proposer contexts feed an aggregation role, followed by another candidate layer. The same colors identify corresponding slots across layers.',
 'dynamic-team':'This is a roster, not parallel execution: exactly one available specialist is selected per turn.',
 'contract-team':'Offers are collected before a contract is awarded. The award fixes scope, budget and acceptance conditions.',
 'evaluator-optimizer':'The builder drafts and revises; a separate critic returns rubric violations. Pass, exhaustion and lack of progress are explicit stop cases.',
 'self-refine':'One agent can generate, critique and revise in separate calls. Repeated characters are repeated calls, not automatically additional agents.',
 'tree-of-thoughts':'Candidate circles are partial solution states, not more agents. Expansion creates branches; evaluation and pruning update a bounded frontier.',
 'graph-of-thoughts':'Candidate records may merge when their assumptions are compatible. Keep parent links and merge provenance instead of flattening them to a chain.',
 'lats':'Selection, action expansion, environment feedback and value backpropagation operate on a stored search tree. Candidate slots are illustrative frontier states; this is not a measured rollout.',
 'sandbox-lookahead':'Simulated outcomes are predictions. A chosen action still needs actual environment feedback; predicted success does not prove execution.',
 'graph-rag':'The query path reads an existing evidence graph and community summaries, then resolves claims to original passages. Index construction is outside this query preset.',
 'raptor':'A prebuilt summary tree guides retrieval. Original leaf passages remain the evidence; generated summaries alone do not establish a claim.',
 'hybrid-rag':'Two retrieval channels feed the same fusion stage. This preset uses lexical and semantic search, followed by reranking.',
 'rank-fusion':'Multiple ranked lists are fused by rank, not by directly comparing incompatible raw scores.',
 'multi-query':'Scoped query variants run separate retrieval calls. Merge by stable passage identity and keep each query’s evidence.',
 'corrective-rag':'An evidence grade selects the answer path or another retrieval attempt. Alternate retrieval remains access-scoped and budgeted.',
 'self-rag':'This is a prompted controller adaptation. It does not implement the paper’s trained reflection-token mechanism.',
 'hyde':'The hypothetical document is a search hint. Only the real corpus contributes cited evidence.',
 'contextual-rag':'Contextual descriptions are created during indexing. Retrieval and reranking must resolve hits to the unmodified original passages.',
 'reflexion':'Feedback changes a scoped memory record between attempts. It does not update model weights.',
 'memory-tiers':'The controller pages records between active context and an archive. Memory access still needs scope checks and recoverable original references.',
 'blackboard':'Contributors append typed facts to one versioned board. The scheduler chooses missing work; concurrent commits need conflict checks.',
 'human-gate':'A person reviews the exact proposed action and arguments. The execution path stays paused until that same scope is approved.',
 'llmcompiler':'The compiler creates a task-specific dependency DAG. The scheduler starts only ready tasks; the displayed execution slots do not prescribe that DAG.',
 'checkpoint-recovery':'Recovery restores saved state and avoids repeating completed external effects. Checkpoint storage is infrastructure, not an agent.',
 'model-cascade':'A cheaper path is checked before escalation. The stronger model is used because a task check failed, not because the first model sounded uncertain.',
 'policy-gateway':'Authorization precedes execution. A rejected action has no execution path.',
 'saga':'A failed later step can trigger compensation for already completed effects. Compensation is a separate action and can itself fail.',
 'event-driven':'Events enter through a queue; acknowledgments track completed handling. Duplicate delivery must not repeat an external effect.'
};
const readable=value=>String(value).replaceAll('_',' ');
export function conditionLabel(value){
 const map={always:'continue',checked:'check passed',known:'known route',unknown:'ask for clarification',workers_complete:'workers returned',all_chunks_complete:'chunks returned',violations:'needs revision',budget_remaining:'budget remains',pass_or_budget:'pass or stop',gap_and_budget:'gap + budget',complete:'coverage complete',valid:'valid input',more_work:'more work',terminal:'terminal state',depth_remaining:'expand again',terminal_or_budget:'finish or stop',unresolved_and_budget:'unresolved + budget',remaining:'subproblem remains',all_checked:'all checked',success:'tool succeeded',repair_and_budget:'repair + budget',improving_and_budget:'improving + budget',round_remaining:'another round',round_limit:'round limit reached',subtask_gap:'subtask gap',team_complete:'team complete',gaps_and_budget:'coverage gap',coverage_sufficient:'coverage sufficient',insufficient:'weak evidence',retry_remaining:'retry remains',sufficient_or_budget:'enough evidence or stop',needed:'evidence needed',context_sufficient:'context is enough',unsupported_and_budget:'unsupported claim',failed:'check failed',attempt_remaining:'another attempt'};
 return map[value]||readable(value);
}
function identity(f,n,index){
 const named=(id,name,role)=>({id,name,role,color:roleColors[role]||roleColors.assistant});
 const replica=(prefix='Worker')=>({id:'worker-'+index,name:prefix+' '+String.fromCharCode(65+index),role:'worker',color:actorColors[index%actorColors.length]});
 if(['parallel-vote','self-consistency'].includes(f.id))return replica('Candidate');
 if(f.id==='debate')return replica('Debater');
 if(f.id==='mixture-of-agents'&&['n0','n2'].includes(n.id))return replica('Proposer');
 if(f.id==='dynamic-team')return n.id==='n1'?named('selector','Selector','coordinator'):replica('Specialist');
 if(f.id==='evaluator-optimizer')return n.id==='n1'?named('critic','Evaluator','critic'):named('builder','Builder','researcher');
 if(f.id==='role-crew')return n.id==='n0'?named('researcher','Researcher','researcher'):n.id==='n1'?named('builder','Builder','builder'):named('critic','Reviewer','critic');
 if(f.id==='model-cascade')return n.id==='n0'?named('small','Small-model agent','researcher'):named('strong','Escalation agent','assistant');
 if(f.id==='handoff'||f.id==='router')return n.name==='Specialist'?replica('Specialist'):named('router','Triage agent','coordinator');
 if(['supervisor','orchestrator-workers','research-swarm'].includes(f.id))return n.id==='n1'?replica('Specialist'):named('manager','Coordinator','coordinator');
 if(f.id==='hierarchical-team')return n.id==='n0'?named('manager','Coordinator','coordinator'):n.id==='n1'?named('lead','Team lead','lead'):replica('Specialist');
 if(f.id==='contract-team')return n.id==='n0'?named('manager','Coordinator','coordinator'):replica('Bidder');
 if(['parallel-sections','map-reduce','blackboard'].includes(f.id))return n.id==='n0'?named('manager','Coordinator','coordinator'):replica(f.id==='blackboard'?'Contributor':'Worker');
 if(f.id==='mixture-of-agents')return named('aggregator','Aggregator','coordinator');
 if(['plan-execute','self-discover','rewoo','hierarchical-plan','budget-planner'].includes(f.id))return n.name==='Solver'?named('solver','Solver','assistant'):named('planner','Planner','coordinator');
 return named('main','Main agent','assistant');
}

export function explainArchitecture(item){
 const f=item.familyData,s=item.scenarioData,c=runtimeContract(f),nodes=[],edges=[],groups=[],actors=new Map();
 const addEdge=(from,to,kind,condition='always',extra={})=>edges.push({from,to,kind,condition,label:conditionLabel(condition),...extra});
 const add=n=>{nodes.push(n);return n.id;};
 add({id:'input',kind:'input',name:'Task input',instruction:s.input,detail:s.example,stageId:null});
 const choice=c.replication.mode==='select-one-from-pool';
 for(const stage of f.stages){
  const count=choice&&stage.id==='n2'?c.replication.capacity:c.replication.stage_ids.includes(stage.id)?c.replication.capacity:1;
  const group={id:stage.id,name:stage.name,kind:stage.kind,nodeIds:[],instruction:stage.instruction};
  for(let i=0;i<count;i++){
   const actor=stage.kind==='llm'?identity(f,stage,i):null;
   if(actor)actors.set(actor.id,actor);
   const node={id:count>1?stage.id+'@'+(i+1):stage.id,stageId:stage.id,kind:f.id==='human-gate'&&stage.id==='n1'?'human':stage.kind,name:stage.name+(count>1?' '+(i+1):''),instruction:stage.instruction,actorId:actor?.id||null,actor:actor?.name||null,color:actor?.color||null,slot:i+1,capacity:count,optional:choice&&stage.id==='n2',detail:choice&&stage.id==='n2'?'One roster option. Only the selected specialist acts on this turn.':count>1?'A bounded '+stage.name.toLowerCase()+' slot. The runtime assigns scoped inputs and preserves this instance’s result.':stage.instruction};
   group.nodeIds.push(add(node));
  }
  groups.push(group);
 }
 for(const id of groups[0].nodeIds)addEdge('input',id,'control','always',{stageEdge:null});
 for(const edge of f.edges){
  const a=groups.find(g=>g.id===edge.from),b=groups.find(g=>g.id===edge.to);
  for(const from of a.nodeIds)for(const to of b.nodeIds)addEdge(from,to,choice&&(edge.from==='n2'||edge.to==='n2')?'choice':'control',edge.condition,{stageEdge:edge.from+'>'+edge.to});
 }
 add({id:'output',kind:'output',name:'Run result',instruction:'Return the artifacts and unresolved issues. Acceptance or an exhausted budget ends the run.',detail:s.artifacts.join(', ')+'. '+s.criteria.join(' '),stageId:null});
 for(const id of groups.at(-1).nodeIds)addEdge(id,'output','control','finished');
 const resources=[];
 function resource(id,name,kind,detail,stageKinds,specificIds=[]){
  resources.push(add({id,kind,name,detail,instruction:detail,stageId:null}));
  for(const n of nodes.filter(n=>n.stageId&&(stageKinds.includes(n.kind)||specificIds.includes(n.stageId))))addEdge(n.id,id,'data','context access',{stageEdge:null});
 }
 const retrieval=f.stages.some(n=>n.kind==='retrieve');
 if(retrieval){
  if(f.id==='graph-rag'){resource('evidence-graph','Evidence graph','store','Prebuilt entities, relations and community summaries with source provenance.',['retrieve'],['n0']);resource('original-passages','Original passages','store','Source spans with document identity, version and access checks.',['retrieve']);}
  else if(f.id==='raptor'){resource('summary-tree','Summary tree','store','A prebuilt hierarchy of source-linked summaries.',['retrieve']);resource('original-leaves','Original leaves','store','Unmodified passages underlying the chosen summary nodes.',['retrieve']);}
  else resource('corpus','Source corpus','store','Access-scoped source documents and returned passages. Generated hints are not source evidence.',['retrieve']);
 }
 if(f.stages.some(n=>n.kind==='memory')||c.adapters.some(x=>/memory|journal|checkpoint|blackboard|skill_registry|evidence_graph/.test(x))&&!retrieval){
  const names={'blackboard':'Shared blackboard','task-journal':'Append-only journal','checkpoint-recovery':'Checkpoints','skill-library':'Skill registry','graph-memory':'Evidence memory','memory-tiers':'Active context + archive'};
  resource('memory',names[f.id]||'Scoped memory','store',c.invariant+' Fields: '+c.state_fields.join(', '),['memory'],f.id==='blackboard'?['n0','n1','n2','n3']:f.id==='compressed-context'?['n0','n1','n2','n3']:[]);
 }
 if(f.stages.some(n=>n.kind==='tool')){
  resource('environment','Tool environment','environment','Allowed adapters: '+[...new Set([...s.tools,...c.adapters])].join(', ')+'. Return actual outcomes; do not invent execution evidence.',['tool']);
 }
 if((f.settings.branches||0)>1){
  resource('search-state',f.id==='graph-of-thoughts'?'Thought graph':'Search frontier','store','Parent-linked states, scores and budget bookkeeping. '+c.invariant,['tool','gate'],f.stages.filter(n=>n.kind==='llm').map(n=>n.id));
  const expand=f.stages.find(n=>n.kind==='llm')?.id||f.stages[0].id;
  for(let i=0;i<f.settings.branches;i++){
   const id=add({id:'candidate-'+(i+1),kind:'candidate',name:'State '+(i+1),stageId:null,instruction:'One possible frontier state. Content, parent links and depth are created by the runtime.',detail:'A partial solution or action state, not a separate agent. '+c.invariant});
   resources.push(id);
   for(const n of nodes.filter(n=>n.stageId===expand))addEdge(n.id,id,'data','candidate state');
  }
 }
 const back=f.edges.filter(e=>Number(e.to.slice(1))<=Number(e.from.slice(1))).length;
 let layout=choice?'choice':f.topology==='Hierarchy'?'hierarchy':f.id==='debate'?'debate':f.id==='mixture-of-agents'?'layers':c.replication.stage_ids.length?'fanout':f.settings.branches?'search':f.category==='Memory'?'memory':/Router|Cascade|Fallback|Conditional|Interrupt|Policy/.test(f.topology)?'branch':back?'loop':retrieval?'retrieval':'sequence';
 return {schema_version:'1.0',layout,family:f.id,actors:[...actors.values()],nodes,edges,groups,resources,entry:'input',exit:'output',control_stage_count:f.stages.length,actor_count:actors.size,instance_mode:choice?'select-one-from-roster':'bounded-phase-expansion',feedback_count:back,
  note:notes[f.id]||f.summary,
  legend:'Characters are model-driven actors. The same color and actor name across steps mean the same logical actor; different actors may use the same underlying model. Tools, checks, people and stored data are not agents.',
  representation:'explanatory-runtime-view',scope:'Phase dependencies and bounded capacity, not an execution trace. Global acceptance, cancellation, blocked routing and exhausted budgets may stop any phase; the result connector shows the normal phase exit. Data links show context access; instance-message delivery and task-specific dependency graphs belong to the runtime.',
  state_fields:c.state_fields,invariant:c.invariant,stop:c.stop_contract};
}
