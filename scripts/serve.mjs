import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {build} from './build.mjs';
import {securityHeaders} from './security-headers.mjs';
const root=await build();
const port=Number(process.env.PORT||4187);
const mime={'.pdf':'application/pdf','.csv':'text/csv; charset=utf-8','.png':'image/png','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/markdown; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8','.zip':'application/zip','.sha256':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end('Method not allowed');return;}
  const raw=new URL(req.url,'http://localhost').pathname;
  const relative=decodeURIComponent(raw).replace(/^\/+/,'')||'index.html';
  const file=path.resolve(root,relative);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const info=await stat(file);if(!info.isFile())throw new Error('Not a file');
  const data=await readFile(file);
  res.writeHead(200,{'Content-Type':path.basename(file)==='LICENSE'?'text/plain; charset=utf-8':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache',...securityHeaders});
  res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8',...securityHeaders});res.end(req.method==='HEAD'?undefined:await readFile(path.join(root,'404.html')));}
});
server.listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+port));
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
for(const event of ['SIGINT','SIGTERM'])process.on(event,()=>server.close(()=>process.exit(0)));
