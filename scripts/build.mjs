import {mkdir,writeFile,copyFile,cp,rm,readFile} from 'node:fs/promises';
import path from 'node:path';
import {buildSkill} from './build-skill.mjs';
import {staticHeaders,securityHeaders} from './security-headers.mjs';
import {fileURLToPath} from 'node:url';
import {catalog,families,blueprint,markdown,sources} from '../src/catalog.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function build(){
 const out=path.resolve(root,'dist');
 if(!out.startsWith(root+path.sep)||path.basename(out)!=='dist')throw new Error('Unsafe build output path');
 await rm(out,{recursive:true,force:true});
 await mkdir(path.join(out,'presets'),{recursive:true});
 await mkdir(path.join(out,'lib'),{recursive:true});
 await mkdir(path.join(out,'assets'),{recursive:true});
 for(const name of ['index.html','styles.css','app.mjs','LICENSE','THIRD_PARTY_NOTICES.md','404.html'])await copyFile(path.join(root,name),path.join(out,name));
 for(const page of ['index.html','404.html']){
  const html=await readFile(path.join(out,page),'utf8');
  const policy=securityHeaders['Content-Security-Policy'].replace(/; frame-ancestors 'none'/,'');
  await writeFile(path.join(out,page),html.replace('<head>','<head>\n<meta http-equiv="Content-Security-Policy" content="'+policy+'">'));
 }
 await cp(path.join(root,'src'),path.join(out,'lib'),{recursive:true});
 await cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
 for(const item of catalog){
  await writeFile(path.join(out,'presets',item.id+'.json'),JSON.stringify(blueprint(item),null,2)+'\n');
  await writeFile(path.join(out,'presets',item.id+'.md'),markdown(item));
 }
 await writeFile(path.join(out,'catalog.json'),JSON.stringify({schema_version:'1.0.0',family_count:families.length,preset_count:catalog.length,presets:catalog.map(item=>blueprint(item))}));
 await writeFile(path.join(out,'sources.json'),JSON.stringify(sources,null,2));
 await writeFile(path.join(out,'_headers'),staticHeaders);
 await writeFile(path.join(out,'.nojekyll'),'');
 await buildSkill(out);
 console.log('Built '+catalog.length+' presets from '+families.length+' families. Output: '+out);
 return out;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
