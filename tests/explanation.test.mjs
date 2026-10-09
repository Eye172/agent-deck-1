
import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,catalogById,families,blueprint,markdown} from '../src/catalog.mjs';
import {explainArchitecture} from '../src/explain.mjs';
import {renderGraph,nodeInspector} from '../src/diagram-view.mjs';
const model=id=>explainArchitecture(catalogById[id+'--research']);

test('all explanatory views preserve stage predicates and valid endpoints',()=>{
 for(const item of catalog){
  const m=explainArchitecture(item),ids=new Set(m.nodes.map(n=>n.id));
  assert.equal(ids.size,m.nodes.length,item.id);
  assert.ok(ids.has(m.entry)&&ids.has(m.exit));
  for(const e of m.edges)assert.ok(ids.has(e.from)&&ids.has(e.to),item.id+' invalid edge');
  for(const e of item.familyData.edges)assert.ok(m.edges.some(x=>x.stageEdge===e.from+'>'+e.to&&x.condition===e.condition),item.id+' lost predicate');
  for(const n of m.nodes.filter(n=>n.kind==='llm'))assert.ok(m.actors.some(a=>a.id===n.actorId),item.id+' unlabeled actor');
  for(const n of m.nodes.filter(n=>n.kind!=='llm'))assert.equal(n.actorId||null,null,item.id+' non-agent mislabeled');
 }
});
test('supervisor expands worker slots while retaining one coordinator identity',()=>{
 const m=model('supervisor');
 assert.equal(m.actor_count,4);
 assert.equal(m.nodes.filter(n=>n.stageId==='n1').length,3);
 assert.equal(m.nodes.filter(n=>n.actorId==='manager').length,2);
 assert.equal(m.actors.filter(a=>a.id==='manager').length,1);
 assert.deepEqual(blueprint(catalogById['supervisor--coding']).orchestration.nodes.map(n=>n.replicas),[1,3,1,1]);
});
test('a dynamic-team roster is explicitly select-one and is not exported as four concurrent workers',()=>{
 const m=model('dynamic-team');
 assert.equal(m.instance_mode,'select-one-from-roster');
 assert.equal(m.nodes.filter(n=>n.optional&&n.stageId==='n2').length,4);
 assert.ok(m.edges.some(e=>e.kind==='choice'));
 assert.equal(blueprint(catalogById['dynamic-team--support']).orchestration.nodes.find(n=>n.id==='n2').replicas,1);
});
test('one ReAct identity is reused across calls while infrastructure and human review remain distinct',()=>{
 const m=model('react');assert.equal(m.actor_count,1);
 assert.equal(m.nodes.find(n=>n.id==='n0').actorId,m.nodes.find(n=>n.id==='n3').actorId);
 assert.equal(m.nodes.find(n=>n.id==='n1').kind,'tool');
 assert.ok(m.nodes.some(n=>n.kind==='environment'));
 assert.equal(model('checkpoint-recovery').actor_count,0);
 assert.equal(model('human-gate').nodes.find(n=>n.id==='n1').kind,'human');
});
test('search candidates are data states and retrieval views do not imply index writes',()=>{
 const m=model('lats');
 assert.equal(m.nodes.filter(n=>n.kind==='candidate').length,3);
 assert.ok(m.nodes.some(n=>n.id==='search-state'));
 assert.equal(m.actor_count,1);
 const graph=model('graph-rag');
 assert.ok(graph.nodes.some(n=>n.id==='evidence-graph')&&graph.nodes.some(n=>n.id==='original-passages'));
 assert.ok(!graph.edges.some(e=>e.condition==='read/write'));
});
test('the expanded view has multiple layouts and is carried into every export',()=>{
 const layouts=new Set(),counts=new Set();
 for(const item of catalog){
  const m=explainArchitecture(item);layouts.add(m.layout);counts.add(m.nodes.length);
  assert.deepEqual(blueprint(item).explanation,m);
 }
 assert.ok(layouts.size>=10);assert.ok(counts.size>=5);
 assert.ok(markdown(catalogById['supervisor--research']).includes('## Architecture explanation'));
 assert.ok(markdown(catalogById['supervisor--research']).includes('Specialist C'));
});
test('all SVG variants contain valid geometry and explanatory text is escaped',()=>{
 for(const f of families){
  const item=catalogById[f.id+'--research'];
  for(const options of [{},{full:true},{full:true,vertical:true}]){
   const svg=renderGraph(item,options);
   assert.ok(!svg.includes('NaN')&&!svg.includes('undefined'),f.id);
   assert.match(svg,/viewBox="0 0 \d+ [\d.]+"/);
  }
 }
 const item=structuredClone(catalogById['react--research']);
 item.scenarioData.example='<script>alert(1)</script>';
 assert.ok(nodeInspector(explainArchitecture(item),'input',item).includes('&lt;script&gt;'));
});
