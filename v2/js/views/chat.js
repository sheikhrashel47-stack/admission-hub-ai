/* JUJU v2 — chat workspace (§6,7,19,28,29): append-only DOM, active-msg-only render */
'use strict';
const Chat={
  id:null, stream:null, live:null, aiShell:null, stepsEl:null,
  list(){return $('#msgs')},
  scroll(){const m=this.list();m.scrollTop=m.scrollHeight},
  clear(){this.list().innerHTML='';this.id=null;S.chat.update({id:null,title:'নতুন চ্যাট',msgs:[]})},
  userNode(text,imgs){
    const w=el('div','msg u');
    w.appendChild(el('div','meta',fmtT()));
    let h=esc(text);
    if(imgs&&imgs.length)h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">'+imgs.map(d=>'<img src="'+d.slice(0,60)+'..." style="width:56px;height:56px;object-fit:cover;border-radius:8px" data-full="1">').join('')+'</div>';
    w.appendChild(el('div','bubble',h));
    if(imgs&&imgs.length){const box=w.querySelector('.bubble');box.innerHTML='';box.appendChild(document.createTextNode(text));imgs.forEach(d=>{const im=el('img');im.src=d;im.style.cssText='width:72px;height:72px;object-fit:cover;border-radius:10px;margin:6px 6px 0 0';im.loading='lazy';box.appendChild(im)})}
    this.list().appendChild(w);this.scroll();return w;
  },
  aiNode(){
    const w=el('div','msg a');
    w.appendChild(el('div','meta','<b>জুজু</b> '+fmtT()));
    const st=el('div','step','💭 ভাবছি…');this.stepsEl=st;w.appendChild(st);
    const dots=el('div','dots','<i></i><i></i><i></i>');w.appendChild(dots);
    const body=el('div','body');w.appendChild(body);
    const acts=el('div','acts');
    const bC=el('button','','কপি');bC.onclick=async()=>{try{await navigator.clipboard.writeText(this.live?this.live.text():'');toast('✓ কপি')}catch(e){}};
    const bR=el('button','','আবার');bR.onclick=()=>{const last=this._lastUser;if(last)this.send(last.text,last.imgs,true)};
    const bS=el('button','','সোর্স');bS.onclick=()=>{if(this._src&&this._src.length){sheetOpen('#shSources');$('#shSources .bd').innerHTML=this._src.map(s=>'<div class="row"><div class="t"><b>'+esc(s.title||s.url)+'</b><small>'+esc(s.url||'')+'</small></div></div>').join('')}else toast('সোর্স নেই')};
    acts.append(bC,bR,bS);w.appendChild(acts);
    this.list().appendChild(w);this.scroll();
    this.live=liveRenderer(body);this.aiShell=w;this._dots=dots;
    this._cyc=['💭 ভাবছি…','🔧 টুল চালাচ্ছি…','📖 সোর্স পড়ছি…','✍️ উত্তর সাজাচ্ছি…'];this._ci=0;
    this._civ=setInterval(()=>{if(st.isConnected&&!this._gotTok)st.textContent=this._cyc[(this._ci++)%4]},2600);LC.add(this._civ);
    return w;
  },
  onSSE(ev){
    if(ev.step&&this.stepsEl){this.stepsEl.textContent=ev.step.startsWith('🔧')||ev.step.startsWith('🔁')||ev.step.startsWith('🧠')?ev.step:({SEARCHING:'🔎 সোর্স খোঁজা হচ্ছে…',READING:'📖 সোর্স পড়া হচ্ছে…',ANALYZING:'🧠 বিশ্লেষণ চলছে…'}[ev.step]||ev.step)}
    if(ev.sources&&ev.sources.length)this._src=ev.sources;
    if(ev.clear&&this.live){this.live.add('')}
    if(ev.token){
      if(!this._gotTok){this._gotTok=true;if(this._dots)this._dots.remove();if(this.stepsEl)this.stepsEl.remove();clearInterval(this._civ)}
      if(this.live)this.live.add(ev.token);
      const m=this.list();if(m.scrollHeight-m.scrollTop-m.clientHeight<220)this.scroll();
    }
    if(ev.done){
      if(this.live)this.live.finish();
      if(this._dots)this._dots.remove();if(this.stepsEl)this.stepsEl.remove();clearInterval(this._civ);
      this.id=ev.id||this.id;S.chat.update({id:this.id});
      this.stream=null;S.chat.set('streaming',false);setSendState(false);
      bus.emit('chatdone',{id:this.id});
    }
  },
  send(text,imgs,replace){
    if(!text&&!imgs)return;
    if(this.stream){this.stream.abort();this.stream=null}
    if(!replace)this.userNode(text,imgs);
    this._lastUser={text,imgs};
    this._gotTok=false;this._src=null;
    this.aiNode();
    S.chat.set('streaming',true);setSendState(true);
    this.stream=chatStream({message:text,images:imgs&&imgs.length?imgs:undefined,id:this.id||undefined,owner:!!S.server.get().sess,model:S.chat.get().model},{});
    this.stream.done.catch(e=>{
      if(this.live)this.live.finish();
      if(e.name!=='AbortError'){const b=this.aiShell&&this.aiShell.querySelector('.body');if(b&&!b.childNodes.length)b.innerHTML='<div class="state" style="color:var(--c-err)">❌ '+esc(String(e.message||e))+'<button class="chip" onclick="Chat.retry()">Retry</button></div>'}
      S.chat.set('streaming',false);setSendState(false);this.stream=null;
    });
  },
  retry(){const l=this._lastUser;if(l)this.send(l.text,l.imgs,true);else toast('আগের মেসেজ নেই')},
  stop(){if(this.stream){this.stream.abort();this.stream=null;S.chat.set('streaming',false);setSendState(false);if(this.live)this.live.finish()}},
  async open(id){
    this.stop();this.list().innerHTML='';this.id=id;S.chat.set('id',id);
    this.list().appendChild(el('div','state','<div class="spin"></div>'));
    try{
      const c=await api('/api/chats/'+id);
      this.list().innerHTML='';
      (c.messages||[]).forEach(m=>{
        if(m.role==='user'){const t=typeof m.content==='string'?m.content:(m.content||[]).filter(p=>p.type==='text').map(p=>p.text).join('\n');this.userNode(t)}
        else if(m.role==='assistant'&&m.content){const w=el('div','msg a');w.appendChild(el('div','meta','<b>জুজু</b> '+fmtT(m.ts)));const b=el('div','body');md(m.content).childNodes.forEach(n=>b.appendChild(n));w.appendChild(b);this.list().appendChild(w)}
      });
      this.scroll();
    }catch(e){this.list().innerHTML='';this.list().appendChild(el('div','state','❌ লোড ব্যর্থ'))}
  }
};
bus.on('sse',ev=>Chat.onSSE(ev));
function setSendState(on){const b=$('#sendB');b.classList.toggle('stop',on);b.innerHTML=on?'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';b.setAttribute('aria-label',on?'থামান':'পাঠান')}
