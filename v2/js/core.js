/* JUJU v2 — core: store, bus, dom, lifecycle, toast, palette */
'use strict';
const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>[...(r||document).querySelectorAll(s)];
const el=(t,c,h)=>{const n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n};
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const redactSec=t=>String(t==null?'':t).replace(/gh[pousr]_[A-Za-z0-9]{20,}/g,'[REDACTED]').replace(/sk-[A-Za-z0-9_-]{20,}/g,'[REDACTED]').replace(/Bearer\s+[A-Za-z0-9._-]{20,}/g,'Bearer [REDACTED]');
const fmtT=ts=>{const d=ts?new Date(ts):new Date();return d.toLocaleTimeString('bn-BD',{hour:'2-digit',minute:'2-digit'})};
const fmtBytes=n=>n>1048576?(n/1048576).toFixed(1)+' MB':n>1024?(n/1024).toFixed(1)+' KB':n+' B';

/* pub/sub store */
function makeStore(init){let s=init;const subs=new Set();return{get:()=>s,set(p,v){s={...s,[p]:v};subs.forEach(f=>f(s,p))},update(o){s={...s,...o};subs.forEach(f=>f(s))},sub(f){subs.add(f);return()=>subs.delete(f)}}}
const S={
  ui:makeStore({view:'chat',theme:localStorage.getItem('v2theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'),conn:'online',palette:false}),
  chat:makeStore({id:null,title:'নতুন চ্যাট',streaming:false,model:'auto',msgs:[]}),
  server:makeStore({cfg:null,sess:localStorage.getItem('ahai_owner_sess')||''})
};
const bus={m:new Map(),on(k,f){if(!this.m.has(k))this.m.set(k,new Set());this.m.get(k).add(f);return()=>this.m.get(k).delete(f)},emit(k,v){(this.m.get(k)||[]).forEach(f=>{try{f(v)}catch(e){console.warn(k,e)}})}};

/* lifecycle registry — no leaks (§51) */
const LC={items:new Set(),add(x){this.items.add(x);return x},timer(id){const t=setTimeout(()=>this.items.delete(t),id);return t},clear(){this.items.forEach(x=>{try{if(x instanceof AbortController)x.abort();else if(typeof x==='number'){clearTimeout(x);clearInterval(x)}else if(x&&x.disconnect)x.disconnect();else if(typeof x==='function')x()}catch(e){}});this.items.clear()}};
function rafBatch(fn){let q=[],on=false;return v=>{q.push(v);if(!on){on=true;requestAnimationFrame(()=>{const b=q;q=[];on=false;fn(b)})}}}

/* toast (§43) */
function toast(m){const t=el('div','toast',esc(m));$('#toasts').appendChild(t);setTimeout(()=>t.remove(),2400)}

/* theme */
function applyTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem('v2theme',t)}

/* command palette (§5) */
const PAL=[];
function palAdd(label,run,cat){PAL.push({label,run,cat})}
let palIdx=0;
function palOpen(){const p=$('#pal');p.classList.add('on');$('#scrim').classList.add('on');palIdx=0;palRender('');$('#pal input').value='';setTimeout(()=>$('#pal input').focus(),30)}
function palClose(){$('#pal').classList.remove('on');if(!$('.sheet.on'))$('#scrim').classList.remove('on')}
function palRender(q){const box=$('#pal .res');const ql=q.trim().toLowerCase();const list=PAL.filter(x=>!ql||x.label.toLowerCase().includes(ql)).slice(0,12);palIdx=Math.min(palIdx,Math.max(0,list.length-1));box.innerHTML='';list.forEach((x,i)=>{const b=el('button',i===palIdx?'on':'','<span>'+esc(x.cat||'')+'</span><b style="flex:1;font-weight:500">'+esc(x.label)+'</b>');b.onclick=()=>{palClose();x.run()};box.appendChild(b)});box._list=list}
function palNav(d){const box=$('#pal .res');const list=box._list||[];if(!list.length)return;palIdx=(palIdx+d+list.length)%list.length;palRender($('#pal input').value);const on=box.querySelector('.on');if(on)on.scrollIntoView({block:'nearest'})}

/* sheets */
function sheetOpen(id){$(id).classList.add('on');$('#scrim').classList.add('on')}
function sheetCloseAll(){$$('.sheet.on').forEach(s=>s.classList.remove('on'));if(!$('#pal').classList.contains('on'))$('#scrim').classList.remove('on')}

/* api base + auth */
const API=(localStorage.getItem('ahai-api')||'').replace(/\/$/,'');
function authH(){const s=S.server.get().sess;return s?{Authorization:'Bearer '+s}:{}}
async function api(path,opt){const r=await fetch(API+path,Object.assign({headers:Object.assign({'Content-Type':'application/json'},authH(),(opt&&opt.headers)||{})},opt,{body:opt&&opt.body?JSON.stringify(opt.body):undefined}));if(!r.ok)throw new Error('HTTP '+r.status);const ct=r.headers.get('content-type')||'';return ct.includes('json')?r.json():r.text()}
