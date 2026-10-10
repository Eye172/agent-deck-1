import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {securityHeaders} from './security-headers.mjs';
import {catalog} from '../src/catalog.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE);
const root=fileURLToPath(new URL('../',import.meta.url)),dist=path.join(root,'dist'),out=path.join(root,'output/analytics-work'),profile=path.join(out,'profile-'+process.pid);
const env={...process.env,USERPROFILE:profile,HOME:profile,APPDATA:profile+'/Roaming',LOCALAPPDATA:profile+'/Local',TEMP:profile+'/Temp',TMP:profile+'/Temp'};
for(const p of [out,profile,env.APPDATA,env.LOCALAPPDATA,env.TEMP])await mkdir(p,{recursive:true});
const config={websiteId:'12345678-1234-1234-1234-123456789abc',scriptUrl:'https://cloud.umami.is/script.js',hostname:'eye172.github.io',presetIds:catalog.map(x=>x.id)};
const mime={'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.zip':'application/zip','.md':'text/markdown'};
async function resource(url){let rel=url.pathname.replace(/^\/agent-deck-1(?=\/)/,'').replace(/^\/+/, '');if(!rel||rel.endsWith('/'))rel+='index.html';const p=path.resolve(dist,rel);assert.ok(p.startsWith(dist+path.sep));return {body:await readFile(p),contentType:mime[path.extname(p)]||'application/octet-stream'};}
const server=http.createServer(async(req,res)=>{try{const r=await resource(new URL(req.url,'http://localhost'));res.writeHead(200,{'Content-Type':r.contentType,...securityHeaders});res.end(r.body);}catch{res.writeHead(404);res.end();}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,env,args:['--disable-gpu','--disable-background-networking','--disable-breakpad','--disable-crash-reporter','--no-first-run','--disk-cache-dir='+profile+'/Cache']});
const report={actual_utc:new Date().toISOString(),checks:[],network:'All provider traffic mocked; no synthetic requests sent to Umami'},base='https://eye172.github.io/agent-deck-1/';
process.env.TEMP=env.TEMP;process.env.TMP=env.TMP;
const vendor=process.env.UMAMI_TRACKER_FILE?await readFile(process.env.UMAMI_TRACKER_FILE,'utf8'):null;
if(vendor)report.vendor_script_sha256=createHash('sha256').update(vendor).digest('hex');
const contexts=[];
async function fixture({active=true,blocked=false,signal,storageBlocked=false,optOut=false}={}){
 const ctx=await browser.newContext({acceptDownloads:true}),events=[],trackerRequests=[],errors=[];contexts.push(ctx);
 await ctx.addInitScript(({signal,storageBlocked,optOut})=>{
  if(signal==='dnt')Object.defineProperty(navigator,'doNotTrack',{value:'1',configurable:true});
  if(signal==='gpc')Object.defineProperty(navigator,'globalPrivacyControl',{value:true,configurable:true});
  if(storageBlocked)Storage.prototype.getItem=function(){throw new Error('Blocked storage fixture');};
  if(optOut)localStorage.setItem('agent-deck:analytics-disabled','1');
 },{signal,storageBlocked,optOut});
 await ctx.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(['cloud.umami.is','gateway.umami.is'].includes(url.hostname)){
   trackerRequests.push(url.pathname);
   if(url.pathname==='/script.js'){
    if(blocked)return route.abort('blockedbyclient');
    return route.fulfill({contentType:'text/javascript',body:vendor||String.raw`window.umami={track:(name,data)=>{const script=document.querySelector('script[data-website-id]');let payload={website:script.dataset.websiteId,hostname:location.hostname,url:location.pathname+location.search+location.hash,title:document.title,referrer:document.referrer,language:navigator.language,screen:screen.width+'x'+screen.height};if(typeof name==='string')Object.assign(payload,{name,data});else if(typeof name==='function')payload=name(payload);payload=window[script.dataset.beforeSend]('event',payload);if(!payload)return Promise.resolve();return fetch('https://gateway.umami.is/api/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).then(r=>r.json());}};`});
   }
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type'}});
   assert.equal(url.pathname,'/api/send');const sent=JSON.parse(req.postData());events.push(sent.payload||sent);return route.fulfill({contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:'{}'});
  }
  if(url.hostname!=='eye172.github.io'&&url.hostname!=='127.0.0.1')return route.abort();
  if(url.pathname.endsWith('/analytics-config.mjs'))return route.fulfill({contentType:'text/javascript',body:'export default '+JSON.stringify({...config,websiteId:active?config.websiteId:null})});
  try{const r=await resource(url);await route.fulfill({...r,headers:securityHeaders});}catch{await route.fulfill({status:404,body:'Not found'});}
 });
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/Content Security Policy|Refused to/.test(m.text()))errors.push(m.text());});return {ctx,page,events,trackerRequests,errors};
}
try{
 const f=await fixture();await f.page.goto(base+'?q=PRIVATE-SEARCH#private',{waitUntil:'networkidle',referer:'https://example.org/private?email=SECRET#private'});assert.equal(f.events.length,1);assert.equal(f.events[0].url,'/agent-deck-1/');assert.equal(f.events[0].referrer,'https://example.org');
 await f.page.locator('#search').fill('ReAct');await f.page.locator('.cartridge').first().click();await f.page.waitForFunction(()=>document.querySelector('#detail').open);await f.page.waitForTimeout(120);assert.ok(f.events.some(e=>e.name==='preset-open'&&e.data.preset==='react--research'));
 const downloadWait=f.page.waitForEvent('download');await f.page.locator('.detail-footer a[download$=".json"]').click();await downloadWait;
 await f.page.getByRole('tab',{name:'Blueprint',exact:true}).click();await f.page.locator('[name=temperature]').fill('0.9');await f.page.getByRole('button',{name:'Apply settings',exact:true}).click();const customWait=f.page.waitForEvent('download');await f.page.locator('#download-custom').click();await customWait;await f.page.keyboard.press('Escape');await f.page.locator('#reset').click();
 await f.page.locator('#category-filters input').first().check();await f.page.locator('#category-filters input').first().uncheck();
 await f.page.locator('[data-compare]').nth(0).click();await f.page.locator('[data-compare]').nth(1).click();await f.page.locator('#compare-open').click();await f.page.keyboard.press('Escape');
 const skillWait=f.page.waitForEvent('download');await f.page.locator('#download-skill').click();await skillWait;
 const collectionWait=f.page.waitForEvent('download');await f.page.locator('#download-all').click();await collectionWait;
 await f.page.locator('footer a',{hasText:'Research'}).click();await f.page.waitForLoadState('networkidle');const zipWait=f.page.waitForEvent('download');await f.page.locator('a[href="./evidence.zip"]').click();await zipWait;await f.page.waitForTimeout(150);
 for(const name of ['preset-open','preset-download','filter-change','compare-open','skill-download','collection-download','research-open','research-material-click'])assert.ok(f.events.some(e=>e.name===name),name);
 assert.equal(f.events.filter(e=>!e.name).length,2);const serialized=JSON.stringify(f.events);for(const secret of ['PRIVATE-SEARCH','SECRET','private?','temperature','maxModelCalls'])assert.ok(!serialized.includes(secret),secret);assert.ok(f.events.some(e=>e.name==='preset-download'&&e.data.format==='custom-json'));assert.deepEqual(f.errors,[]);report.checks.push('Production-domain CSP accepts sanitized page views and all tested actions; no search, URL state, referrer-path or blueprint-content leakage');
 await f.page.goto(base+'privacy.html',{waitUntil:'networkidle'});const count=f.events.length,loads=f.trackerRequests.filter(p=>p==='/script.js').length;await f.page.locator('#analytics-toggle').click();assert.match(await f.page.locator('#analytics-status').innerText(),/disabled/);await f.page.goto(base,{waitUntil:'networkidle'});assert.equal(f.events.length,count);assert.equal(f.trackerRequests.filter(p=>p==='/script.js').length,loads);assert.equal(await f.page.locator('.cartridge').count(),24);report.checks.push('Privacy page loads no vendor script; stored opt-out suppresses the next landing page and preserves browsing');
 for(const settings of [{signal:'dnt'},{signal:'gpc'},{storageBlocked:true},{optOut:true},{active:false}]){const t=await fixture(settings);await t.page.goto(base,{waitUntil:'networkidle'});await t.page.locator('.cartridge').first().click();assert.equal(t.trackerRequests.length,0);assert.equal(t.events.length,0);assert.deepEqual(t.errors,[]);await t.ctx.close();}report.checks.push('DNT, GPC, unavailable storage, stored opt-out and missing ID suppress vendor requests and keep preset details usable');
 const local=await fixture();await local.page.goto('http://127.0.0.1:'+server.address().port+'/agent-deck-1/',{waitUntil:'networkidle'});assert.equal(local.trackerRequests.length,0);assert.equal(await local.page.locator('.cartridge').count(),24);assert.deepEqual(local.errors,[]);report.checks.push('Configured localhost preview makes no vendor requests');
 const fail=await fixture({blocked:true});await fail.page.goto(base,{waitUntil:'networkidle'});await fail.page.locator('#search').fill('ReAct');await fail.page.locator('.cartridge').first().click();const failDownload=fail.page.waitForEvent('download');await fail.page.locator('.detail-footer a[download$=".json"]').click();await failDownload;assert.equal(fail.events.length,0);assert.deepEqual(fail.errors,[]);report.checks.push('Blocked tracker cannot break search, detail views or downloads');
 await f.page.goto(base+'privacy.html',{waitUntil:'networkidle'});await f.page.setViewportSize({width:390,height:844});assert.equal(await f.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await f.page.screenshot({path:path.join(out,'privacy-mobile.png'),fullPage:true});report.checks.push('Privacy notice fits a 390px viewport');report.status='passed';
}finally{for(const c of contexts)await c.close().catch(()=>{});await browser.close();await new Promise(resolve=>server.close(resolve));await writeFile(path.join(out,'qa.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
