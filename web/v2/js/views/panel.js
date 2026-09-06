/* JUJU v2 — Contextual right panel (§2,§10,§11,§27,§28): CODE / PREVIEW / FILES / SOURCES */
'use strict';
const Panel={
  mode:null,_cl:[],
  open(){document.body.classList.add('ctxon');$('#ctx').classList.add('on');$('#scrim').classList.add('on')},
  close(){document.body.classList.remove('ctxon');$('#ctx').classList.remove('on');if(!document.querySelector('.sheet.on')&&!$('#pal').classList.contains('on'))$('#scrim').classList.remove('on');Panel._cl.forEach(f=>{try{f()}catch(e){}});Panel._cl=[]},
  setMode(m){
    if(this.mode===m&&$('#ctx').classList.contains('on'))return;
    this.mode=m;this.open();
    $$('#ctx .ptab').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
    $('#ctxBody').innerHTML='';
  },
  /* ---- CODE viewer: virtualized lines (§8) ---- */
  showCode(name,code,lang){
    this.setMode('code');
    const bd=$('#ctxBody');
    const lines=code.split('\n');const LH=19;
    const head=el('div','phead','<b>'+esc(name)+'</b><span class="chip">'+lines.length+' লাইন</span>');
    const bC=el('button','','কপি');bC.onclick=async()=>{try{await navigator.clipboard.writeText(code);bC.textContent='✓'}catch(e){}};
    const bD=el('button','','ডাউনলোড');bD.onclick=()=>{const u=URL.createObjectURL(new Blob([code]));const a=el('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),4000)};
    head.append(bC,bD);bd.appendChild(head);
    const vp=el('div','cvp');const spacer=el('div');spacer.style.height=(lines.length*LH)+'px';
    const win=el('div','cwin');vp.append(spacer,win);bd.appendChild(vp);
    let la=-1,lb=-1;
    const draw=()=>{
      const a=Math.max(0,Math.floor(vp.scrollTop/LH)-8),b=Math.min(lines.length,Math.ceil((vp.scrollTop+vp.clientHeight)/LH)+8);
      if(a===la&&b===lb)return;la=a;lb=b;
      win.style.top=(a*LH)+'px';
      let h='';for(let i=a;i<b;i++)h+='<div class="cl"><span class="ln">'+(i+1)+'</span><code>'+hlLite(lines[i],lang)+'</code></div>';
      win.innerHTML=h;
    };
    vp.onscroll=draw;requestAnimationFrame(draw);
    Panel._cl.push(()=>{vp.onscroll=null});
  },
  /* ---- LIVE PREVIEW (§10,§11): sandboxed iframe, srcdoc, device widths ---- */
  previewFromMsg(cb){
    /* collect web files from the same assistant message */
    const msg=cb.closest('.msg')||document;
    const files={html:'',css:[],js:[]};
    msg.querySelectorAll('.cb').forEach(c=>{
      const l=c._lang,code=c._code;
      if(l==='html'||l==='htm'){if(code.includes('<html')||!files.html)files.html=code}
      else if(l==='css')files.css.push(code);
      else if(l==='js'||l==='javascript'||l==='ts')files.js.push(code);
    });
    if(!files.html&&!files.js.length){toast('প্রিভিউ করার মতো ওয়েব-কোড নেই');return}
    this.showPreview(files);
  },
  showPreview(files){
    this.setMode('preview');
    const bd=$('#ctxBody');
    const doc=files.html||('<!DOCTYPE html><html><head><meta charset="utf-8"></head><body></body></html>');
    const inject=(m)=>{let out=doc;if(files.css.length)out=out.replace('</head>','<style>'+files.css.join('\n')+'</style></head>');if(files.js.length)out=out.replace('</body>','<script>try{'+files.js.join('\n;')+'}catch(e){document.body.insertAdjacentHTML("afterbegin","<pre style=color:red>"+e+"</pre>")}\n<\/script></body>');if(!out.includes('</body>'))out+='<style>'+files.css.join('\n')+'</style><script>try{'+files.js.join('\n;')+'}catch(e){}\n<\/script>';return out};
    let srcdoc=inject();
    const bar=el('div','phead','<b>লাইভ প্রিভিউ</b><span class="sp" style="flex:1"></span>');
    const frameWrap=el('div','pframe');
    const mk=el('iframe');mk.setAttribute('sandbox','allow-scripts allow-modals allow-forms allow-popups');mk.title='লাইভ প্রিভিউ';
    const load=()=>{mk.srcdoc=srcdoc};
    frameWrap.appendChild(mk);
    const dev=(w,label)=>{const b=el('button','',label);b.onclick=()=>{frameWrap.style.maxWidth=w||'100%';load()};return b};
    bar.append(dev('100%','🖥'),dev('768px','📱 ট্যাব'),dev('390px','📱 মোবাইল'));
    const bR=el('button','','⟳ রিফ্রেশ');bR.onclick=load;bar.appendChild(bR);
    const bO=el('button','','↗ খুলুন');bO.onclick=()=>{const u=URL.createObjectURL(new Blob([srcdoc],{type:'text/html'}));window.open(u,'_blank');setTimeout(()=>URL.revokeObjectURL(u),10000)};bar.appendChild(bO);
    const bF=el('button','','⤢');bF.onclick=()=>{frameWrap.classList.toggle('fs')};bar.appendChild(bF);
    bd.append(bar,frameWrap);
    load();
    Panel._cl.push(()=>{mk.srcdoc='';mk.remove()});
  },
  /* ---- FILES (§12,§56) ---- */
  showFiles(items){
    this.setMode('files');
    const bd=$('#ctxBody');
    items.forEach(f=>{
      const r=el('div','row','<div class="t"><b>📄 '+esc(f.name)+'</b><small>'+esc(f.lang||'')+' · '+f.code.split('\n').length+' লাইন</small></div>');
      const b1=el('button','','খুলুন');b1.onclick=()=>Panel.showCode(f.name,f.code,f.lang);
      const b2=el('button','','কপি');b2.onclick=async()=>{try{await navigator.clipboard.writeText(f.code);b2.textContent='✓'}catch(e){}};
      const b3=el('button','','ডাউনলোড');b3.onclick=()=>{const u=URL.createObjectURL(new Blob([f.code]));const a=el('a');a.href=u;a.download=f.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),4000)};
      r.append(b1,b2,b3);bd.appendChild(r);
    });
  },
  /* ---- SOURCES (§27) ---- */
  showSources(src){
    this.setMode('sources');
    const bd=$('#ctxBody');
    (src||[]).forEach(s=>{
      const r=el('a','row');r.href=s.url;r.target='_blank';r.rel='noopener';
      r.innerHTML='<div class="t"><b>'+esc(s.title||s.url)+'</b><small>'+esc(s.url||'')+'</small></div>';
      bd.appendChild(r);
    });
    if(!src||!src.length)bd.appendChild(el('div','state','সোর্স নেই'));
  }
};
