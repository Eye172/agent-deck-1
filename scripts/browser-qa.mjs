import {createRequire} from 'node:module';
import {mkdir,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE);
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4187';
const output=path.resolve('output');
await mkdir(output,{recursive:true});
const profile=path.join(output,'browser-profile-'+process.pid);
const context=await chromium.launchPersistentContext(profile,{
 executablePath:process.env.CHROMIUM_PATH,headless:true,viewport:{width:1440,height:1040},
 downloadsPath:path.join(output,'downloads'),acceptDownloads:true,
 args:['--disable-background-networking','--disable-breakpad','--disable-crash-reporter','--no-first-run','--disable-component-update']
});
const page=await context.newPage(),errors=[],checks=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
const check=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
const screenshot=name=>page.screenshot({path:path.join(output,name+'.png'),animations:'disabled'});
try {
 await page.goto(base,{waitUntil:'networkidle'});
 await check('initial catalog renders 24 of 384 and all filter groups',async()=>{
  assert.equal(await page.locator('.cartridge-card').count(),24);
  assert.match(await page.locator('#result-count').innerText(),/384/);
  assert.equal(await page.locator('#topology-filters input').count(),46);
  assert.equal(await page.locator('.hero .mascot').count(),1);
 });
 await screenshot('design-desktop');
 await page.locator('#catalogue').scrollIntoViewIfNeeded();
 await screenshot('catalog-desktop');
 await check('search and domain filters combine correctly',async()=>{
  await page.locator('#search').fill('ReAct');
  assert.equal(await page.locator('.cartridge-card').count(),6);
  await page.locator('[data-facet="scenario"][data-value="coding"]').check();
  assert.equal(await page.locator('.cartridge-card').count(),1);
  assert.match(page.url(),/scenario=coding/);
 });
 await check('detail wiring, tabs, keyboard focus and source links',async()=>{
  await page.getByRole('button',{name:'Explore ReAct tool loop for Coding',exact:true}).click();
  await page.locator('#detail').waitFor({state:'visible'});
  assert.equal(await page.locator('#detail-title').innerText(),'ReAct tool loop');
  await page.getByRole('tab',{name:'Wiring',exact:true}).click();
  assert.equal(await page.locator('.transition-table tbody tr').count(),5);
  await screenshot('detail-desktop');
  await page.getByRole('tab',{name:'Wiring',exact:true}).press('ArrowRight');
  assert.equal(await page.getByRole('tab',{name:'Prompt',exact:true}).getAttribute('aria-selected'),'true');
  await page.getByRole('tab',{name:'Sources',exact:true}).click();
  assert.ok(await page.locator('#detail-panel a').count()>0);
 });
 await check('customized JSON, validation and real download',async()=>{
  await page.getByRole('tab',{name:'Blueprint',exact:true}).click();
  const initial=await page.locator('#json-code').innerText();
  await page.getByLabel('Model-call budget',{exact:true}).fill('0');
  await page.getByRole('button',{name:'Apply settings',exact:true}).click();
  assert.equal(await page.locator('#json-code').innerText(),initial);
  await page.getByLabel('Model-call budget',{exact:true}).fill('17');
  await page.getByLabel('Temperature',{exact:true}).fill('0.7');
  await page.getByLabel('Time budget (s)',{exact:true}).fill('300');
  await page.getByRole('button',{name:'Apply settings',exact:true}).click();
  const custom=JSON.parse(await page.locator('#json-code').innerText());
  assert.equal(custom.orchestration.maxModelCalls,17);
  assert.equal(custom.model_roles.primary.temperature,0.7);
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download this JSON ↓',exact:true}).click();
  const download=await downloadPromise;
  await download.saveAs(path.join(output,'download-custom.json'));
  assert.equal(await download.failure(),null);
 });
 await check('saved shelf persists across reload and supports empty state',async()=>{
  await page.locator('.detail-save').click();
  await page.getByRole('button',{name:'Close details',exact:true}).click();
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#saved-count').innerText(),'1');
  await page.locator('#saved-toggle').click();
  assert.equal(await page.locator('.cartridge-card').count(),1);
  await page.locator('[data-save="react--coding"]').click();
  assert.equal(await page.locator('.cartridge-card').count(),0);
  assert.equal(await page.locator('#empty').isVisible(),true);
  await page.getByRole('button',{name:'Reset collection',exact:true}).click();
  assert.equal(await page.locator('.cartridge-card').count(),24);
 });
 await check('comparison uses distinct mechanisms and removes items',async()=>{
  await page.locator('[data-compare="react--research"]').click();
  await page.locator('[data-compare="supervisor--research"]').click();
  await page.locator('#compare-open').click();
  assert.equal(await page.locator('.comparison-table thead th').count(),3);
  assert.match(await page.locator('.comparison-table').innerText(),/Tool loop/);
  assert.match(await page.locator('.comparison-table').innerText(),/Supervisor/);
  await screenshot('compare-desktop');
  await page.locator('[data-remove-compare="supervisor--research"]').click();
  assert.equal(await page.locator('#comparison').isVisible(),false);
  await page.locator('#compare-clear').click();
 });
 await check('reading room includes books and author attribution',async()=>{
  await page.getByRole('button',{name:'Reading room',exact:true}).click();
  await page.locator('[data-source-type="Book"]').click();
  assert.equal(await page.locator('#source-list .source-item').count(),3);
  assert.match(await page.locator('#source-list').innerText(),/Murphy/);
  await page.getByRole('button',{name:'Close reading room',exact:true}).click();
 });
 await check('advanced facets, pagination and deep links',async()=>{
  await page.locator('[data-facet="level"][data-value="Expert"]').check();
  const count=Number((await page.locator('#result-count').innerText()).match(/\d+/)[0]);
  assert.ok(count>100);
  await page.locator('#load-more').click();
  assert.equal(await page.locator('.cartridge-card').count(),48);
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-facet="level"][data-value="Expert"]').isChecked(),true);
  await page.goto(base+'/?preset=lats--knowledge&level=Expert&scenario=knowledge',{waitUntil:'networkidle'});
  assert.equal(await page.locator('#detail-title').innerText(),'Language Agent Tree Search');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#detail').isVisible(),false);
  assert.equal(await page.locator('[data-facet="scenario"][data-value="knowledge"]').isChecked(),true);
  assert.ok(!page.url().includes('preset='));
 });
 await check('static exports are complete and served with correct type',async()=>{
  const response=await context.request.get(base+'/catalog.json');assert.equal(response.status(),200);
  const all=await response.json();assert.equal(all.presets.length,384);
  const guide=await context.request.get(base+'/presets/lats--knowledge.md');assert.equal(guide.status(),200);
  assert.match(await guide.text(),/experiments have not been run/);
  const denied=await context.request.post(base+'/catalog.json');assert.equal(denied.status(),405);
 });
 await page.goto(base,{waitUntil:'networkidle'});
 await page.setViewportSize({width:375,height:812});
 await check('mobile layout fits viewport and filters remain usable',async()=>{
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal page overflow');
  await screenshot('design-mobile');
  await page.locator('#catalogue').scrollIntoViewIfNeeded();
  await screenshot('catalog-mobile');
  await page.locator('#filter-toggle').click();
  await page.locator('[data-facet="category"][data-value="Memory"]').check();
  assert.equal(await page.locator('.cartridge-card').count(),24);
  await page.locator('#filter-toggle').click();
  assert.equal(await page.locator('#filters').isVisible(),false);
  await page.locator('.cartridge').first().click();
  await page.getByRole('tab',{name:'Wiring',exact:true}).click();
  assert.ok(await page.evaluate(()=>{const d=document.querySelector('#detail');return d.scrollWidth<=d.clientWidth+1;}),'dialog overflow');
  await screenshot('detail-mobile');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#detail').isVisible(),false);
 });
 await check('reduced motion and keyboard search',async()=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#filter-toggle').click();
  await page.locator('#reset').click();
  await page.locator('#filter-toggle').click();
  await page.locator('.cartridge').first().focus();
  await page.keyboard.press('/');
  assert.equal(await page.locator('#search').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.locator('.cartridge').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
 });
 assert.deepEqual(errors,[]);
 await writeFile(path.join(output,'browser-qa.json'),JSON.stringify({status:'passed',date:'2026-10-09',checks,errors,browser:'Chromium',desktop:'1440x1040',mobile:'375x812'},null,2));
 console.log('All '+checks.length+' browser checks passed.');
} catch(error){
 await screenshot('qa-failure');
 await writeFile(path.join(output,'browser-qa.json'),JSON.stringify({status:'failed',checks,errors,failure:error.stack},null,2));
 console.error(error);process.exitCode=1;
} finally {await context.close();assert.ok(profile.startsWith(output+path.sep));await rm(profile,{recursive:true,force:true});}
