export const normalize=text=>String(text).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function matches(item,state={},ignoreFacet=''){
 const words=normalize(state.query||'').split(/\s+/).filter(Boolean);
 if(!words.every(w=>normalize(item.searchText).includes(w)))return false;
 for(const key of ['category','level','scenario','topology']){
  if(key===ignoreFacet)continue;
  const selected=state[key]||[];
  if(selected.length&&!selected.includes(item[key]))return false;
 }
 if(state.savedOnly&&!state.saved?.includes(item.id))return false;
 return true;
}
export function filterCatalog(catalog,state){return catalog.filter(item=>matches(item,state));}
export function facetCounts(catalog,state,key,values){
 const scope=catalog.filter(item=>matches(item,state,key));
 return Object.fromEntries(values.map(value=>[value,scope.filter(item=>item[key]===value).length]));
}
export function sortCatalog(items,sort='featured'){
 const list=[...items];
 if(sort==='name')return list.sort((a,b)=>a.title.localeCompare(b.title)||a.subtitle.localeCompare(b.subtitle));
 const ranks={Basic:0,Intermediate:1,Advanced:2,Expert:3};
 if(sort==='level')return list.sort((a,b)=>ranks[a.level]-ranks[b.level]||a.title.localeCompare(b.title));
 const featured=['react','supervisor','graph-rag','llmcompiler','evaluator-optimizer','tree-of-thoughts','blackboard','basic-rag','memory-tiers','lats','research-swarm','mixture-of-agents'];
 return list.sort((a,b)=>{
  const priority=x=>{let n=featured.indexOf(x.family);return n<0?100:n;};
  return (a.scenario==='research'?0:1)-(b.scenario==='research'?0:1)||priority(a)-priority(b)||a.title.localeCompare(b.title);
 });
}
