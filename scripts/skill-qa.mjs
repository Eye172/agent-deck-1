import {createRequire} from 'node:module';
import {mkdir,writeFile,rm,mkdtemp,readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=path.resolve(new URL('../',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'));
const out=path.join(root,'output');await mkdir(out,{recursive:true});
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE);
if(!process.env.CHROMIUM_PATH)throw Error('CHROMIUM_PATH is required');
const profile=await mkdtemp(path.join(out,'skill-browser-'));
const ctx=await chromium.launchPersistentContext(profile,{headless:true,executablePath:process.env.CHROMIUM_PATH,acceptDownloads:true,viewport:{width:1440,height:1000}});
const page=await ctx.newPage(),errors=[],checks=[],screens=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:4187')+'/#ide',{waitUntil:'networkidle'});
 await page.locator('#download-skill').waitFor();
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  await page.locator('#ide').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.locator('.ide-install').evaluate(el=>el.open=true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
  const clipped=await page.locator('.ide-kit a,.ide-kit td,.ide-kit th').evaluateAll(els=>els.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent));
  assert.deepEqual(clipped,[]);
  const file=path.join(out,'ide-skill-'+width+'.png');await page.screenshot({path:file});screens.push(file);
 }
 checks.push('IDE download and expanded installation guide fit 1440, 768, 390 and 320 px');
 const zipResponse=await page.request.get('http://127.0.0.1:4187/agent-deck-skill.zip');
 assert.equal(zipResponse.status(),200);assert.match(zipResponse.headers()['content-type'],/application\/zip/);
 const zipBytes=await zipResponse.body();
 const expected=createHash('sha256').update(await readFile(path.join(root,'dist/agent-deck-skill.zip'))).digest('hex');
 assert.equal(createHash('sha256').update(zipBytes).digest('hex'),expected);
 const downloadPromise=page.waitForEvent('download');await page.locator('#download-skill').click();const dl=await downloadPromise;
 assert.equal(dl.suggestedFilename(),'agent-deck-skill.zip');await dl.saveAs(path.join(out,'skill-browser-download.zip'));
 const guidePromise=page.waitForEvent('download');await page.getByRole('link',{name:'Full installation guide'}).click();const guide=await guidePromise;
 assert.equal(guide.suggestedFilename(),'agent-deck-install.md');await guide.saveAs(path.join(out,'skill-browser-install.md'));
 assert.match(await readFile(path.join(out,'skill-browser-install.md'),'utf8'),/Claude Code/);
 checks.push('Actual ZIP/guide downloads have intended names, MIME and canonical bytes');
 await page.locator('.ide-install').evaluate(el=>el.open=false);
 await page.getByText('Install in your project',{exact:true}).focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('.ide-install').evaluate(el=>el.open),true);
 checks.push('Installation disclosure is keyboard-operable');
 assert.deepEqual(errors,[]);
 await writeFile(path.join(out,'skill-qa.json'),JSON.stringify({status:'passed',date:'2026-10-09',checks,errors,zip_sha256:expected,screenshots:screens,scope:'Local Chromium UI and downloads; no live IDE discovery or model execution.'},null,2));
 console.log('All '+checks.length+' skill browser checks passed.');
}catch(e){await writeFile(path.join(out,'skill-qa.json'),JSON.stringify({status:'failed',checks,errors,failure:String(e)},null,2));console.error(e);process.exitCode=1;}
finally{await ctx.close();if(!profile.startsWith(out+path.sep))throw Error('Unsafe profile');await rm(profile,{recursive:true,force:true});}
