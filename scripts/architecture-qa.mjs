
import {createRequire} from 'node:module';
import {mkdir,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {families,catalogById} from '../src/catalog.mjs';
import {explainArchitecture} from '../src/explain.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE);
const out=path.resolve('output'),profile=path.join(out,'architecture-profile-'+process.pid),base='http://127.0.0.1:4187';
await mkdir(out,{recursive:true});
const ctx=await chromium.launchPersistentContext(profile,{executablePath:process.env.CHROMIUM_PATH,headless:true,viewport:{width:1440,height:1376},args:['--disable-background-networking','--disable-breakpad','--disable-crash-reporter','--no-first-run']});
const page=await ctx.newPage(),checks=[],errors=[],layoutDefects=[],counts=new Set(),layouts=new Set();
page.on('pageerror',e=>errors.push(e.message));
const snap=name=>page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});
const open=async(id)=>{
 await page.goto(base+'/?preset='+id,{waitUntil:'domcontentloaded'});
 await page.getByRole('tab',{name:'Wiring',exact:true}).click();
 await page.evaluate(()=>document.fonts.ready);
};
try{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('.brand-note').count(),0);
 assert.equal(await page.locator('.brand-mark').getAttribute('src'),'./assets/mark.svg');
 assert.ok(!await page.locator('body').innerText().then(s=>s.includes('a working title')));
 assert.ok(new Set(await page.locator('.mini-diagram').evaluateAll(els=>els.map(el=>el.dataset.layout))).size>=5);
 await snap('preview-desktop');
 checks.push('confirmed identity and distinct cartridge previews');

 await open('supervisor--coding');
 assert.equal(await page.locator('.actor-legend>span').count(),4);
 assert.equal(await page.locator('.diagram-node.kind-llm').count(),5);
 await snap('supervisor-diagram-desktop');
 const worker=page.locator('[data-diagram-node="n1@2"]');
 await worker.focus();await worker.press('Enter');
 assert.match(await page.locator('#node-inspector').innerText(),/Specialist B/);
 assert.equal(await worker.getAttribute('aria-pressed'),'true');
 await page.locator('[data-flow-step="n2"]').click();
 assert.match(await page.locator('#node-inspector h3').innerText(),/Supervisor/);
 checks.push('expanded team, actor identity and keyboard node inspection');
 await snap('node-contract-desktop');

 for(const id of ['react','lats','graph-rag','hierarchical-team','dynamic-team','human-gate']){
  await open(id+'--research');
  const m=explainArchitecture(catalogById[id+'--research']);
  assert.equal(await page.locator('.diagram-node').count(),m.nodes.length);
  assert.equal(await page.locator('.runtime-diagram').getAttribute('data-layout'),m.layout);
  if(id==='lats')assert.equal(await page.locator('.diagram-node.kind-candidate').count(),3);
  if(id==='human-gate')assert.equal(await page.locator('.diagram-node.kind-human').count(),1);
  if(['react','lats','graph-rag'].includes(id))await snap(id+'-diagram-desktop');
 }
 checks.push('tools, search states, graph evidence, hierarchy, roster and human nodes remain distinct');

 for(const width of [1440,390]){
  await page.setViewportSize({width,height:width===1440?1100:844});
  for(const f of families){
   await open(f.id+'--research');
   const m=explainArchitecture(catalogById[f.id+'--research']);
   assert.equal(await page.locator('.diagram-node').count(),m.nodes.length,f.id);
   counts.add(m.nodes.length);layouts.add(m.layout);
   const scan=await page.locator('.runtime-diagram').evaluate(el=>{
    const box=el.viewBox.baseVal;
    const violations=[];
    for(const node of el.querySelectorAll('.diagram-node')){
     const surface=node.querySelector('.node-surface').getBBox();
     const caption=node.querySelector('.node-caption')?.getBBox();
     if(caption){const bottom=Math.max(...[...node.querySelectorAll('.node-title')].map(t=>{const b=t.getBBox();return b.y+b.height;}));if(bottom>caption.y+0.5)violations.push({node:node.dataset.diagramNode,reason:'title/caption overlap',titleBottom:bottom,captionTop:caption.y});}
     for(const text of node.querySelectorAll('.node-title')){
      const b=text.getBBox();
      if(b.x<surface.x-1||b.x+b.width>surface.x+surface.width+1)violations.push({node:node.dataset.diagramNode,text:text.textContent,b:{x:b.x,w:b.width},surface:{x:surface.x,w:surface.width}});
     }
    }
    return {width:document.documentElement.scrollWidth,viewport:innerWidth,violations,viewBox:[box.width,box.height]};
   });
   if(scan.width>width||scan.violations.length)layoutDefects.push({family:f.id,width,...scan});
  }
 }
 checks.push('all 64 mechanism diagrams rendered on desktop and phone');
 await page.setViewportSize({width:390,height:844});
 await open('supervisor--coding');
 await page.locator('.architecture-diagram').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
 await snap('supervisor-diagram-mobile');
 await page.locator('[data-flow-step="n1"]').click();
 assert.match(await page.locator('#node-inspector').innerText(),/Specialist A/);
 assert.equal(await page.locator('.runtime-diagram').getAttribute('data-orientation'),'vertical');
 await snap('node-contract-mobile');
 checks.push('mobile inspector and vertical graph preserve usable controls');

 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.locator('.cartridge').first().waitFor();
 await page.locator('#catalogue').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
 await snap('preview-mobile-catalog');
 await page.setViewportSize({width:320,height:900});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),320);
 const exported=await (await page.request.get(base+'/presets/supervisor--coding.json')).json();
 assert.equal(exported.explanation.actor_count,4);
 assert.equal(exported.explanation.nodes.filter(n=>n.stageId==='n1').length,3);
 checks.push('320 px layout and downloadable explanatory schema');

 assert.deepEqual(errors,[]);
 const report={status:layoutDefects.length?'layout-defects':'passed',checks,errors,layoutDefects,mechanisms:families.length,diagramRenderings:128,layouts:[...layouts],nodeCounts:[...counts].sort((a,b)=>a-b)};
 await writeFile(path.join(out,'architecture-qa.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({...report,layoutDefects:layoutDefects.length},null,2));
 if(layoutDefects.length)process.exitCode=1;
} catch(e){
 await writeFile(path.join(out,'architecture-qa.json'),JSON.stringify({status:'failed',checks,errors,failure:String(e)},null,2));
 console.error(e);process.exitCode=1;
}finally{
 await ctx.close();
 if(!profile.startsWith(out+path.sep))throw Error('Invalid profile');
 await rm(profile,{recursive:true,force:true});
}
