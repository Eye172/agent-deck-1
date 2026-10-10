// Only bounded catalogue actions are sent. Free-form user content is never accepted.
export const OPT_OUT_KEY='agent-deck:analytics-disabled';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function validateConfig(config){
 if(!config||config.hostname!=='eye172.github.io'||config.scriptUrl!=='https://cloud.umami.is/script.js')throw new Error('Unsupported analytics destination');
 if(config.websiteId!==null&&!uuid.test(config.websiteId||''))throw new Error('Umami websiteId must be a UUID or null');
 return {websiteId:config.websiteId,scriptUrl:config.scriptUrl,hostname:config.hostname};
}
export function mayTrack(config,location,navigator,optOut=false){
 return !!config.websiteId&&location.protocol==='https:'&&location.hostname===config.hostname&&!optOut&&!navigator.globalPrivacyControl&&navigator.doNotTrack!=='1'&&navigator.doNotTrack!=='yes';
}
const formats=new Set(['json','markdown','custom-json']);
const materials=new Set(['paper.pdf','paper.html','evidence.zip','trials.csv','statistics.json','diagnostics.json','replay.py']);
export function eventData(name,data={},presetIds=new Set()){
 if(!data||typeof data!=='object')return null;
 if(name==='preset-open'&&presetIds.has(data.preset))return {preset:data.preset};
 if(name==='preset-download'&&presetIds.has(data.preset)&&formats.has(data.format))return {preset:data.preset,format:data.format};
 if(name==='filter-change'&&['category','level','scenario','topology'].includes(data.facet)&&['add','remove'].includes(data.action))return {facet:data.facet,action:data.action};
 if(name==='compare-open'&&Number.isInteger(data.count)&&data.count>=2&&data.count<=3)return {count:data.count};
 if(name==='research-material-click'&&materials.has(data.material))return {material:data.material};
 if(['collection-download','skill-download','install-guide-download','research-open'].includes(name))return {};
 return null;
}
export function cleanPayload(payload,config,presetIds,basePath='/agent-deck-1/'){
 if(!payload||payload.website!==config.websiteId)return false;
 let url;try{url=new URL(payload.url,'https://'+config.hostname);}catch{return false;}
 const pages=new Map([[basePath,'Agent Deck'],[basePath+'index.html','Agent Deck'],[basePath+'research/index.html','Agent Deck research']]);
 if(url.hostname!==config.hostname||!pages.has(url.pathname))return false;
 const result={website:config.websiteId,hostname:config.hostname,url:url.pathname,title:pages.get(url.pathname)};
 if(typeof payload.language==='string'&&/^[a-z-]{2,20}$/i.test(payload.language))result.language=payload.language;
 if(typeof payload.screen==='string'&&/^\d{1,5}x\d{1,5}$/.test(payload.screen))result.screen=payload.screen;
 // Keep only the source origin, never its path, search parameters or fragment.
 if(payload.referrer){try{const ref=new URL(payload.referrer);if(['http:','https:'].includes(ref.protocol))result.referrer=ref.origin;}catch{}}
 if(payload.name){const data=eventData(payload.name,payload.data,presetIds);if(data===null)return false;result.name=payload.name;if(Object.keys(data).length)result.data=data;}
 return result;
}
