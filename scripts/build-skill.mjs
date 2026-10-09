import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {catalog,families,blueprint,sources} from '../src/catalog.mjs';
import {createZip} from './zip.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
export const skillOut=path.resolve(root,'output/skills/agent-deck');
export async function buildSkill(dist){
 if(!skillOut.startsWith(path.resolve(root,'output')+path.sep)||path.basename(skillOut)!=='agent-deck')throw new Error('Unsafe generated skill path');
 await rm(skillOut,{recursive:true,force:true});
 const entries=[];
 const put=async(name,data)=>{
  await mkdir(path.dirname(path.join(skillOut,name)),{recursive:true});
  await writeFile(path.join(skillOut,name),data);
  entries.push({name:'agent-deck/'+name,data:Buffer.from(data)});
 };
 for(const name of ['SKILL.md','scripts/deck.mjs','agents/openai.yaml','references/runtime-guide.md'])await put(name,await readFile(path.join(root,'integrations/agent-deck',name)));
 await put('LICENSE',await readFile(path.join(root,'LICENSE')));
 const presets=catalog.map(item=>blueprint(item));
 const index={schema_version:1,status:'design-preset-not-benchmarked',family_count:families.length,preset_count:catalog.length,source_count:sources.length,presets:catalog.map(p=>({id:p.id,family:p.family,title:p.title,scenario:p.scenario,application:p.scenarioData.name,category:p.category,level:p.level,topology:p.topology,mechanism:p.summary,tradeoff:p.tradeoff,sources:p.references.map(r=>({title:r.title,author:r.author,url:r.url})),search_text:p.searchText}))};
 await put('references/index.json',JSON.stringify(index)+'\n');
 for(const b of presets)await put('references/presets/'+b.id+'.json',JSON.stringify(b,null,2)+'\n');
 const snapshot=createHash('sha256').update(JSON.stringify(presets)).digest('hex');
 await put('references/snapshot.json',JSON.stringify({package_version:'1.0.0',date:'2026-10-09',family_count:families.length,preset_count:catalog.length,source_count:sources.length,catalog_sha256:snapshot,note:'Offline snapshot of canonical site blueprints; evaluation not run.'},null,2)+'\n');
 const guide=await readFile(path.join(root,'docs/IDE_INTEGRATION.md'));
 entries.push({name:'INSTALL.md',data:guide});
 await mkdir(dist,{recursive:true});
 const zip=createZip(entries);
 await writeFile(path.join(dist,'agent-deck-skill.zip'),zip);
 await writeFile(path.join(dist,'ide-guide.md'),guide);
 await writeFile(path.join(dist,'agent-deck-skill.sha256'),createHash('sha256').update(zip).digest('hex')+'  agent-deck-skill.zip\n');
 console.log('Packed offline skill: '+catalog.length+' presets, '+zip.length+' bytes.');
 return {skillOut,files:entries.length,zip_bytes:zip.length,catalog_sha256:snapshot};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildSkill(path.resolve(root,'dist'));
