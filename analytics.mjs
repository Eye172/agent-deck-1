import config from './analytics-config.mjs';
import {OPT_OUT_KEY,mayTrack,eventData,cleanPayload} from './analytics-policy.mjs';
const presetIds=new Set(config.presetIds),basePath=new URL('./',import.meta.url).pathname;
let ready=false,loading=false,disabled=false;
try{disabled=localStorage.getItem(OPT_OUT_KEY)==='1';}catch{disabled=true;}
const allowed=()=>mayTrack(config,location,navigator,disabled);
// Defense in depth: sanitize both default tracker fields and our custom actions.
window.agentDeckBeforeSend=(type,payload)=>type==='event'&&allowed()?cleanPayload(payload,config,presetIds,basePath):false;
export function track(name,data={}){
 const safe=eventData(name,data,presetIds);if(!ready||!allowed()||safe===null)return;
 try{Promise.resolve(window.umami?.track(name,safe)).catch(()=>{});}catch{}
}
function start(){
 if(ready||loading||!allowed()||location.pathname.endsWith('/privacy.html'))return;
 loading=true;const script=document.createElement('script');script.defer=true;script.src=config.scriptUrl;
 script.dataset.hostUrl='https://gateway.umami.is';script.dataset.websiteId=config.websiteId;script.dataset.domains=config.hostname;
 script.dataset.autoTrack='false';script.dataset.excludeSearch='true';script.dataset.excludeHash='true';script.dataset.doNotTrack='true';script.dataset.beforeSend='agentDeckBeforeSend';
 script.addEventListener('load',()=>{loading=false;ready=!!window.umami?.track;if(ready&&allowed()){try{Promise.resolve(window.umami.track()).catch(()=>{});}catch{}}});
 script.addEventListener('error',()=>{loading=false;});document.head.append(script);
}
function updatePreference(){
 const button=document.getElementById('analytics-toggle'),status=document.getElementById('analytics-status');if(!button||!status)return;
 const privacySignal=!!navigator.globalPrivacyControl||navigator.doNotTrack==='1'||navigator.doNotTrack==='yes';
 button.textContent=disabled?'Allow usage analytics':'Disable usage analytics';button.setAttribute('aria-pressed',String(disabled));
 status.textContent=!config.websiteId?'Analytics has not been activated for this site.':privacySignal?'Analytics is off because your browser requests privacy.':disabled?'Analytics is disabled in this browser.':'Usage analytics is enabled on the published site. Local previews and this privacy page are not tracked.';
}
document.getElementById('analytics-toggle')?.addEventListener('click',()=>{disabled=!disabled;let stored=true;try{localStorage.setItem(OPT_OUT_KEY,disabled?'1':'0');}catch{stored=false;}updatePreference();if(!stored)document.getElementById('analytics-status').textContent+=' Browser storage is unavailable; this preference lasts for this page only.';});
addEventListener('storage',event=>{if(event.key===OPT_OUT_KEY){disabled=event.newValue==='1';updatePreference();start();}});
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href]');if(!link)return;let url;try{url=new URL(link.href);}catch{return;}if(url.origin!==location.origin)return;
 if(url.pathname===basePath+'agent-deck-skill.zip')track('skill-download');
 else if(url.pathname===basePath+'ide-guide.md')track('install-guide-download');
 else if(url.pathname===basePath+'research/index.html')track('research-open');
 else if(url.pathname.startsWith(basePath+'research/'))track('research-material-click',{material:url.pathname.slice((basePath+'research/').length)});
 else if(url.pathname.startsWith(basePath+'presets/')){const file=url.pathname.slice((basePath+'presets/').length);const match=file.match(/^(.+)\.(json|md)$/);if(match)track('preset-download',{preset:match[1],format:match[2]==='md'?'markdown':'json'});}
});
updatePreference();start();
