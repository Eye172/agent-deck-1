import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const skillRoot=fileURLToPath(new URL('../',import.meta.url));
const normalize=value=>String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const help=`Agent Deck — offline, read-only catalog helper (Node.js 20+)
  facets
  search [--query "words"] [--category value] [--level value]
         [--scenario value] [--topology value] [--limit 1..20] [--offset n]
  get <preset-id> [--format json|markdown]
  compare <preset-id> <preset-id> [<preset-id>]

Search uses literal AND-word matching, then sorts by complexity and title.
Commands print to stdout, write no files, and make no network requests.
`;

export async function run(args){
 if(!args.length||['help','--help','-h'].includes(args[0]))return help;
 const index=JSON.parse(await readFile(path.join(skillRoot,'references/index.json'),'utf8'));
 const byId=new Map(index.presets.map(item=>[item.id,item]));
 const [command,...rest]=args;
 const lookup=id=>{if(!byId.has(id))throw new Error('Unknown preset ID: '+id+'. Run search to obtain an exact ID.');return byId.get(id);};
 const load=async id=>{
  lookup(id);
  const data=JSON.parse(await readFile(path.join(skillRoot,'references/presets',id+'.json'),'utf8'));
  if(data.id!==id)throw new Error('Preset/index mismatch: '+id);
  return data;
 };
 if(command==='facets'){
  if(rest.length)throw new Error('facets takes no arguments');
  const count=key=>Object.fromEntries([...new Set(index.presets.map(p=>p[key]))].sort().map(v=>[v,index.presets.filter(p=>p[key]===v).length]));
  return {schema_version:1,families:index.family_count,presets:index.presets.length,counts:{category:count('category'),level:count('level'),scenario:count('scenario'),topology:count('topology')},status:index.status};
 }
 if(command==='search'){
  const options=parseOptions(rest,['query','category','level','scenario','topology','limit','offset']);
  const limit=integer(options.limit??'6',1,20,'limit');
  const offset=integer(options.offset??'0',0,index.presets.length,'offset');
  const words=normalize(options.query||'').split(/\s+/).filter(Boolean);
  for(const key of ['category','level','scenario','topology'])if(options[key]!==undefined){
   const values=[...new Set(index.presets.map(p=>p[key]))];
   const match=values.find(value=>normalize(value)===normalize(options[key]));
   if(!match)throw new Error('Invalid '+key+'. Choose: '+values.join(', '));
   options[key]=match;
  }
  const ranks={Basic:0,Intermediate:1,Advanced:2,Expert:3};
  const rows=index.presets.filter(p=>words.every(w=>normalize(p.search_text).includes(w))&&['category','level','scenario','topology'].every(k=>!options[k]||p[k]===options[k]))
   .sort((a,b)=>ranks[a.level]-ranks[b.level]||a.title.localeCompare(b.title)||a.id.localeCompare(b.id));
  return {total:rows.length,offset,returned:rows.slice(offset,offset+limit).length,next_offset:offset+limit<rows.length?offset+limit:null,matching:'literal AND words; ascending complexity, not measured quality',results:rows.slice(offset,offset+limit).map(({search_text,...p})=>p)};
 }
 if(command==='get'){
  if(!rest[0]||rest[0].startsWith('--'))throw new Error('get requires an exact preset ID');
  const options=parseOptions(rest.slice(1),['format']);
  const format=options.format||'json';
  if(!['json','markdown'].includes(format))throw new Error('format must be json or markdown');
  const data=await load(rest[0]);
  return format==='json'?data:asMarkdown(data);
 }
 if(command==='compare'){
  if(rest.length<2||rest.length>3||new Set(rest).size!==rest.length)throw new Error('compare requires two or three distinct preset IDs');
  const presets=await Promise.all(rest.map(load));
  return {status:index.status,note:'Compare design contracts; costs and quality have not been measured.',presets:presets.map(b=>({id:b.id,title:b.title,classification:b.classification,description:b.description,invariant:b.runtime_contract.invariant,adapters:b.tools.map(t=>t.name),state_fields:b.runtime_contract.state_fields,stages:b.orchestration.nodes.map(n=>({id:n.id,name:n.name,kind:n.kind,replicas:n.replicas})),starting_limits:{model_calls:b.orchestration.maxModelCalls,steps:b.orchestration.maxSteps,seconds:b.orchestration.timeoutSeconds},acceptance:b.outputs.acceptance_criteria,evaluation:b.evaluation,requires:b.integration.requires,sources:b.provenance.references}))};
 }
 throw new Error('Unknown command: '+command+'. Run --help.');
}
function parseOptions(args,allowed){
 const options=Object.create(null);
 for(let i=0;i<args.length;i+=2){
  const key=args[i].startsWith('--')?args[i].slice(2):'';
  if(!allowed.includes(key))throw new Error('Unknown option: '+args[i]);
  if(Object.hasOwn(options,key))throw new Error('Duplicate option: --'+key);
  if(args[i+1]===undefined||args[i+1].startsWith('--'))throw new Error('Missing value for --'+key);
  options[key]=args[i+1];
 }
 return options;
}
function integer(value,min,max,name){
 if(!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value))||Number(value)<min||Number(value)>max)throw new Error(name+' must be an integer from '+min+' to '+max);
 return Number(value);
}
function asMarkdown(b){
 const bullets=items=>items.map(item=>'- '+item).join('\n');
 return '# '+b.title+'\n\nID: '+b.id+' · '+b.status+' · MIT\n\n'+b.description.mechanism+'\n\n## Task\n\n'+b.description.task+'\n\nInput: '+b.inputs.description+'\n\n## Stages\n\n'+b.orchestration.nodes.map(n=>'### '+n.id+' — '+n.name+' ('+n.kind+')\n\n'+n.instruction+'\n\nAdapters: '+n.tools.join(', ')+'\n\nOutput: '+n.output_contract+'\n\nFailure: '+n.failure_contract).join('\n\n')+'\n\n## Transitions\n\n'+bullets(b.orchestration.edges.map(e=>e.from+' → '+e.to+' when '+e.condition))+'\n\n## Runtime\n\n'+b.runtime_contract.invariant+'\n\n'+b.runtime_contract.stop_contract+'\n\n'+b.orchestration.terminal_rule+'\n\n## Task acceptance\n\n'+bullets(b.outputs.acceptance_criteria)+'\n\n## Tradeoff\n\n'+b.description.tradeoff+'\n\n## Evaluation (not run)\n\n'+b.evaluation.fixture+'\n\n'+b.evaluation.mechanism_probe+'\n\n'+b.evaluation.disclaimer+'\n\n## Integration\n\n'+b.integration.note+'\n\n'+bullets(b.integration.requires)+'\n\n## Sources\n\n'+bullets(b.provenance.references.map(r=>'['+r.title+']('+r.url+') — '+r.author))+'\n';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const result=await run(process.argv.slice(2));process.stdout.write(typeof result==='string'?result:JSON.stringify(result,null,2)+'\n');}
 catch(error){process.stderr.write('Agent Deck: '+error.message+'\n');process.exitCode=1;}
}
