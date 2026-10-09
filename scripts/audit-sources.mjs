import fs from 'node:fs/promises';
import {sources} from '../src/sources.mjs';
const unescape=s=>s.replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n));
const strip=s=>unescape(s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ')).trim();
let index=0;const results=[];
async function worker(){while(index<sources.length){const source=sources[index++];let row={id:source.id,url:source.url,checked_at:new Date().toISOString()};
try{const response=await fetch(source.url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'AgentDeck source verification; read-only portfolio audit'}});const html=await response.text();
row={...row,status:response.status,resolved_url:response.url,title:strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),citation_title:unescape(html.match(/name="citation_title"\s+content="([^"]*)"/i)?.[1]||''),authors:[...html.matchAll(/name="citation_author"\s+content="([^"]*)"/gi)].map(m=>unescape(m[1])),abstract:strip(html.match(/<blockquote[^>]*class="abstract[^"]*"[^>]*>([\s\S]*?)<\/blockquote>/i)?.[1]||''),description:unescape(html.match(/(?:name|property)="(?:description|og:description)"\s+content="([^"]*)"/i)?.[1]||'').slice(0,1800)};
if(source.type!=='Paper'){const text=strip(html);const needles={effective:'Prompt chaining',contextual:'BM25',crew:'hierarchical',selector:'SelectorGroupChat',dlbook:'Goodfellow',d2l:'Aston',pml:'Murphy',reasonmaxxer:'forked from'};const needle=needles[source.id];const at=needle?text.toLowerCase().indexOf(needle.toLowerCase()):-1;row.excerpt=at<0?row.description:text.slice(Math.max(0,at-120),at+900);}
}catch(e){row.error=e.message;}results.push(row);console.log(source.id+' '+(row.status||row.error));}}
await Promise.all([worker(),worker(),worker()]);
results.sort((a,b)=>sources.findIndex(s=>s.id===a.id)-sources.findIndex(s=>s.id===b.id));
await fs.mkdir('output',{recursive:true});await fs.writeFile('output/source-network-check.json',JSON.stringify({checked_at:new Date().toISOString(),method:'Read-only GET of each registered primary URL; metadata and abstracts, not a reproduction of experiments.',sources:results},null,2));
console.log(JSON.stringify({total:results.length,failures:results.filter(r=>r.status!==200)},null,2));
