/* JUJU v2 — shell: nav, routing, palette, composer, simple real views */
'use strict';
const Shell={
  go(v){
    S.ui.set('view',v);
    $$('.view').forEach(x=>x.classList.toggle('on',x.id==='v-'+v));
    $$('#nav .nitem').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
    $$('#bnav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
    $('#top .ttl').textContent={chat:'চ্যাট',history:'হিস্টরি',projects:'প্রজেক্ট',files:'ফাইল',tasks:'টাস্ক'}[v]||'জুজু';
    if(v==='history')Hist.load();
    if(v==='files')V.files();
    if(v==='tasks')V.tasks();
    if(v==='projects')V.projects();
  },
  boot(){
    applyTheme(S.ui.get().theme);
    $('#nav').addEventListener('click',e=>{const b=e.target.closest('.nitem');if(b)Shell.go(b.dataset.v)});
    $('#bnav').addEventListener('click',e=>{const b=e.target.closest('button');if(b)Shell.go(b.dataset.v)});
    $('#scrim').onclick=()=>{sheetCloseAll();palClose()};
    /* palette */
    addEventListener('keydown',e=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#pal').classList.contains('on')?palClose():palOpen();return}
      if($('#pal').classList.contains('on')){
        if(e.key==='ArrowDown'){e.preventDefault();palNav(1)}
        else if(e.key==='ArrowUp'){e.preventDefault();palNav(-1)}
        else if(e.key==='Enter'){e.preventDefault();const l=($('#pal .res')._list||[])[palIdx];if(l){palClose();l.run()}}
        else if(e.key==='Escape')palClose();
      } else if(e.key==='Escape'){sheetCloseAll()}
    });
    $('#pal input').addEventListener('input',e=>palRender(e.target.value));
    palAdd('নতুন চ্যাট',()=>{Shell.go('chat');Chat.clear();$('#inp').focus()},'চ্যাট');
    palAdd('হিস্টরি খুলো',()=>Shell.go('history'),'নেভিগেশন');
    palAdd('চ্যাট সার্চ',()=>{Shell.go('history');setTimeout(()=>$('#hsearch').focus(),50)},'চ্যাট');
    palAdd('থিম বদলাও',()=>{const t=S.ui.get().theme==='dark'?'light':'dark';S.ui.set('theme',t);applyTheme(t)},'সেটিংস');
    palAdd('মডেল বাছো',()=>V.models(),'মডেল');
    palAdd('মেমোরি',()=>V.memory(),'টুল');
    palAdd('কানেক্টর',()=>V.connectors(),'সিস্টেম');
    palAdd('সিস্টেম স্ট্যাটাস',()=>V.system(),'সিস্টেম');
    palAdd('অডিট লগ',()=>V.tasks(),'সিস্টেম');
    palAdd('ফাইল',()=>Shell.go('files'),'ফাইল');
    palAdd('ছবি যুক্ত করো',()=>$('#attInp').click(),'ফাইল');
    /* composer */
    const inp=$('#inp');
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();composerSend()}});
    inp.addEventListener('input',()=>{inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,220)+'px'});
    $('#sendB').onclick=()=>{S.chat.get().streaming?Chat.stop():composerSend()};
    $('#attInp').onchange=e=>{[...e.target.files].forEach(f=>attachFile(f));e.target.value=''};
    $('#attB').onclick=()=>$('#attInp').click();
    /* drag-drop (§39) */
    const dz=$('#composer');
    ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drop')}));
    ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drop')}));
    dz.addEventListener('drop',e=>{[...(e.dataTransfer.files||[])].forEach(attachFile)});
    /* conn states (§40) */
    const cb=$('#conn');
    const setConn=(t,on)=>{cb.textContent=t;cb.classList.toggle('on',!!on)};
    addEventListener('offline',()=>setConn('⚠ অফলাইন',true));
    addEventListener('online',()=>setConn('',false));
    /* top actions */
    $('#tNew').onclick=()=>{Shell.go('chat');Chat.clear();$('#inp').focus()};
    $('#tTheme').onclick=()=>{const t=S.ui.get().theme==='dark'?'light':'dark';S.ui.set('theme',t);applyTheme(t)};
    $('#tPal').onclick=palOpen;
    $('#tCtx').onclick=()=>$('#ctx').classList.toggle('on');
    this.go('chat');
    setSendState(false);
  }
};
const ATTS=[];
function attachFile(f){
  if(!f.type.startsWith('image/')){toast('এখন শুধু ছবি সাপোর্টেড (PDF/ভিডিও পরের মাইলস্টনে)');return}
  if(f.size>4*1024*1024){toast('ছবি ৪MB-এর ছোট হতে হবে');return}
  const r=new FileReader();
  r.onload=()=>{ATTS.push(r.result);renderAtts()};
  r.readAsDataURL(f);
}
function renderAtts(){
  const box=$('#atts');box.innerHTML='';
  ATTS.forEach((d,i)=>{const c=el('span','chip');c.style.cssText='display:inline-flex;gap:6px;align-items:center;margin:0 4px 4px 0';c.innerHTML='🖼 ছবি '+(i+1)+' <b style="cursor:pointer" data-i="'+i+'">✕</b>';c.querySelector('b').onclick=()=>{ATTS.splice(i,1);renderAtts()};box.appendChild(c)});
}
function composerSend(){
  const inp=$('#inp');const t=inp.value.trim();
  if(!t&&!ATTS.length)return;
  inp.value='';inp.style.height='auto';
  const imgs=ATTS.slice();ATTS.length=0;renderAtts();
  Shell.go('chat');
  Chat.send(t,imgs);
}
/* simple real-data views (§70 no fake) */
const V={
  async list(view,fn){const box=$('#'+view+' .lst');box.innerHTML='<div class="state"><div class="spin"></div></div>';try{await fn(box)}catch(e){box.innerHTML='<div class="state">❌ '+esc(String(e.message||e))+'</div>'}},
  files(){this.list('v-files',async box=>{const j=await api('/api/files');const fs=Array.isArray(j)?j:j.files||[];box.innerHTML='';if(!fs.length){box.appendChild(el('div','state','ফাইল নেই'));return}fs.slice(0,100).forEach(f=>{const r=el('button','row','<div class="t"><b>'+esc(f.name||f.id||'ফাইল')+'</b><small>'+esc(f.type||'')+' · '+fmtBytes(f.size||0)+'</small></div><span class="chip">'+esc((f.id||'').slice(0,8))+'</span>');r.onclick=()=>window.open(API+'/api/files/'+(f.id||''),'_blank');box.appendChild(r)})})},
  tasks(){this.list('v-tasks',async box=>{const j=await api('/api/audit');const a=Array.isArray(j)?j:j.items||j.log||[];box.innerHTML='';if(!a.length){box.appendChild(el('div','state','কোনো টুল-অ্যাকশন নেই'));return}a.slice(0,80).forEach(x=>{const r=el('div','row','<div class="t"><b>'+esc(x.tool||x.action||'ইভেন্ট')+'</b><small>'+esc(fmtT(x.ts))+' · '+esc(x.ok===false?'ব্যর্থ':x.ok?'সফল':'')+'</small></div>');box.appendChild(r)})})},
  projects(){this.list('v-projects',async box=>{const j=await api('/api/chats');const cs=Array.isArray(j)?j:j.chats||[];const g={};cs.forEach(c=>{const p=c.project||'(প্রজেক্ট নেই)';g[p]=(g[p]||0)+1});box.innerHTML='';Object.entries(g).forEach(([p,n])=>{box.appendChild(el('div','row','<div class="t"><b>'+esc(p)+'</b><small>'+n+' চ্যাট</small></div>'))})})},
  memory(){this.list('v-tasks',async box=>{sheetOpen('#shList');$('#shList .hd b').textContent='মেমোরি';const j=await api('/api/memory');const ms=j.mem||j.notes||j.items||(Array.isArray(j)?j:[]);$('#shList .bd').innerHTML=(ms.length?ms.map(m=>'<div class="row"><div class="t"><b>'+esc(m.text||m)+'</b><small>'+esc(m.kind||'')+'</small></div></div>').join(''):'<div class="state">মেমোরি খালি</div>')})},
  connectors(){sheetOpen('#shList');$('#shList .hd b').textContent='কানেক্টর';this.list2(async()=>{const j=await api('/api/connectors');return(j.list||[]).map(c=>'<div class="row"><div class="t"><b>'+(c.on?'🟢':'⚪')+' '+esc(c.name)+'</b><small>'+esc(c.desc||'')+(c.events?' · '+c.events+' ইভেন্ট':'')+'</small></div><span class="chip">'+(c.on?'চালু':'বন্ধ')+'</span></div>')})},
  models(){sheetOpen('#shList');$('#shList .hd b').textContent='মডেল';this.list2(async()=>{const j=await api('/api/config');return(j.models||[]).map(m=>'<button class="row" data-m="'+esc(m.id||m.model)+'"><div class="t"><b>'+esc(m.label||m.model)+'</b><small>'+esc(m.pid||'')+'</small></div>'+(S.chat.get().model===(m.id||m.model)?'<span class="chip">✓</span>':'')+'</button>')},b=>{b.querySelectorAll('[data-m]').forEach(x=>x.onclick=()=>{S.chat.set('model',x.dataset.m);toast('মডেল: '+x.dataset.m);sheetCloseAll()})})},
  system(){sheetOpen('#shList');$('#shList .hd b').textContent='সিস্টেম';this.list2(async()=>{const s=await api('/api/system');const u=await api('/api/usage').catch(()=>null);const rows=Object.entries(s||{}).slice(0,14).map(([k,v])=>'<div class="row"><div class="t"><b>'+esc(k)+'</b><small>'+esc(typeof v==='object'?JSON.stringify(v).slice(0,80):String(v).slice(0,80))+'</small></div></div>');return rows.concat(u?['<div class="row"><div class="t"><b>usage</b><small>'+esc(JSON.stringify(u).slice(0,120))+'</small></div></div>']:[])})},
  async list2(fn,after){const bd=$('#shList .bd');bd.innerHTML='<div class="state"><div class="spin"></div></div>';try{const html=await fn();bd.innerHTML=html.join('')||'<div class="state">খালি</div>';if(after)after(bd)}catch(e){bd.innerHTML='<div class="state">❌ '+esc(String(e.message||e))+'</div>'}}
};
addEventListener('DOMContentLoaded',()=>Shell.boot());
