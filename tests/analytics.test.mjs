import test from 'node:test';
import assert from 'node:assert/strict';
import {validateConfig,mayTrack,eventData,cleanPayload} from '../analytics-policy.mjs';
const config={websiteId:'12345678-1234-1234-1234-123456789abc',scriptUrl:'https://cloud.umami.is/script.js',hostname:'eye172.github.io'},ids=new Set(['react--coding']);
test('analytics activation accepts only the public UUID and the pinned cloud destination',()=>{
 assert.deepEqual(validateConfig(config),config);assert.equal(validateConfig({...config,websiteId:null}).websiteId,null);
 for(const bad of [{websiteId:'<script>'},{websiteId:undefined},{scriptUrl:'https://evil.test/script.js'},{hostname:'localhost'}])assert.throws(()=>validateConfig({...config,...bad}));
});
test('local preview, missing config, privacy signals and opt-out never qualify for tracking',()=>{
 const loc={hostname:config.hostname,protocol:'https:'};assert.equal(mayTrack(config,loc,{}),true);
 for(const [c,l,n,opt] of [[{...config,websiteId:null},loc,{}],[config,{...loc,hostname:'127.0.0.1'},{}],[config,{...loc,protocol:'http:'},{}],[config,loc,{doNotTrack:'1'}],[config,loc,{doNotTrack:'yes'}],[config,loc,{globalPrivacyControl:true}],[config,loc,{},true]])assert.equal(mayTrack(c,l,n,opt),false);
});
test('query/fragment, referrer path, arbitrary props and user IDs are stripped from payloads',()=>{
 const raw={website:config.websiteId,url:'/agent-deck-1/?q=SECRET&preset=react--coding#private',title:'SECRET',referrer:'https://example.org/private?email=SECRET#secret',hostname:'spoof',language:'en-US',screen:'1920x1080',id:'SECRET',data:{email:'SECRET'},name:'preset-open',search:'SECRET',replay:'SECRET'};raw.data.preset='react--coding';
 assert.deepEqual(cleanPayload(raw,config,ids),{website:config.websiteId,hostname:config.hostname,url:'/agent-deck-1/',title:'Agent Deck',language:'en-US',screen:'1920x1080',referrer:'https://example.org',name:'preset-open',data:{preset:'react--coding'}});
});
test('unknown event names, material paths, presets and data formats fail closed',()=>{
 for(const [name,data] of [['signup',{email:'private'}],['preset-open',{preset:'constructor'}],['preset-open',null],['preset-download',{preset:'react--coding',format:'exe'}],['filter-change',{facet:'query',action:'add'}],['compare-open',{count:4}],['research-material-click',{material:'../private.txt'}]])assert.equal(eventData(name,data,ids),null);
 assert.deepEqual(eventData('filter-change',{facet:'category',action:'add',value:'SECRET'},ids),{facet:'category',action:'add'});
 assert.deepEqual(eventData('preset-download',{preset:'react--coding',format:'custom-json',content:'SECRET'},ids),{preset:'react--coding',format:'custom-json'});
});
test('unknown pages, external URLs and website ID mismatches are not sent',()=>{
 for(const url of ['/agent-deck-1/privacy.html','/agent-deck-1/research/paper.html','/other/','https://evil.test/agent-deck-1/'])assert.equal(cleanPayload({website:config.websiteId,url},config,ids),false);
 assert.equal(cleanPayload({website:'bad',url:'/agent-deck-1/'},config,ids),false);
 assert.equal(cleanPayload({website:config.websiteId,url:'/agent-deck-1/',name:'signup'},config,ids),false);
 assert.equal(cleanPayload(null,config,ids),false);
});
test('research overview and local-root fixture can use only canonical clean page paths',()=>{
 assert.equal(cleanPayload({website:config.websiteId,url:'/agent-deck-1/research/index.html?secret=1#notes'},config,ids).title,'Agent Deck research');
 assert.equal(cleanPayload({website:config.websiteId,url:'/?q=secret'},config,ids,'/').url,'/');
});
