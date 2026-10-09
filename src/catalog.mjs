import {explainArchitecture} from './explain.mjs';
import {runtimeContract} from './contracts.mjs';
import {coreFamilies} from './families-core.mjs';
import {advancedFamilies} from './families-advanced.mjs';
import {scenarios} from './scenarios.mjs';
import {sourceById,sources} from './sources.mjs';
export const families=[...coreFamilies,...advancedFamilies];
export const levels=['Basic','Intermediate','Advanced','Expert'];
export const categories=['Workflows','Reasoning','Planning','Multi-agent','Retrieval','Memory','Reliability','Operations'];
export const categoryColors={Workflows:'orange',Reasoning:'yellow',Planning:'orange','Multi-agent':'green',Retrieval:'blue',Memory:'purple',Reliability:'red',Operations:'gray'};
export const catalog=scenarios.flatMap((scenario,si)=>families.map((family,fi)=>{
 const levelIndex=levels.indexOf(family.level);
 const replicas=family.settings.replicas||1;
 const iterations=family.settings.iterations||1;
 const maxCalls=Math.min(80,Math.max(8,family.stages.filter(s=>s.kind==='llm').length*replicas*iterations+2));
 return {
  id:family.id+'--'+scenario.id,
  number:String(si*families.length+fi+1).padStart(3,'0'),
  title:family.name, subtitle:scenario.title, family:family.id, scenario:scenario.id,
  category:family.category, level:family.level, topology:family.topology,
  summary:family.summary, useCase:scenario.task, tradeoff:family.tradeoff,
  toolCount:new Set([...scenario.tools,...runtimeContract(family).adapters]).size, roles:replicas>1?replicas:1,
  footprint:levelIndex<1?'Light':levelIndex<3?'Moderate':'Heavy',
  references:family.refs.map(id=>sourceById[id]),
  settings:{temperature:0.2,maxModelCalls:maxCalls,maxSteps:Math.max(12,maxCalls*2),timeoutSeconds:180,...family.settings},
  familyData:family,scenarioData:scenario,
  searchText:[family.name,family.category,family.level,family.topology,family.summary,scenario.name,scenario.title,scenario.task,...scenario.tools,...family.refs.map(id=>[sourceById[id]?.title,sourceById[id]?.author,sourceById[id]?.note].filter(Boolean).join(' '))].join(' ').toLowerCase()
 };
}));
export const catalogById=Object.assign(Object.create(null),Object.fromEntries(catalog.map(x=>[x.id,x])));
export function blueprint(item,overrides={}){
 const f=item.familyData,s=item.scenarioData;
 const allowed={temperature:[0,2,false],maxModelCalls:[1,80,true],timeoutSeconds:[30,600,true]};
 for(const [key,value] of Object.entries(overrides)){
  const rule=allowed[key];
  if(!rule||!Number.isFinite(value)||value<rule[0]||value>rule[1]||rule[2]&&!Number.isInteger(value))throw new RangeError('Invalid blueprint setting: '+key);
 }
 const settings={...item.settings,...overrides};
 settings.maxSteps=Math.max(settings.maxSteps,settings.maxModelCalls);
 const runtime=runtimeContract(f);
 const requiredTools=[...new Set([...s.tools,...runtime.adapters])];
 return {
  schema_version:'1.0.0',id:item.id,title:item.title+' / '+item.subtitle,
  status:'design-preset-not-benchmarked',license:'MIT',created:'2026-10-09',
  classification:{family:f.name,category:f.category,level:f.level,topology:f.topology,application:s.name},
  description:{mechanism:f.summary,task:s.task,tradeoff:f.tradeoff,domain_failure:s.failure},
  inputs:{description:s.input,example:s.example},runtime_contract:runtime,explanation:explainArchitecture(item),
  model_roles:{primary:{provider:'configure-in-your-adapter',model:'choose-a-compatible-model',temperature:settings.temperature},reviewer:{provider:'configure-in-your-adapter',model:'choose-an-independent-reviewer-when-needed'}},
  orchestration:{...settings,limit_note:'Editorial starting limits; not optimized settings or measured cost.',entry:f.stages[0].id,
   nodes:f.stages.map((stage,i)=>({...stage,role:s.name+' '+stage.name.toLowerCase(),instruction:stage.instruction+' Task: '+s.task+' Context: '+s.context+' Return an inspectable artifact; never fabricate a tool result.',tools:[...new Set([...(runtime.stage_adapters[stage.id]||[]),...(['llm','retrieve'].includes(stage.kind)?s.tools:[])])],replicas:runtime.replication.stage_ids.includes(stage.id)?runtime.replication.capacity:1,input_contract:'Task scope: '+s.input+' Read checked predecessor artifacts and required mechanism state: '+runtime.state_fields.join(', ')+'.',output_contract:'A typed '+stage.name.toLowerCase()+' stage record satisfying this stage instruction, with stage_id, status, artifact, evidence_refs and unresolved. Task-level artifacts are assembled only when their acceptance criteria pass.',failure_contract:'A failed or blocked stage cannot emit a passed artifact. Follow a declared recovery route if authorized; otherwise return an honest partial or blocked result.'})),
   edges:f.edges,terminal_rule:'Return success only after task-level acceptance. Cancellation or any exhausted budget returns the best checked partial result. If no declared route matches, return blocked with its cause. Reaching the last controller phase does not establish task success.',
   condition_contract:'Named edge conditions are predicates implemented by your orchestration adapter; this file does not execute them.'
  },
  tools:requiredTools.map(name=>({name,adapter_required:true,scope:s.context,timeout_seconds:30,argument_validation:'Validate declared scope, typed arguments and user authorization before execution.'})),
  state:{task_id:'required',input_hash:'required',mechanism_fields:runtime.state_fields,artifacts:s.artifacts,trace:'observable tool calls, outputs, gate results and model-call metadata',memory_policy:s.context},
  policy:{external_actions:'require-separately-authorized-adapter',code_execution:'isolated-allowlisted-sandbox-only',source_text:'untrusted-data',secrets:'never-in-prompts-or-exports'},
  outputs:{artifacts:s.artifacts,acceptance_criteria:s.criteria},
  evaluation:{status:'not-run',fixture:s.fixture,mechanism_probe:runtime.mechanism_probe,metrics:s.metrics,baseline:'Compare against one direct model call on the same fixture, provider and inputs.',record:['correctness','latency','model_calls','tokens','tool_failures'],disclaimer:'No accuracy, latency or cost measurement is claimed by this preset.'},
  prompts:{system:systemPrompt(item),role_template:'You own {node.role}. Follow {node.instruction}. Use only {node.tools}. Return {node.output_contract}.',user:s.example},
  provenance:{author:'Agent Deck editorial project',kind:'original-domain-adaptation',references:item.references.map(({id,title,author,url,type})=>({id,title,author,url,type})),reuse_note:'No third-party implementation is redistributed. Sources retain their own licenses. Paper results do not establish this preset’s performance.'},
  integration:{format:'framework-neutral-blueprint',requires:['model adapter','declared tool implementations','edge-condition predicates','budget enforcement','state store when memory is used','task-specific validators'],note:'Not a drop-in LangGraph, CrewAI or AutoGen configuration. Implement or map these contracts in your chosen runtime.'}
 };
}
export function systemPrompt(item){
 const s=item.scenarioData;
 return [
 'You are the '+s.title.toLowerCase()+' using the '+item.title+' workflow.',
 'Objective: '+s.task,
 'Input contract: '+s.input,
 'Mechanism: '+item.summary,
 'Permitted adapters: '+[...new Set([...s.tools,...runtimeContract(item.familyData).adapters])].join(', ')+'.',
 'Context and boundaries: '+s.context,
 'Acceptance criteria: '+s.criteria.join(' '),
 'Return: '+s.artifacts.join(', ')+', with supporting evidence and unresolved limitations.',
 'Use concise decision summaries and observable evidence. Do not request hidden chain-of-thought or claim tools ran when they did not.',
 'Stop when the acceptance criteria are met or the enforced call, step or time budget is exhausted.'
 ].join('\n\n');
}
export function markdown(item){
 const b=blueprint(item),s=item.scenarioData;
 return '# '+b.title+'\n\n'+b.description.mechanism+'\n\n## Task\n\n'+s.task+'\n\nInput: '+s.input+'\n\n## Workflow\n\n'+b.orchestration.nodes.map((n,i)=>(i+1)+'. **'+n.name+'** ('+n.kind+'): '+n.instruction).join('\n')+'\n\n## Architecture explanation\n\n'+b.explanation.note+'\n\nActors: '+(b.explanation.actors.map(a=>a.name).join(', ')||'No model-driven actor')+'.\n\n'+b.explanation.legend+'\n\n'+b.explanation.scope+'\n\n## Transitions\n\n'+b.orchestration.edges.map(e=>'- '+e.from+' → '+e.to+' when '+e.condition).join('\n')+'\n\n## Tools\n\n'+b.tools.map(t=>'- '+t.name+' — implement an access-scoped adapter.').join('\n')+'\n\n## Mechanism contract\n\nInvariant: '+b.runtime_contract.invariant+'\n\nState fields: '+b.runtime_contract.state_fields.join(', ')+'.\n\n'+b.runtime_contract.expansion_note+'\n\n'+b.runtime_contract.stop_contract+'\n\n## Limits and checks\n\n'+item.tradeoff+'\n\n'+s.criteria.map(c=>'- '+c).join('\n')+'\n\n## Evaluation plan\n\nFixture: '+s.fixture+'\n\nMechanism probe: '+b.runtime_contract.mechanism_probe+'\n\nMetrics: '+s.metrics.join(', ')+'. Compare with a direct-call baseline. These experiments have not been run.\n\n## System prompt\n\n'+b.prompts.system+'\n\n## Sources\n\n'+item.references.map(r=>'- ['+r.title+']('+r.url+') — '+r.author).join('\n')+'\n\n## Integration\n\n'+b.integration.note+' Required: '+b.integration.requires.join(', ')+'.\n\nOriginal domain adaptation, MIT licensed. Third-party papers and repositories retain their own licenses.\n';
}
export {sources,scenarios};
