import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {buildSkill,skillOut} from '../scripts/build-skill.mjs';
import {createZip} from '../scripts/zip.mjs';
import {catalog,blueprint} from '../src/catalog.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),output=path.resolve(root,'output');
let temp,index;
const cli=(...args)=>execFileSync(process.execPath,[path.join(skillOut,'scripts/deck.mjs'),...args],{cwd:temp,encoding:'utf8'});
before(async()=>{await mkdir(output,{recursive:true});temp=await mkdtemp(path.join(output,'skill-test-'));await buildSkill(temp);index=JSON.parse(await readFile(path.join(skillOut,'references/index.json'),'utf8'));});
after(async()=>{if(temp){assert.ok(temp.startsWith(output+path.sep));await rm(temp,{recursive:true,force:true});}});
test('offline skill includes every canonical blueprint and source attribution',async()=>{
 assert.equal(index.family_count,64);assert.equal(index.presets.length,384);assert.equal(index.source_count,53);
 for(const item of catalog)assert.deepEqual(JSON.parse(await readFile(path.join(skillOut,'references/presets',item.id+'.json'),'utf8')),blueprint(item));
});
test('portable helper works outside its install directory and preserves useful facet counts',()=>{
 const r=JSON.parse(cli('facets'));assert.equal(r.families,64);assert.equal(r.presets,384);
 assert.deepEqual(r.counts.scenario,{coding:64,content:64,data:64,knowledge:64,research:64,support:64});
 const r2=JSON.parse(cli('search','--query','retrieval','--scenario','KNOWLEDGE','--limit','2'));
 assert.ok(r2.total>2);assert.equal(r2.returned,2);assert.equal(r2.next_offset,2);assert.ok(r2.results.every(p=>p.scenario==='knowledge'));assert.ok(cli('search','--query','totally-nonexistent-keyword').includes('"total": 0'));
});
test('advanced CLI filtering and comparison retain actual mechanism contracts',()=>{
 const r=JSON.parse(cli('search','--category','multi-agent','--level','expert','--scenario','coding'));
 assert.ok(r.results.length);assert.ok(r.results.every(p=>p.category==='Multi-agent'&&p.level==='Expert'&&p.scenario==='coding'));
 const c=JSON.parse(cli('compare','basic-rag--knowledge','graph-rag--knowledge'));
 assert.equal(c.presets.length,2);assert.ok(c.presets.every(p=>p.invariant&&p.sources.length&&p.requires.includes('model adapter')));
 assert.notDeepEqual(c.presets[0].state_fields,c.presets[1].state_fields);
});
test('single-preset JSON and Markdown exports retain provenance and honest evaluation',()=>{
 const b=JSON.parse(cli('get','graph-rag--knowledge'));assert.deepEqual(b,blueprint(catalog.find(p=>p.id===b.id)));
 const m=cli('get',b.id,'--format','markdown');assert.ok(m.includes('https://arxiv.org/abs/2404.16130'));assert.ok(m.includes(b.orchestration.terminal_rule));assert.ok(m.includes(b.evaluation.disclaimer));
});
test('unknown IDs, traversal, malformed options and unsupported settings fail cleanly',()=>{
 for(const args of [['get','constructor'],['get','../../LICENSE'],['get','__proto__'],['search','--limit','999'],['search','--offset','NaN'],['search','--level','Impossible'],['search','--query'],['search','--limit','1','--limit','2'],['get','react--coding','--format','exe'],['compare','react--coding','react--coding']]){
  let failure;try{cli(...args);}catch(e){failure=e;}assert.ok(failure,args.join(' '));assert.equal(failure.status,1);assert.match(String(failure.stderr),/^Agent Deck:/);
 }
});
test('skill archive is deterministic and rejects unsafe/duplicate entry names',async()=>{
 const entries=[{name:'agent-deck/a.txt',data:Buffer.from('alpha')},{name:'INSTALL.md',data:Buffer.from('install')}];assert.deepEqual(createZip(entries),createZip([...entries].reverse()));
 for(const name of ['../bad','/bad','agent-deck/../bad','agent-deck\\bad','agent-deck//bad'])assert.throws(()=>createZip([{name,data:Buffer.from('x')}]));
 assert.throws(()=>createZip([entries[0],entries[0]]));
 const bytes=await readFile(path.join(temp,'agent-deck-skill.zip'));assert.ok(bytes.length<25*1024*1024);
});
