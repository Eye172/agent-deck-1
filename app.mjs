import {track} from './analytics.mjs';
import {explainArchitecture} from './lib/explain.mjs';
import {renderGraph,wiringMarkup,nodeInspector} from './lib/diagram-view.mjs';
import {runtimeContract} from './lib/contracts.mjs';
import {catalog,catalogById,families,levels,categories,categoryColors,scenarios,sources,blueprint,systemPrompt} from './lib/catalog.mjs';
import {filterCatalog,facetCounts,sortCatalog} from './lib/filter.mjs';

const $=id=>document.getElementById(id);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=items=>'<ul>'+items.map(x=>'<li>'+escape(x)+'</li>').join('')+'</ul>';
// Preserve the existing saved shelf across the brand rename.
const storageKey='agent-library:saved:v1';
let saved=[],storageAvailable=true;
try { saved=JSON.parse(localStorage.getItem(storageKey)||'[]'); if(!Array.isArray(saved))saved=[]; }
catch { saved=[];storageAvailable=false; }
saved=[...new Set(saved.filter(id=>typeof id==='string'&&Object.hasOwn(catalogById,id)))];
let state={query:'',category:[],level:[],scenario:[],topology:[],savedOnly:false,saved};
let diagramSelection=null;
let limit=24,sort='featured',compare=[],current=null,currentTab='overview',readingType='All',toastTimer,returnFocus=null,returnFocusKey=null;
const tabs=[['overview','Overview'],['wiring','Wiring'],['prompt','Prompt'],['blueprint','Blueprint'],['sources','Sources']];
const topologies=[...new Set(families.map(x=>x.topology))].sort();
const facetDefs=[
 {key:'category',title:'Architecture',values:categories,host:'category-filters'},
 {key:'level',title:'Complexity',values:levels,host:'level-filters'},
 {key:'scenario',title:'Application',values:scenarios.map(s=>s.id),host:'scenario-filters',label:value=>scenarios.find(s=>s.id===value).name},
 {key:'topology',title:'Wiring / subtypes',values:topologies,host:'topology-filters',collapsed:true}
];
function notify(message){
 clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;
 toastTimer=setTimeout(()=>{$('toast').hidden=true;},3200);
}
function restoreFocus(key){
 if(key)document.querySelector('[data-focus="'+CSS.escape(key)+'"]')?.focus({preventScroll:true});
}
function urlState(){
 const p=new URLSearchParams(location.search);
 state.query=p.get('q')||'';
 for(const def of facetDefs)state[def.key]=(p.get(def.key)||'').split(',').filter(v=>def.values.includes(v));
 state.savedOnly=p.get('saved')==='1';
 sort=['featured','level','name'].includes(p.get('sort'))?p.get('sort'):'featured';
 $('search').value=state.query;$('sort').value=sort;
 return p.get('preset');
}
function syncURL(){
 const p=new URLSearchParams();
 if(state.query)p.set('q',state.query);
 for(const def of facetDefs)if(state[def.key].length)p.set(def.key,state[def.key].join(','));
 if(state.savedOnly)p.set('saved','1');
 if(sort!=='featured')p.set('sort',sort);
 if(current&&$('detail').open)p.set('preset',current.id);
 const query=p.toString();
 history.replaceState(null,'',location.pathname+(query?'?'+query:'')+location.hash);
}
function renderFilters(){
 for(const def of facetDefs){
  const host=$(def.host),wasOpen=host.querySelector('details')?.open;
  const counts=facetCounts(catalog,state,def.key,def.values);
  const options=def.values.map(value=>{
   const selected=state[def.key].includes(value);
   const label=def.label?def.label(value):value;
   return '<label class="filter-option"><input type="checkbox" data-facet="'+def.key+'" data-value="'+escape(value)+'" data-focus="facet-'+def.key+'-'+escape(value)+'" '+(selected?'checked ':'')+(counts[value]===0&&!selected?'disabled ':'')+'><span>'+escape(label)+'</span><span class="facet-count" aria-label="'+counts[value]+' presets">'+counts[value]+'</span></label>';
  }).join('');
  host.innerHTML=def.collapsed?'<details class="filter-group" '+(wasOpen?'open':'')+'><summary>'+escape(def.title)+' <span>'+def.values.length+'</span></summary>'+options+'</details>':'<section class="filter-group"><h3>'+escape(def.title)+'</h3>'+options+'</section>';
 }
 const total=facetDefs.reduce((sum,def)=>sum+state[def.key].length,0);
 $('filter-total').textContent=total;
 $('saved-count').textContent=saved.length;
 $('saved-toggle').setAttribute('aria-pressed',String(state.savedOnly));
 $('saved-toggle').querySelector('.ui-icon').setAttribute('data-filled',String(state.savedOnly));
 const chips=[];
 if(state.query)chips.push('<button class="filter-chip" data-remove="query">“'+escape(state.query)+'” <span aria-hidden="true">×</span><span class="sr-only">Remove search</span></button>');
 for(const def of facetDefs)for(const value of state[def.key])chips.push('<button class="filter-chip" data-remove="'+def.key+'" data-value="'+escape(value)+'">'+escape(def.label?def.label(value):value)+' <span aria-hidden="true">×</span><span class="sr-only">Remove filter</span></button>');
 if(state.savedOnly)chips.push('<button class="filter-chip" data-remove="savedOnly">Saved <span aria-hidden="true">×</span><span class="sr-only">Show all presets</span></button>');
 $('active-filters').innerHTML=chips.join('');
}
function graph(item,full=false){return renderGraph(item,{full,vertical:full&&matchMedia('(max-width:650px)').matches,activeStage:diagramSelection});}
const starIcon=filled=>'<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"'+(filled?' data-filled="true"':'')+'><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/></svg>';
const compareIcon='<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4"/></svg>';
function card(item){
 const rank=levels.indexOf(item.level)+1;
 return '<article class="cartridge-card"><button class="cartridge" data-open="'+item.id+'" data-color="'+categoryColors[item.category]+'" data-focus="open-'+item.id+'" aria-label="Explore '+escape(item.title)+' for '+escape(item.scenarioData.name)+'"><span class="cart-screw left" aria-hidden="true"></span><span class="cart-screw right" aria-hidden="true"></span><span class="cart-vents" aria-hidden="true"></span><span class="cart-label"><span class="cart-category"><span>'+escape(item.category)+'</span><span>No. '+item.number+'</span></span><span class="cart-title">'+escape(item.title)+'</span><span class="cart-graph">'+graph(item)+'</span><span class="cart-bottom"><span class="cart-level"><span class="level-bars" aria-hidden="true">'+'▮'.repeat(rank)+'▯'.repeat(4-rank)+'</span>'+item.level+'</span><span title="'+escape(item.topology)+'">'+escape(item.topology)+'</span></span></span><span class="cart-footer" aria-hidden="true">'+Array.from({length:15},()=>'<i></i>').join('')+'</span></button><div class="card-caption"><p><span>'+escape(item.subtitle)+'</span><span class="caption-topology">'+escape(item.topology)+'</span></p><div class="caption-actions"><button data-save="'+item.id+'" data-focus="save-'+item.id+'" aria-pressed="'+saved.includes(item.id)+'" aria-label="'+(saved.includes(item.id)?'Unsave ':'Save ')+escape(item.title)+' for '+escape(item.scenarioData.name)+'">'+starIcon(saved.includes(item.id))+'</button><button class="compare-toggle" data-compare="'+item.id+'" data-focus="compare-'+item.id+'" aria-pressed="'+compare.includes(item.id)+'" aria-label="'+(compare.includes(item.id)?'Remove ':'Compare ')+escape(item.title)+' for '+escape(item.scenarioData.name)+'">'+compareIcon+'</button></div></div></article>';
}
function renderCatalog(){
 const focus=document.activeElement?.dataset?.focus;
 renderFilters();
 const items=sortCatalog(filterCatalog(catalog,state),sort);
 $('cards').innerHTML=items.slice(0,limit).map(card).join('');
 $('result-count').textContent=items.length+' cartridge'+(items.length===1?'':'s')+(state.query||state.savedOnly||facetDefs.some(d=>state[d.key].length)?' matched':' on the shelf');
 $('empty').hidden=items.length>0;
 $('load-more').hidden=limit>=items.length;
 $('page-status').textContent=items.length?'Showing '+Math.min(limit,items.length)+' of '+items.length:'';
 $('page-status').parentElement.hidden=items.length===0;
 renderCompareBar();restoreFocus(focus);
}
function reset(){
 state={query:'',category:[],level:[],scenario:[],topology:[],savedOnly:false,saved};
 $('search').value='';limit=24;renderCatalog();syncURL();
}
function toggleSaved(id){
 if(saved.includes(id))saved=saved.filter(x=>x!==id);else saved.push(id);
 state.saved=saved;
 try {localStorage.setItem(storageKey,JSON.stringify(saved));storageAvailable=true;}
 catch {storageAvailable=false;}
 renderCatalog();
 const button=$('detail').querySelector('.detail-save');
 if(current&&button){
  button.innerHTML=starIcon(saved.includes(current.id));
  button.setAttribute('aria-pressed',String(saved.includes(current.id)));
  button.setAttribute('aria-label',(saved.includes(current.id)?'Unsave ':'Save ')+current.title);
 }
 notify((saved.includes(id)?'Saved to your shelf.':'Removed from your shelf.')+(!storageAvailable?' Browser storage is unavailable; this session only.':''));
}
function toggleCompare(id){
 if(compare.includes(id))compare=compare.filter(x=>x!==id);
 else if(compare.length<3)compare.push(id);
 else {notify('Choose up to three cartridges. Remove one to add another.');return;}
 renderCatalog();
}
function renderCompareBar(){
 $('compare-bar').hidden=compare.length===0;
 $('compare-count').textContent=compare.length+' / 3 selected';
 $('compare-names').innerHTML=compare.map(id=>'<span title="'+escape(catalogById[id].title+' / '+catalogById[id].scenarioData.name)+'">'+escape(catalogById[id].title)+'</span>').join('');
 $('compare-open').disabled=compare.length<2;
 $('compare-open').textContent=compare.length<2?'Select another':'Compare →';
 document.body.classList.toggle('has-comparison',compare.length>0);
}
function closeDialog(dialog,updateURL=true){
 if(dialog.id==='detail'){current=null;if(updateURL)syncURL();}
 dialog.close();
 if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');
}
function openDialog(id){
 const dialog=$(id);
 if(dialog.open)return;
 returnFocus=document.activeElement;returnFocusKey=returnFocus?.dataset?.focus;
 document.querySelectorAll('dialog[open]').forEach(d=>closeDialog(d));
 dialog.showModal();document.body.classList.add('modal-open');
}
function openDetail(id){
 const item=catalogById[id];if(!item)return;
 current=item;currentTab='overview';diagramSelection=explainArchitecture(item).groups[0].nodeIds[0];
 $('detail-eyebrow').textContent='CARTRIDGE '+item.number+' / '+item.category.toUpperCase();
 $('detail-content').innerHTML='<div class="detail-top"><div><h2 id="detail-title">'+escape(item.title)+'</h2><p class="detail-subtitle">'+escape(item.subtitle)+'</p><div class="detail-tags"><span>'+item.level+'</span><span>'+escape(item.topology)+'</span><span>'+item.scenarioData.name+'</span></div></div><button class="detail-save" data-save="'+item.id+'" aria-pressed="'+saved.includes(id)+'" aria-label="'+(saved.includes(id)?'Unsave ':'Save ')+escape(item.title)+'">'+starIcon(saved.includes(id))+'</button></div><div class="detail-tabs" role="tablist" aria-label="Preset details">'+tabs.map(([key,name])=>'<button role="tab" id="tab-'+key+'" data-tab="'+key+'" aria-controls="detail-panel" aria-selected="'+(key===currentTab)+'" tabindex="'+(key===currentTab?0:-1)+'">'+name+'</button>').join('')+'</div><section id="detail-panel" class="detail-body" role="tabpanel" aria-labelledby="tab-overview" tabindex="0"></section><div class="detail-footer"><span>Original adaptation · MIT · Evaluation pending</span><div class="downloads"><a class="button secondary" href="./presets/'+id+'.md" download="'+id+'.md">Markdown ↓</a><a class="button primary" href="./presets/'+id+'.json" download="'+id+'.json">JSON blueprint ↓</a></div></div>';
 renderDetailTab();openDialog('detail');syncURL();track('preset-open',{preset:id});
}
function selectDiagramNode(id){
 if(!current||currentTab!=='wiring')return;
 const model=explainArchitecture(current),node=model.nodes.find(n=>n.id===id);if(!node)return;
 diagramSelection=id;
 for(const element of $('detail-panel').querySelectorAll('[data-diagram-node]')){const active=element.dataset.diagramNode===id;element.classList.toggle('is-active',active);element.setAttribute('aria-pressed',String(active));}
 for(const element of $('detail-panel').querySelectorAll('[data-flow-step]'))element.setAttribute('aria-pressed',String(element.dataset.flowStep===node.stageId));
 $('node-inspector').innerHTML=nodeInspector(model,id,current);
 $('node-inspector').scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
}
function sourceMarkup(source){
 return '<article class="source-item"><span class="source-type">'+escape(source.type)+'</span><div><a href="'+escape(source.url)+'" target="_blank" rel="noopener noreferrer">'+escape(source.title)+' ↗</a><p>'+escape(source.author)+'</p>'+(source.note?'<p class="source-note">'+escape(source.note)+'</p>':'')+'</div></article>';
}
function renderDetailTab(){
 const item=current;if(!item)return;
 const s=item.scenarioData,f=item.familyData,c=runtimeContract(f),panel=$('detail-panel');
 for(const button of $('detail').querySelectorAll('[data-tab]')){
  button.setAttribute('aria-selected',String(button.dataset.tab===currentTab));
  button.tabIndex=button.dataset.tab===currentTab?0:-1;
 }
 panel.setAttribute('aria-labelledby','tab-'+currentTab);
 if(currentTab==='overview'){
  panel.innerHTML='<h3>The mechanism</h3><p>'+escape(item.summary)+'</p><div class="detail-columns"><div><h4>A task to try</h4><p>'+escape(s.task)+'</p><h4>Example input</h4><p class="example-input">'+escape(s.example)+'</p><h4>Expected artifacts</h4>'+list(s.artifacts)+'</div><div><h4>Acceptance criteria</h4>'+list(s.criteria)+'<h4>Required tool adapters</h4>'+list([...new Set([...s.tools,...c.adapters])])+'<h4>Input contract</h4><p>'+escape(s.input)+'</p></div></div><p class="detail-callout"><strong>Tradeoff.</strong> '+escape(item.tradeoff)+'<br><strong>Domain failure to watch.</strong> '+escape(s.failure)+'</p><h4>Mechanism invariant</h4><p>'+escape(c.invariant)+'</p><h4>Evaluate before adopting</h4><p>'+escape(s.fixture)+'</p>'+list(s.metrics)+'<h4>Mechanism probe</h4><p>'+escape(c.mechanism_probe)+'</p><p>Compare against a direct model call with the same inputs and provider. No measured performance is claimed.</p>';
 } else if(currentTab==='wiring'){
  diagramSelection=explainArchitecture(item).groups[0].nodeIds[0];
  panel.innerHTML=wiringMarkup(item,matchMedia('(max-width:650px)').matches)+'<h4>Exact transition contract</h4><table class="transition-table"><thead><tr><th scope="col">From</th><th scope="col">To</th><th scope="col">When</th></tr></thead><tbody>'+f.edges.map(e=>'<tr><td>'+escape(f.stages.find(n=>n.id===e.from).name)+'</td><td>'+escape(f.stages.find(n=>n.id===e.to).name)+'</td><td>'+escape(e.condition)+'</td></tr>').join('')+'</tbody></table><p class="detail-callout">Starting limits: '+item.settings.maxModelCalls+' model calls, '+item.settings.maxSteps+' orchestration steps, '+item.settings.timeoutSeconds+' seconds. Stop on acceptance or any exhausted budget. These are editorial defaults.</p><h4>Required state</h4>'+list(c.state_fields)+'<h4>Context and memory</h4><p>'+escape(s.context)+'</p>';
 } else if(currentTab==='prompt'){
  panel.innerHTML='<h3>A starting prompt</h3><p>Pair this domain brief with each node’s instruction and implement the declared tools. A prompt alone does not execute the architecture.</p><div class="code-toolbar"><span>SYSTEM / ORIGINAL DOMAIN ADAPTATION</span><button data-copy="system">Copy prompt</button></div><pre id="prompt-code" tabindex="0">'+escape(systemPrompt(item))+'</pre><h4>Example user message</h4><pre>'+escape(s.example)+'</pre>';
 } else if(currentTab==='blueprint'){
  panel.innerHTML='<h3>Make it your own</h3><p>A framework-neutral specification with nodes, transitions, model roles, tool contracts and an evaluation plan. Configure adapters in your chosen runtime.</p><form id="preset-form" class="preset-form"><label>Temperature<input name="temperature" type="number" min="0" max="2" step="0.1" value="'+item.settings.temperature+'" required></label><label>Model-call budget<input name="maxModelCalls" type="number" min="1" max="80" step="1" value="'+item.settings.maxModelCalls+'" required></label><label>Time budget (s)<input name="timeoutSeconds" type="number" min="30" max="600" step="1" value="'+item.settings.timeoutSeconds+'" required></label><button class="button secondary" type="submit">Apply settings</button></form><p id="settings-status" role="status">Showing the default blueprint.</p><div class="code-toolbar"><span>JSON / SCHEMA 1.0.0</span><button data-copy="json">Copy JSON</button></div><pre id="json-code" tabindex="0">'+escape(JSON.stringify(blueprint(item),null,2))+'</pre><button class="button primary" id="download-custom">Download this JSON ↓</button><p class="detail-callout">Requires model and tool adapters, edge predicates, budget enforcement, state storage where needed, and task-specific validators. Design preset; experiments have not been run.</p>';
 } else {
  panel.innerHTML='<h3>Follow the original work</h3><p>This is an original application adaptation. These references explain the mechanism; their results are not performance claims for this preset.</p>'+item.references.map(sourceMarkup).join('')+'<p class="detail-callout">No third-party implementation is redistributed. Linked projects and papers retain their own licenses.</p>';
 }
}
function renderReading(){
 const types=['All','Guide','Paper','Documentation','Repository','Book'];
 $('reading-tabs').innerHTML=types.map(type=>'<button aria-pressed="'+(type===readingType)+'" data-source-type="'+type+'">'+type+' <span>'+(type==='All'?sources.length:sources.filter(s=>s.type===type).length)+'</span></button>').join('');
 $('source-list').innerHTML=sources.filter(s=>readingType==='All'||s.type===readingType).map(sourceMarkup).join('');
}
function renderComparison(){
 const selected=compare.map(id=>catalogById[id]);
 const rows=[
 ['Application',x=>escape(x.subtitle)],['Complexity',x=>escape(x.level)],
 ['Category / wiring',x=>escape(x.category)+'<br>'+escape(x.topology)],
 ['Mechanism',x=>escape(x.summary)],['Stages',x=>x.familyData.stages.map(n=>escape(n.name)).join(' → ')],
 ['Replicas / iterations',x=>(x.settings.replicas||1)+' / '+(x.settings.iterations||1)],
 ['Starting limits',x=>x.settings.maxModelCalls+' model calls<br>'+x.settings.maxSteps+' steps<br>'+x.settings.timeoutSeconds+' seconds'],
 ['Tradeoff',x=>escape(x.tradeoff)],['Domain failure',x=>escape(x.scenarioData.failure)],
 ['Acceptance',x=>list(x.scenarioData.criteria)],
 ['Evaluation',x=>'Not run. '+escape(x.scenarioData.metrics.join(', '))],
 ['Original sources',x=>x.references.map(s=>'<a href="'+escape(s.url)+'" target="_blank" rel="noopener noreferrer">'+escape(s.title)+' ↗</a>').join('<br>')],
 ['Export',x=>'<a class="button secondary" href="./presets/'+x.id+'.json" download="'+x.id+'.json">JSON ↓</a>']
 ];
 $('comparison-content').innerHTML='<p class="comparison-intro">Same task, different mechanisms. Complexity is an editorial classification; limits are starting budgets.</p><div class="comparison-scroll" tabindex="0" role="region" aria-label="Preset comparison table"><table class="comparison-table"><thead><tr><th scope="col">Specification</th>'+selected.map(x=>'<th scope="col">'+escape(x.title)+'<button class="compare-remove" data-remove-compare="'+x.id+'" aria-label="Remove '+escape(x.title)+' from comparison">×</button></th>').join('')+'</tr></thead><tbody>'+rows.map(([label,value])=>'<tr><th scope="row">'+label+'</th>'+selected.map(x=>'<td>'+value(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
}
function download(data,filename,type='application/json'){
 const url=URL.createObjectURL(new Blob([data],{type}));
 const a=document.createElement('a');a.href=url;a.download=filename;
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function copy(text,element){
 try {await navigator.clipboard.writeText(text);notify('Copied. Ready for your workspace.');}
 catch {
  const range=document.createRange();range.selectNodeContents(element);
  const selection=getSelection();selection.removeAllRanges();selection.addRange(range);element.focus();
  notify('Text selected. Press Ctrl+C or ⌘C to copy.');
 }
}
$('search').addEventListener('input',()=>{state.query=$('search').value;limit=24;renderCatalog();syncURL();});
$('sort').addEventListener('change',()=>{sort=$('sort').value;renderCatalog();syncURL();});
$('filters').addEventListener('change',event=>{
 const input=event.target;if(!input.dataset.facet)return;
 const {facet,value}=input.dataset;
 track('filter-change',{facet,action:input.checked?'add':'remove'});
 state[facet]=input.checked?[...state[facet],value]:state[facet].filter(v=>v!==value);
 limit=24;renderCatalog();syncURL();
});
$('active-filters').addEventListener('click',event=>{
 const button=event.target.closest('[data-remove]');if(!button)return;
 const key=button.dataset.remove;
 if(key==='query'){state.query='';$('search').value='';}
 else if(key==='savedOnly')state.savedOnly=false;
 else state[key]=state[key].filter(v=>v!==button.dataset.value);
 limit=24;renderCatalog();syncURL();
});
$('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);
$('filter-toggle').addEventListener('click',()=>{
 const open=$('filters').classList.toggle('is-open');
 $('filter-toggle').setAttribute('aria-expanded',String(open));
});
$('saved-toggle').addEventListener('click',()=>{
 state.savedOnly=!state.savedOnly;limit=24;renderCatalog();syncURL();
 $('catalogue').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
});
$('load-more').addEventListener('click',()=>{
 const previous=limit;limit+=24;renderCatalog();
 $('cards').children[previous]?.querySelector('button')?.focus({preventScroll:true});
});
document.addEventListener('click',event=>{
 const diagramNode=event.target.closest('[data-diagram-node]');
 if(diagramNode){selectDiagramNode(diagramNode.dataset.diagramNode);return;}
 const phase=event.target.closest('[data-flow-step]');
 if(phase){const group=explainArchitecture(current).groups.find(g=>g.id===phase.dataset.flowStep);if(group)selectDiagramNode(group.nodeIds[0]);return;}
 const target=event.target.closest('button,[data-close]');if(!target)return;
 if(target.hasAttribute('data-close'))closeDialog(target.closest('dialog'));
 else if(target.dataset.open)openDetail(target.dataset.open);
 else if(target.dataset.save)toggleSaved(target.dataset.save);
 else if(target.dataset.compare)toggleCompare(target.dataset.compare);
 else if(target.dataset.tab){currentTab=target.dataset.tab;renderDetailTab();}
 else if(target.dataset.sourceType){readingType=target.dataset.sourceType;renderReading();$('reading-tabs').querySelector('[data-source-type="'+readingType+'"]').focus();}
 else if(target.dataset.removeCompare){
  compare=compare.filter(id=>id!==target.dataset.removeCompare);renderCatalog();
  if(compare.length<2)closeDialog($('comparison'));else renderComparison();
 } else if(target.dataset.copy==='system')copy(systemPrompt(current),$('prompt-code'));
 else if(target.dataset.copy==='json')copy($('json-code').textContent,$('json-code'));
 else if(target.id==='download-custom'){download($('json-code').textContent+'\n',current.id+'.json');track('preset-download',{preset:current.id,format:'custom-json'});}
});
document.addEventListener('submit',event=>{
 if(event.target.id!=='preset-form')return;event.preventDefault();
 const form=event.target;if(!form.reportValidity())return;
 const values=Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,Number(v)]));
 $('json-code').textContent=JSON.stringify(blueprint(current,values),null,2);
 $('settings-status').textContent='Settings applied to the JSON below. The footer links keep the original defaults.';
});
document.addEventListener('keydown',event=>{
 if(event.target.matches('[data-diagram-node]')&&['Enter',' '].includes(event.key)){event.preventDefault();selectDiagramNode(event.target.dataset.diagramNode);return;}
 if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!document.querySelector('dialog[open]')&&!/input|textarea|select/i.test(event.target.tagName)){
  event.preventDefault();$('search').focus();$('search').scrollIntoView({block:'center'});
 }
 if(event.target.matches('[data-tab]')&&['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){
  event.preventDefault();let index=tabs.findIndex(([key])=>key===currentTab);
  index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  currentTab=tabs[index][0];renderDetailTab();$('tab-'+currentTab).focus();
 }
});
for(const dialog of document.querySelectorAll('dialog')){
 dialog.addEventListener('close',()=>{
  if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');
  if(!document.querySelector('dialog[open]')){
   if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
   else {restoreFocus(returnFocusKey);if(document.activeElement===document.body)$('search').focus({preventScroll:true});}
  }
 });
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});
 dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);
 });
}
for(const id of ['reading-open','note-reading'])$(id).addEventListener('click',()=>{renderReading();openDialog('reading');});
for(const id of ['about-open','how-open','method-open'])$(id).addEventListener('click',()=>openDialog('info'));
$('mascot-button').addEventListener('click',()=>{
 const object=document.querySelector('.hero-object');object.classList.remove('hello');
 requestAnimationFrame(()=>object.classList.add('hello'));
 notify('Hello, builder. Pick an idea and follow the wiring.');
});
$('compare-clear').addEventListener('click',()=>{compare=[];renderCatalog();});
$('compare-open').addEventListener('click',()=>{if(compare.length>=2){renderComparison();openDialog('comparison');track('compare-open',{count:compare.length});}});
$('download-all').addEventListener('click',()=>{
 track('collection-download');
 const a=document.createElement('a');a.href='./catalog.json';a.download='agent-deck-384-blueprints.json';document.body.append(a);a.click();a.remove();
});
addEventListener('popstate',()=>{
 const preset=urlState();limit=24;
 if($('detail').open)closeDialog($('detail'),false);
 renderCatalog();if(catalogById[preset])openDetail(preset);
});
const initialPreset=urlState();renderCatalog();
if(catalogById[initialPreset])openDetail(initialPreset);

addEventListener('resize',()=>{if(current&&currentTab==='wiring'&&$('detail').open)requestAnimationFrame(()=>{const diagram=$('detail-panel').querySelector('.diagram');if(diagram)diagram.innerHTML=graph(current,true);});});
