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
    palAdd('ফাইল যুক্ত করো',()=>$('#attInp').click(),'ফাইল');
    palAdd('চ্যাট এক্সপোর্ট (MD)',()=>exportChat('md'),'এক্সপোর্ট');
    palAdd('চ্যাট এক্সপোর্ট (TXT)',()=>exportChat('txt'),'এক্সপোর্ট');
    palAdd('চ্যাট এক্সপোর্ট (JSON)',()=>exportChat('json'),'এক্সপোর্ট');
    palAdd('প্যানেল খোলো/বন্ধ',()=>{$('#ctx').classList.contains('on')?Panel.close():Panel.setMode('code')},'প্যানেল');
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
    /* conn states (§43) */
    const cb=$('#conn');
    const setConn=(t,on)=>{cb.textContent=t;cb.classList.toggle('on',!!on)};
    addEventListener('offline',()=>setConn('⚠ অফলাইন',true));
    addEventListener('online',()=>setConn('',false));
    /* new-message pill (§31) */
    $('#newMsg').onclick=()=>{$('#newMsg').classList.remove('on');Chat.scroll()};
    $('#msgs').addEventListener('scroll',()=>{if(Chat.atBottom())$('#newMsg').classList.remove('on')},{passive:true});
    /* context panel (§27): tabs, close, drag-resize divider */
    $('#ctxClose').onclick=()=>Panel.close();
    $('#ctxTabs').addEventListener('click',e=>{const b=e.target.closest('.ptab');if(!b)return;Panel.setMode(b.dataset.m);$('#ctxBody').innerHTML=b.dataset.m==='files'?'<div class="state" style="padding:24px">এই চ্যাটে তৈরি ফাইলগুলো মেসেজের নিচে "ফাইল দেখুন" থেকে খুলবে।</div>':'<div class="state" style="padding:24px">'+({code:'কোড ব্লকের "প্যানেল" বাটনে ক্লিক করুন।',preview:'ওয়েব-কোডের "▶ প্রিভিউ" বাটনে ক্লিক করুন।',sources:'উত্তরে সোর্স থাকলে "সোর্স" বাটনে দেখা যাবে।'}[b.dataset.m]||'')+'</div>'});
    $('#tCtx').onclick=()=>{$('#ctx').classList.contains('on')?Panel.close():Panel.setMode(Panel.mode||'code')};
    (function(){const dv=$('#ctxDiv');let on=false;
      dv.addEventListener('pointerdown',e=>{on=true;dv.setPointerCapture(e.pointerId)});
      dv.addEventListener('pointermove',e=>{if(!on)return;const w=Math.min(Math.max(innerWidth-e.clientX,280),innerWidth*0.6);document.documentElement.style.setProperty('--ctx-w',w+'px')});
      dv.addEventListener('pointerup',()=>on=false);
    })();
    /* paste images (§15) */
    $('#inp').addEventListener('paste',e=>{const it=[...(e.clipboardData||{}).items||[]].filter(x=>x.kind==='file');it.forEach(x=>{const f=x.getAsFile();if(f)attachFile(f)})});
    /* header model chip (§4) */
    const syncModel=()=>{$('#tModel').textContent=S.chat.get().model||'auto'};
    S.chat.sub(syncModel);syncModel();
    /* mobile keyboard (§44): keep composer above keyboard via visualViewport */
    if(window.visualViewport){
      const vv=window.visualViewport;
      const fix=()=>{const off=Math.max(0,innerHeight-vv.height-($('#bnav').offsetHeight||0));document.documentElement.style.setProperty('--kb',off+'px')};
      vv.addEventListener('resize',fix);vv.addEventListener('scroll',fix);
    }
    /* top actions */
    $('#tNew').onclick=()=>{Shell.go('chat');Chat.clear();$('#inp').focus()};
    $('#tTheme').onclick=()=>{const t=S.ui.get().theme==='dark'?'light':'dark';S.ui.set('theme',t);applyTheme(t)};
    $('#tPal').onclick=palOpen;
    this.go('chat');
    setSendState(false);
  }
};
/* attachments (S13,S14): tray with preview; images->API, text/code->prompt, other->honest notice */
const ATTS=[];
function attachFile(f){
  if(f.size>8*1024*1024){toast('ফাইল ৮MB-এর ছোট হতে হবে');return}
  const a={name:f.name,size:f.size,type:f.type};
  if(f.type.startsWith('image/')){
    const r=new FileReader();r.onload=()=>{a.kind='img';a.data=r.result;ATTS.push(a);renderAtts()};r.readAsDataURL(f);
  }else if(/text|json|javascript|css|html|xml|csv|typescript/.test(f.type)||/\.(txt|md|js|ts|py|json|csv|html|css|sh|yml|yaml|log|xml)$/i.test(f.name)){
    const r=new FileReader();r.onload=()=>{a.kind='text';a.text=String(r.result).slice(0,200000);ATTS.push(a);renderAtts()};r.readAsText(f);
  }else{
    a.kind='file';ATTS.push(a);renderAtts();
    toast('এই ধরনের ফাইল এখন পাঠানো যায় না — শুধু দেখানো হলো (ব্যাকএন্ড সীমা)');
  }
}
function renderAtts(){
  const box=$('#atts');box.innerHTML='';
  ATTS.forEach((a,i)=>{
    const c=el('div','att');
    if(a.kind==='img')c.innerHTML='<img src="'+a.data+'" alt="">';
    else c.innerHTML='<span class="fico">'+(a.kind==='text'?'📝':'📎')+'</span>';
    c.insertAdjacentHTML('beforeend','<div class="ai"><b>'+esc(a.name)+'</b><small>'+fmtBytes(a.size)+'</small></div>');
    const x=el('button','','✕');x.setAttribute('aria-label','সরান');x.onclick=()=>{ATTS.splice(i,1);renderAtts()};
    c.appendChild(x);box.appendChild(c);
  });
}
function composerSend(){
  const inp=$('#inp');let t=inp.value.trim();
  const imgs=ATTS.filter(a=>a.kind==='img').map(a=>a.data);
  const texts=ATTS.filter(a=>a.kind==='text');
  const skipped=ATTS.filter(a=>a.kind==='file').length;
  if(!t&&!imgs.length&&!texts.length){if(skipped)toast('পাঠানোর মতো কিছু নেই');return}
  texts.forEach(a=>{t+='\n\n📎 '+a.name+':\n```\n'+a.text.slice(0,60000)+'\n```'});
  inp.value='';inp.style.height='auto';
  ATTS.length=0;renderAtts();
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
