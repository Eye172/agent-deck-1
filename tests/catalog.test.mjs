import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,catalogById,families,levels,categories,scenarios,sources,blueprint,markdown,systemPrompt} from '../src/catalog.mjs';
import {filterCatalog,facetCounts,sortCatalog} from '../src/filter.mjs';

test('library separates 64 mechanisms from their 384 application adaptations',()=>{
 assert.equal(families.length,64);assert.equal(catalog.length,384);
 assert.equal(new Set(families.map(x=>x.id)).size,64);
 assert.equal(new Set(catalog.map(x=>x.id)).size,384);
 for(const family of families)assert.deepEqual(catalog.filter(x=>x.family===family.id).map(x=>x.scenario),scenarios.map(x=>x.id));
 assert.equal(new Set(families.map(x=>x.topology)).size,46);
 assert.deepEqual([...new Set(families.map(x=>x.category))].sort(),[...categories].sort());
 for(const level of levels)assert.ok(families.some(x=>x.level===level));
});
test('all cited mechanisms resolve to primary source metadata',()=>{
 assert.equal(new Set(sources.map(x=>x.id)).size,sources.length);
 for(const item of catalog)for(const ref of item.references){
  assert.ok(ref?.title,item.id);assert.ok(ref.author);
  assert.equal(new URL(ref.url).protocol,'https:');
 }
});
test('workflow edges are valid, all stages reachable and complex loops explicit',()=>{
 for(const family of families){
  const ids=new Set(family.stages.map(x=>x.id));
  assert.equal(ids.size,family.stages.length);
  const reached=new Set([family.stages[0].id]);
  for(let i=0;i<family.stages.length;i++)for(const edge of family.edges){
   assert.ok(ids.has(edge.from)&&ids.has(edge.to),family.id);
   assert.ok(edge.condition.trim());if(reached.has(edge.from))reached.add(edge.to);
  }
  assert.equal(reached.size,ids.size,family.id+' has an unreachable stage');
  for(const node of family.stages)assert.ok(node.instruction.length>25,family.id);
 }
 for(const id of ['react','tree-of-thoughts','lats','checkpoint-recovery','supervisor']){
  const family=families.find(f=>f.id===id);
  assert.ok(family.edges.some(e=>Number(e.to.slice(1))<Number(e.from.slice(1))),id+' must represent feedback');
 }
});
test('published JSON and Markdown carry provenance, limits, task-specific evaluation and integration boundaries',()=>{
 for(const item of catalog){
  const json=JSON.parse(JSON.stringify(blueprint(item)));
  assert.equal(json.id,item.id);assert.equal(json.status,'design-preset-not-benchmarked');
  assert.equal(json.evaluation.status,'not-run');assert.ok(json.evaluation.fixture);
  assert.equal(json.integration.format,'framework-neutral-blueprint');
  assert.ok(json.integration.requires.includes('edge-condition predicates'));
  assert.ok(json.orchestration.maxModelCalls>=1&&json.orchestration.maxModelCalls<=80);
  assert.ok(json.orchestration.maxSteps>=json.orchestration.maxModelCalls);
  assert.ok(json.orchestration.timeoutSeconds>0);
  assert.ok(json.outputs.acceptance_criteria.length>=3);
  assert.equal(json.provenance.references.length,item.references.length);
  const guide=markdown(item);assert.ok(guide.includes(item.title));assert.ok(guide.includes('experiments have not been run'));
  for(const ref of item.references)assert.ok(guide.includes(ref.url));
 }
});
test('adaptations change evidence, tool, privacy and acceptance contracts rather than just titles',()=>{
 const coding=blueprint(catalogById['react--coding']);
 const knowledge=blueprint(catalogById['react--knowledge']);
 assert.notDeepEqual(coding.tools,knowledge.tools);
 assert.notDeepEqual(coding.outputs.acceptance_criteria,knowledge.outputs.acceptance_criteria);
 assert.notEqual(coding.state.memory_policy,knowledge.state.memory_policy);
 assert.notEqual(coding.inputs.example,knowledge.inputs.example);
 assert.ok(systemPrompt(catalogById['react--coding']).includes('sandbox'));
 assert.ok(systemPrompt(catalogById['react--knowledge']).includes('access'));
});
test('custom settings preserve the rest of a blueprint and do not mutate catalog defaults',()=>{
 const item=catalogById['react--research'],before=JSON.stringify(item);
 const custom=blueprint(item,{temperature:0.7,maxModelCalls:17,timeoutSeconds:300});
 assert.equal(custom.model_roles.primary.temperature,0.7);
 assert.equal(custom.orchestration.maxModelCalls,17);assert.equal(custom.orchestration.timeoutSeconds,300);
 assert.equal(custom.orchestration.edges,item.familyData.edges);assert.equal(JSON.stringify(item),before);
});
test('search combines words and facets with OR within a facet and AND across facets',()=>{
 const result=filterCatalog(catalog,{query:'graph retrieval',level:['Advanced','Expert'],scenario:['knowledge']});
 assert.ok(result.length>0);
 for(const item of result){assert.equal(item.scenario,'knowledge');assert.ok(['Advanced','Expert'].includes(item.level));assert.ok(item.searchText.includes('graph'));}
 assert.equal(filterCatalog(catalog,{query:'zzzz-no-such-pattern'}).length,0);
 assert.equal(filterCatalog(catalog,{query:'ReAct',scenario:['coding']}).length,1);
 assert.equal(filterCatalog(catalog,{level:['Basic','Expert']}).length,catalog.filter(x=>['Basic','Expert'].includes(x.level)).length);
});
test('facet counts reflect the remaining facets without hiding alternatives in the current facet',()=>{
 const state={level:['Expert'],scenario:['research'],category:['Planning']};
 const counts=facetCounts(catalog,state,'category',categories);
 assert.equal(counts.Planning,catalog.filter(x=>x.level==='Expert'&&x.scenario==='research'&&x.category==='Planning').length);
 assert.ok(counts.Memory>0,'alternatives must remain visible');
 const levelsCounts=facetCounts(catalog,state,'level',levels);
 assert.ok(levelsCounts.Intermediate>0,'current level must not suppress intermediate planning');
});
test('saved-only browsing and sorting are deterministic and do not mutate the library',()=>{
 const saved=[catalog[0].id,catalog[2].id];
 assert.deepEqual(filterCatalog(catalog,{savedOnly:true,saved}).map(x=>x.id),saved);
 assert.equal(filterCatalog(catalog,{savedOnly:true,saved:[]}).length,0);
 const original=catalog.map(x=>x.id);
 const sorted=sortCatalog(catalog,'level');let last=-1;
 for(const item of sorted){const rank=levels.indexOf(item.level);assert.ok(rank>=last);last=rank;}
 assert.deepEqual(catalog.map(x=>x.id),original);
 assert.equal(sortCatalog(catalog)[0].id,'react--research');
});

test('every mechanism has an explicit invariant and failure probe, with storage adapters for memory stages',()=>{
 for(const family of families){
  const b=blueprint(catalogById[family.id+'--research']);
  assert.ok(b.runtime_contract.invariant.length>35,family.id);
  assert.ok(b.runtime_contract.mechanism_probe.length>30,family.id);
  assert.ok(b.state.mechanism_fields.length>=3,family.id);
  const declared=new Set(b.tools.map(x=>x.name));
  for(const node of b.orchestration.nodes){
   for(const tool of node.tools)assert.ok(declared.has(tool),family.id+' undeclared adapter');
   if(node.kind==='memory')assert.ok(node.tools.length>0,family.id+' missing storage adapter');
  }
 }
 const memory=blueprint(catalogById['memory-tiers--knowledge']);
 assert.ok(memory.tools.some(t=>t.name==='read_memory'));
 assert.ok(markdown(catalogById['memory-tiers--knowledge']).includes('Mechanism contract'));
});

test('fan-out applies to workers and candidates while managers and final aggregators stay single',()=>{
 const supervisor=blueprint(catalogById['supervisor--coding']);
 assert.deepEqual(supervisor.orchestration.nodes.map(n=>n.replicas),[1,3,1,1]);
 const swarm=blueprint(catalogById['research-swarm--research']);
 assert.deepEqual(swarm.orchestration.nodes.map(n=>n.replicas),[1,4,1,1]);
 const hybrid=blueprint(catalogById['hybrid-rag--knowledge']);
 assert.deepEqual(hybrid.orchestration.nodes.map(n=>n.replicas),[2,1,1,1]);
 const selected=blueprint(catalogById['dynamic-team--support']);
 assert.equal(selected.runtime_contract.replication.mode,'select-one-from-pool');
 assert.deepEqual(selected.orchestration.nodes.map(n=>n.replicas),[1,1,1,1]);
 assert.equal(selected.runtime_contract.replication.capacity,4);
});
test('author names are searchable alongside mechanism names',()=>{
 assert.ok(filterCatalog(catalog,{query:'Shunyu Yao'}).some(x=>x.family==='react'));
});
