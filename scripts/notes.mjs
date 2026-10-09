import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {root} from './build.mjs';
import {families,categories,sources} from '../src/catalog.mjs';
import {runtimeContract} from '../src/contracts.mjs';
let taxonomy='# Architecture taxonomy\n\n64 mechanism families, grouped for navigation. Six domain adaptations of each mechanism are generated separately. Complexity is editorial.\n\n';
for(const category of categories){
 const items=families.filter(f=>f.category===category);
 taxonomy+='## '+category+' ('+items.length+')\n\n';
 for(const f of items){
  const c=runtimeContract(f);
  taxonomy+='### '+f.name+'\n\n**ID:** '+f.id+' · **Level:** '+f.level+' · **Wiring:** '+f.topology+'\n\n'+f.summary+'\n\nStages: '+f.stages.map(n=>n.name).join(' → ')+'.\n\nInvariant: '+c.invariant+'\n\nTradeoff: '+f.tradeoff+'\n\nFailure probe: '+c.mechanism_probe+'\n\nState: '+c.state_fields.join(', ')+'.\n\nReferences: '+f.refs.map(id=>{const s=sources.find(x=>x.id===id);return '['+s.title+']('+s.url+')';}).join(', ')+'.\n\n';
 }
}
await writeFile(path.join(root,'docs','TAXONOMY.md'),taxonomy);
const researchPath=path.join(root,'docs','RESEARCH.md');
const existing=(await readFile(researchPath,'utf8')).split('\n<!-- reference-registry -->')[0];
let registry='\n<!-- reference-registry -->\n\n## Reference registry ('+sources.length+')\n\n';
for(const type of ['Guide','Paper','Documentation','Repository','Book']){
 registry+='### '+type+'\n\n';
 for(const s of sources.filter(x=>x.type===type))registry+='- ['+s.title+']('+s.url+') — '+s.author+'.'+(s.note?' '+s.note:'')+'\n';
 registry+='\n';
}
await writeFile(researchPath,existing+registry);
console.log('Updated taxonomy and '+sources.length+' references.');
