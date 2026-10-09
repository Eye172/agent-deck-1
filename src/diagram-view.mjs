
import {explainArchitecture,conditionLabel} from './explain.mjs';
import {AGENT_PATH} from './agents.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const typeNames={llm:'AI agent',tool:'Tool / code',retrieve:'Retrieval',gate:'Check / rule',human:'Human approval',merge:'Merge / join',memory:'Memory operation',store:'Stored context',environment:'Tool environment',candidate:'Candidate state',input:'Input',output:'Result'};
export {typeNames};

function positions(model,full,vertical){
 const positions={},counts=model.groups.map(g=>g.nodeIds.length),max=Math.max(...counts),groups=model.groups;
 const put=(id,x,y,w,h)=>positions[id]={x,y,w,h};
 if(vertical){
  let y=48;put('input',180,y,144,66);y+=107;
  groups.forEach(g=>{
   const rows=Math.ceil(g.nodeIds.length/2);
   g.nodeIds.forEach((id,i)=>put(id,g.nodeIds.length===1||g.nodeIds.length%2&&i===g.nodeIds.length-1?180:i%2?264:96,y+Math.floor(i/2)*107,140,82));
   y+=rows*107+15;
  });
  put('output',180,y,150,68);y+=115;
  model.resources.forEach((id,i)=>put(id,model.resources.length===1||model.resources.length%2&&i===model.resources.length-1?180:i%2?264:96,y+Math.floor(i/2)*112,142,96));
  return {positions,w:360,h:y+Math.ceil(model.resources.length/2)*112+32};
 }
 const w=full?900:240,nodeW=full?128:25,nodeH=full?78:25;
 const compactLoop=['loop','memory'].includes(model.layout)&&max===1&&groups.length===4;
 if(compactLoop){
  const coords=full?[[252,92],[635,92],[635,270],[252,270]]:[[42,29],[197,29],[197,104],[42,104]];
  groups.forEach((g,i)=>put(g.nodeIds[0],...coords[i],nodeW,nodeH));
  if(full){put('input',72,92,106,64);put('output',72,270,106,64)}
  let height=full?370:140;
  model.resources.forEach((id,i)=>{
   if(model.layout==='memory'&&id==='memory'){put(id,full?447:120,full?180:67,full?148:23,full?84:26);}
   else{put(id,(i+1)*w/(model.resources.length+1),height+(full?38:20),full?140:21,full?82:23);}
  });
  if(model.resources.some(id=>model.layout!=='memory'||id!=='memory'))height+=full?140:50;
  return {positions,w,h:height};
 }
 if(model.layout==='hierarchy'&&full){
  put('input',72,70,108,64);put('output',823,436,106,64);
  groups.forEach((g,i)=>g.nodeIds.forEach((id,j)=>put(id,g.nodeIds.length===1?450:180+j*180,70+i*122,nodeW,nodeH)));
  model.resources.forEach((id,i)=>put(id,(i+1)*w/(model.resources.length+1),590,140,84));
  return {positions,w,h:model.resources.length?670:505};
 }
 const top=full?92:24,space=full?102:31,mid=top+(max-1)*space/2;
 groups.forEach((g,i)=>{
  const x=full?210+i*153:23+i*(194/Math.max(1,groups.length-1));
  g.nodeIds.forEach((id,j)=>put(id,x,mid-(g.nodeIds.length-1)*space/2+j*space,nodeW,nodeH));
 });
 if(full){put('input',67,mid,104,62);put('output',830,mid,110,62)}
 const bottom=top+(max-1)*space+(full?85:29);
 model.resources.forEach((id,i)=>put(id,(i+1)*w/(model.resources.length+1),bottom+(full?67:28),full?140:23,full?84:25));
 return {positions,w,h:bottom+(model.resources.length?(full?145:51):(full?10:4))};
}

function wrap(value,limit=16){
 const words=String(value).split(' '),lines=[];let line='';
 for(const word of words){if(line&&(line+' '+word).length>limit){lines.push(line);line=word}else line+=(line?' ':'')+word;}
 if(line)lines.push(line);
 return lines;
}
export function systemIcon(kind,size=24){
 const body={
  tool:'<path d="m7 15 8-8m-3-3a5 5 0 0 0-6 6l-4 4 4 4 4-4a5 5 0 0 0 6-6l-4 3-3-3 3-4Z"/>',
  retrieve:'<circle cx="10" cy="10" r="6"/><path d="m14 14 6 6M7 8h6M7 11h4"/>',
  gate:'<path d="m12 2 10 10-10 10L2 12Z"/><path d="m7 12 3 3 7-7"/>',
  human:'<circle cx="12" cy="7" r="4"/><path d="M5 21v-4a7 7 0 0 1 14 0v4"/>',
  merge:'<path d="M3 5h4l5 7h8M3 19h4l5-7m4-4 4 4-4 4"/>',
  memory:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  store:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  environment:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20M6 13l3 2-3 2m6 0h5"/>',
  candidate:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/>',
  input:'<path d="M8 2h10v20H6V4Zm4 7H2m4-4-4 4 4 4"/>',
  output:'<path d="M6 2h12v20H6Zm3 11 2 2 5-5"/>'
 }[kind]||'<circle cx="12" cy="12" r="8"/>';
 return '<svg class="system-glyph" viewBox="0 0 24 24" width="'+size+'" height="'+size+'" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+body+'</svg>';
}
function nodeGlyph(node,x,y,size){
 if(node.kind==='llm')return '<g transform="translate('+(x-size/2)+' '+(y-size/2)+') scale('+(size/32)+')" style="color:'+node.color+'"><path d="'+AGENT_PATH+'" fill="currentColor" fill-rule="evenodd"/></g>';
 const svg=systemIcon(node.kind,size).replace('class="system-glyph"','class="system-glyph" x="'+(x-size/2)+'" y="'+(y-size/2)+'"');
 return svg;
}
function nodeMarkup(node,p,full,active){
 const selected=active===node.id,color=node.color||'#56614b';
 if(!full)return '<g class="mini-node kind-'+node.kind+'" data-mini-node="'+esc(node.id)+'">'+nodeGlyph(node,p.x,p.y,node.kind==='llm'?30:24)+'</g>';
 const x=p.x-p.w/2,y=p.y-p.h/2;
 let surface;
 if(node.kind==='gate')surface='<path class="node-surface" d="M'+p.x+' '+y+' L'+(x+p.w)+' '+p.y+' L'+p.x+' '+(y+p.h)+' L'+x+' '+p.y+' Z"/>';
 else if(node.kind==='merge')surface='<path class="node-surface" d="M'+(x+15)+' '+y+'H'+(x+p.w-15)+'L'+(x+p.w)+' '+p.y+'L'+(x+p.w-15)+' '+(y+p.h)+'H'+(x+15)+'L'+x+' '+p.y+'Z"/>';
 else if(['store','memory'].includes(node.kind))surface='<path class="node-surface" d="M'+x+' '+(y+10)+' C'+x+' '+(y-7)+' '+(x+p.w)+' '+(y-7)+' '+(x+p.w)+' '+(y+10)+'V'+(y+p.h-10)+' C'+(x+p.w)+' '+(y+p.h+7)+' '+x+' '+(y+p.h+7)+' '+x+' '+(y+p.h-10)+'Z"/><path d="M'+x+' '+(y+10)+' C'+x+' '+(y+25)+' '+(x+p.w)+' '+(y+25)+' '+(x+p.w)+' '+(y+10)+'" class="store-rim"/>';
 else surface='<rect class="node-surface" x="'+x+'" y="'+y+'" width="'+p.w+'" height="'+p.h+'" rx="'+(['input','output','candidate'].includes(node.kind)?p.h/2:8)+'"/>';
 const lines=wrap(node.name,node.kind==='gate'?13:16),labelY=p.y+(node.kind==='gate'?5:11)-(lines.length-1)*7;
 const label=lines.map((line,i)=>'<text class="node-title" x="'+p.x+'" y="'+(labelY+i*14)+'">'+esc(line)+'</text>').join('');
 const caption=node.actor||typeNames[node.kind];
 const sublines=['input','output'].includes(node.kind)?[]:wrap(caption,18);
 const glyph=node.kind==='gate'?'':nodeGlyph(node,p.x,p.y-(['input','output'].includes(node.kind)?16:22),27);
 const captionY=['gate','candidate'].includes(node.kind)?y+p.h+15:y+p.h-7;
 return '<g class="diagram-node kind-'+node.kind+(selected?' is-active':'')+'" role="button" tabindex="0" aria-pressed="'+selected+'" aria-label="'+esc(node.name+' — '+caption)+'" data-diagram-node="'+esc(node.id)+'" data-stage="'+esc(node.stageId||'')+'" style="--actor-color:'+color+'">'+surface+glyph+label+sublines.slice(0,1).map(line=>'<text class="node-caption" x="'+p.x+'" y="'+captionY+'">'+esc(line)+'</text>').join('')+'</g>';
}

export function renderGraph(item,{full=false,vertical=false,activeStage=null}={}){
 const model=explainArchitecture(item),layout=positions(model,full,vertical);
 const {w,h}=layout,p=layout.positions,marker='flow-arrow-'+item.id+(full?'-full':'-mini');
 let feedback=0,links='',labels='',seen=new Set();
 const routes=[...new Map(model.edges.filter(e=>e.stageEdge&&e.condition!=='always').map(e=>[e.stageEdge,e])).values()];
 for(const edge of model.edges){
  const a=p[edge.from],b=p[edge.to];if(!a||!b)continue;
  const nodeA=model.nodes.find(n=>n.id===edge.from),nodeB=model.nodes.find(n=>n.id===edge.to);
  const backward=edge.kind!=='data'&&nodeA.stageId&&nodeB.stageId&&Number(nodeB.stageId.slice(1))<=Number(nodeA.stageId.slice(1));
  let d,lx=(a.x+b.x)/2,ly=(a.y+b.y)/2-10;
  if(backward&&!vertical&&Math.abs(a.y-b.y)<40){
   const arc=Math.max(18,Math.min(a.y,b.y)-a.h/2-36-feedback++*15);
   d='M'+a.x+' '+(a.y-a.h/2)+' C'+a.x+' '+arc+' '+b.x+' '+arc+' '+b.x+' '+(b.y-b.h/2-4);
   ly=arc-5;
  }else{
   const dx=b.x-a.x,dy=b.y-a.y,down=Math.abs(dy)>Math.abs(dx)||vertical&&Math.abs(dy)>40;
   if(down){
    const sign=dy>=0?1:-1,sy=a.y+sign*a.h/2,ey=b.y-sign*(b.h/2+4),bend=(sy+ey)/2;
    if(vertical&&backward){const side=edge.from.endsWith('@2')?346:14;d='M'+(a.x-a.w/2)+' '+a.y+' C'+side+' '+a.y+' '+side+' '+b.y+' '+(b.x-b.w/2-4)+' '+b.y;lx=side===14?50:308;ly=(a.y+b.y)/2;}
    else d='M'+a.x+' '+sy+' C'+a.x+' '+bend+' '+b.x+' '+bend+' '+b.x+' '+ey;
   }else{
    const sign=dx>=0?1:-1,sx=a.x+sign*a.w/2,ex=b.x-sign*(b.w/2+4),bend=(sx+ex)/2;
    d='M'+sx+' '+a.y+' C'+bend+' '+a.y+' '+bend+' '+b.y+' '+ex+' '+b.y;
   }
  }
  const data=edge.kind==='data',choice=edge.kind==='choice';
  links+='<path class="diagram-edge '+(data?'edge-data':backward?'edge-feedback':choice?'edge-choice':'edge-control')+'" d="'+d+'" '+(data?'':'marker-end="url(#'+marker+')"')+''+(data&&edge.condition==='read/write'?' marker-start="url(#'+marker+')"':'')+'/>';
  const key=edge.stageEdge||edge.from+'>'+edge.to;
  if(full&&!data&&edge.stageEdge&&edge.condition!=='always'&&!seen.has(key)){
   seen.add(key);const lines=['R'+(routes.findIndex(e=>e.stageEdge===edge.stageEdge)+1)];
   labels+=lines.slice(0,2).map((line,i)=>'<text class="edge-label" x="'+lx+'" y="'+(ly+i*13)+'">'+esc(line)+'</text>').join('');
  }
 }
 const nodes=model.nodes.filter(n=>p[n.id]).map(n=>nodeMarkup(n,p[n.id],full,activeStage)).join('');
 return '<svg class="'+(full?'runtime-diagram':'mini-diagram')+'" viewBox="0 0 '+w+' '+h+'" '+(full?'role="group" aria-label="'+esc(item.title)+' architecture; select a node for its contract"':'aria-hidden="true"')+' data-layout="'+model.layout+'" data-orientation="'+(vertical?'vertical':'horizontal')+'"><defs><marker id="'+marker+'" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto-start-reverse"><path d="M0 0L5 2.5L0 5" fill="#7e8971"/></marker></defs>'+links+labels+nodes+'</svg>';
}

export function diagramLegend(model){
 return '<div class="actor-legend" aria-label="Agents in this architecture">'+model.actors.map(a=>'<span><svg viewBox="0 0 32 32" aria-hidden="true" style="color:'+a.color+'"><path d="'+AGENT_PATH+'" fill="currentColor" fill-rule="evenodd"/></svg>'+esc(a.name)+'</span>').join('')+(model.actors.length===0?'<span>No model-driven actor in this workflow</span>':'')+'</div><div class="connection-legend"><span><i class="solid-line"></i>Control / phase transition</span><span><i class="dashed-line"></i>Data / context access</span>'+(model.instance_mode==='select-one-from-roster'?'<span>Roster: one specialist acts per turn</span>':'')+'</div>';
}
export function nodeInspector(model,id,item){
 const node=model.nodes.find(n=>n.id===id)||model.nodes.find(n=>n.stageId===model.groups[0].id);
 const incoming=model.edges.filter(e=>e.to===node.id&&e.kind!=='data').map(e=>model.nodes.find(n=>n.id===e.from)?.name);
 const outgoing=model.edges.filter(e=>e.from===node.id&&e.kind!=='data').map(e=>model.nodes.find(n=>n.id===e.to)?.name+' — '+e.label);
 const context=model.edges.filter(e=>e.kind==='data'&&(e.from===node.id||e.to===node.id)).map(e=>model.nodes.find(n=>n.id===(e.from===node.id?e.to:e.from))?.name);
 const field=(label,value)=>'<div><h4>'+label+'</h4><p>'+esc(value)+'</p></div>';
 return '<div class="node-inspector" aria-live="polite"><div class="inspector-title">'+(node.kind==='llm'?'<svg class="agent-glyph" viewBox="0 0 32 32" aria-hidden="true" style="color:'+node.color+'"><path d="'+AGENT_PATH+'" fill="currentColor" fill-rule="evenodd"/></svg>':systemIcon(node.kind,32))+'<div><h3>'+esc(node.name)+'</h3><p>'+esc(node.actor||typeNames[node.kind])+(node.capacity>1?' · slot '+node.slot+' of '+node.capacity:'')+'</p></div></div>'+field('What happens',node.instruction)+(node.detail!==node.instruction?field('Why this node exists',node.detail):'')+'<div class="inspector-contracts">'+field('Reads from',incoming.length?[...new Set(incoming)].join(', '):node.kind==='input'?item.scenarioData.input:'Scoped context supplied by the runtime')+field('Passes to',outgoing.length?[...new Set(outgoing)].join('; '):node.kind==='output'?item.scenarioData.artifacts.join(', '):'The connected data consumer')+'</div>'+(context.length?field('Context connections',[...new Set(context)].join(', ')):'')+(node.stageId?'<p class="artifact-note">Pass a typed record: stage ID, status, artifact, evidence references and unresolved issues.</p>':'')+'</div>';
}
function routeLegend(model){const routes=[...new Map(model.edges.filter(e=>e.stageEdge&&e.condition!=='always').map(e=>[e.stageEdge,e])).values()];return routes.length?'<div class="route-legend" aria-label="Conditional routes">'+routes.map((e,i)=>'<span><strong>R'+(i+1)+'</strong>'+esc(e.label)+'</span>').join('')+'</div>':'';}
export function wiringMarkup(item,vertical=false){
 const model=explainArchitecture(item),first=model.groups[0];
 return '<h3>Follow the architecture</h3><p class="wiring-summary">'+esc(model.note)+'</p><div class="wiring-facts"><span>'+model.actor_count+' logical actor'+(model.actor_count===1?'':'s')+'</span><span>'+model.nodes.filter(n=>n.stageId).length+' execution slots</span><span>'+model.resources.length+' context object'+(model.resources.length===1?'':'s')+'</span><span>'+model.feedback_count+' feedback route'+(model.feedback_count===1?'':'s')+'</span></div>'+diagramLegend(model)+'<p class="diagram-help">Select a character or system node to inspect what it reads, does and passes on.</p><div class="diagram architecture-diagram">'+renderGraph(item,{full:true,vertical,activeStage:first.nodeIds[0]})+'</div>'+routeLegend(model)+'<div class="flow-steps" aria-label="Execution phases">'+model.groups.map((g,i)=>'<button data-flow-step="'+g.id+'" aria-pressed="'+(i===0)+'"><span>'+(i+1)+'</span>'+esc(g.name)+(g.nodeIds.length>1?' ×'+g.nodeIds.length:'')+'</button>').join('')+'</div><div id="node-inspector">'+nodeInspector(model,first.nodeIds[0],item)+'</div><details class="representation-note"><summary>How to read this diagram</summary><p>'+esc(model.legend)+'</p><p>'+esc(model.scope)+'</p><p>'+esc(model.stop)+'</p></details>';
}
