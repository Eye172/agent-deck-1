import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),source=path.join(root,'research'),dist=path.join(root,'dist/research');
const json=async name=>JSON.parse(await readFile(path.join(source,name),'utf8'));
const sha=data=>createHash('sha256').update(data).digest('hex');
const publication=await json('publication.json'),stats=await json('statistics.json'),receipt=await json('study-receipt.json'),replay=await json('replay-check.json');
for(const [name,wanted] of Object.entries(publication.files_sha256)){
 assert.equal(sha(await readFile(path.join(source,name))),wanted,name+' source hash');
 assert.equal(sha(await readFile(path.join(dist,name))),wanted,name+' build hash');
}
for(const [name,wanted] of Object.entries(publication.repository_html_sha256)){
 assert.equal(sha(await readFile(path.join(source,name))),wanted,name+' HTML source hash');
 const built=await readFile(path.join(dist,name),'utf8');assert.match(built,/http-equiv="Content-Security-Policy"/);
}
assert.equal(stats.assigned,2880);assert.equal(stats.observed,2876);assert.equal(stats.infrastructure_interrupted,4);
assert.equal(receipt.completed,stats.observed);assert.equal(receipt.interrupted_unknown_outcomes,stats.infrastructure_interrupted);
assert.equal(sha(await readFile(path.join(source,'evidence.zip'))),receipt.archive_sha256);assert.equal(replay.archive_sha256,receipt.archive_sha256);
assert.equal(sha(await readFile(path.join(source,'paper.pdf'))),receipt.pdf_sha256);
const lines=(await readFile(path.join(source,'trials.csv'),'utf8')).trim().split(/\r?\n/),header=lines.shift().split(','),rows=lines.map(x=>Object.fromEntries(x.split(',').map((v,i)=>[header[i],v])));
assert.equal(rows.length,stats.observed);assert.equal(new Set(rows.map(x=>x.trial_id)).size,stats.observed);
assert.equal(rows.reduce((n,x)=>n+Number(x.actual_tokens),0),stats.actual_tokens_observed_complete_trials);
assert.equal(rows.reduce((n,x)=>n+Number(x.model_calls),0),stats.actual_calls_observed_complete_trials);
for(const c of stats.conditions){const g=rows.filter(x=>x.model===c.model&&x.condition===c.condition);assert.equal(g.length,c.observed);assert.equal(g.filter(x=>x.correct==='True').length,c.correct);assert.equal(c.assigned,360);}
const html=await readFile(path.join(source,'index.html'),'utf8');for(const value of ['2,880','2,876','8,549','6,155,745','115','49','AI-assisted','planned and has not been run','does not validate'])assert.ok(html.includes(value),value);
console.log('Research verified: sealed downloads, built hashes, 2,876 CSV records, calls/tokens and condition counts. No inference.');
