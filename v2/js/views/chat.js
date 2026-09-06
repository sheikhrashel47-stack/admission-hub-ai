/* JUJU v2 — chat workspace (§5,§6,§21-23,§29-33,§52,§55,§56) */
'use strict';
const Chat={
  id:null, stream:null, live:null, aiShell:null, tl:null,
  list(){return $('#msgs')},
  atBottom(){const m=this.list();return m.scrollHeight-m.scrollTop-m.clientHeight<220},
  scroll(){const m=this.list();m.scrollTop=m.scrollHeight},
  clear(){this.list().innerHTML='';this.id=null;S.chat.update({id:null,title:'নতুন চ্যাট',msgs:[]})},
  /* ---------- agent timeline (§21-23): real steps only, collapsible ---------- */
  mkTimeline(){
    const box=el('div','tl');
    const hd=el('button','tlhd','<span class="dot"></span><span class="lbl">এজেন্ট কাজ করছে…</span><span class="cnt"></span>');
    const ul=el('div','tlst');ul.hidden=true;
    hd.onclick=()=>{ul.hidden=!ul.hidden};
    box.append(hd,ul);
    box._steps=[];
    box.push=(label,state)=>{
      const steps=box._steps;
      if(steps.length)steps[steps.length-1].set('✓');
      const row=el('div','tlrow');
      const ico=el('i','','○');const tx=el('span','',esc(label));
      row.append(ico,tx);
      const api={set(s){ico.textContent=s;if(s==='●')ico.className='cur';else ico.className=''},el:row};
      steps.push(api);api.set('●');
      ul.appendChild(row);
      $('.cnt',box).textContent=steps.length+' ধাপ';
      if(!ul.hidden)row.scrollIntoView({block:'nearest'});
    };
    box.finish=(ok)=>{
      box._steps.forEach(s=>s.set('✓'));
      $('.lbl',box).textContent=ok?'কাজ শেষ':'থামানো হয়েছে';
      $('.dot',box).classList.add('done');
    };
    return box;
  },
  userNode(text,imgs){
    const w=el('div','msg u');
    w.appendChild(el('div','meta',fmtT()));
    const bubble=el('div','bubble');
    bubble.appendChild(document.createTextNode(text||''));
    if(imgs&&imgs.length)imgs.forEach(d=>{const im=el('img');im.src=d;im.className='uimg';im.loading='lazy';bubble.appendChild(im)});
    w.appendChild(bubble);
    this.list().appendChild(w);this.scroll();return w;
  },
  aiNode(){
    const w=el('div','msg a');
    w.appendChild(el('div','meta','<b>জুজু</b> '+fmtT()));
    this.tl=this.mkTimeline();w.appendChild(this.tl);
    const dots=el('div','dots','<i></i><i></i><i></i>');w.appendChild(dots);
    const body=el('div','body');w.appendChild(body);
    const acts=el('div','acts');
    const bC=el('button','','কপি');bC.onclick=async()=>{try{await navigator.clipboard.writeText(this.live?this.live.text():body.innerText);bC.textContent='✓';setTimeout(()=>bC.textContent='কপি',1400)}catch(e){toast('কপি ব্যর্থ')}};
    const bR=el('button','','আবার চেষ্টা');bR.onclick=()=>this.retry();
    const bS=el('button','','সোর্স');bS.onclick=()=>{this._src&&this._src.length?Panel.showSources(this._src):toast('সোর্স নেই')};
    const bE=el('button','','এক্সপোর্ট');bE.onclick=()=>exportChat('md');
    acts.append(bC,bR,bS,bE);w.appendChild(acts);
    acts.hidden=true;w._acts=acts;
    this.list().appendChild(w);this.scroll();
    this.live=liveRenderer(body);this.aiShell=w;this._dots=dots;this._gotTok=false;
    return w;
  },
  firstToken(){
    if(this._gotTok)return;this._gotTok=true;
    if(this._dots)this._dots.remove();
  },
  onSSE(ev){
    if(ev.step&&this.tl){
      this.firstToken===null;
      const map={SEARCHING:'সোর্স খোঁজা হচ্ছে',READING:'সোর্স পড়া হচ্ছে',ANALYZING:'বিশ্লেষণ চলছে'};
      const label=map[ev.step]||String(ev.step).replace(/^(🔧|🔁|🧠|🌐|🔎|📖)\s*/,'');
      this.tl.push(label);
      if(/browser|ব্রাউজার/i.test(label))this.tl._steps[this.tl._steps.length-1].el.classList.add('brw');
    }
    if(ev.sources&&ev.sources.length)this._src=ev.sources;
    if(ev.token){
      this.firstToken();
      if(this.live)this.live.add(ev.token);
      if(this.atBottom())this.scroll();else $('#newMsg').classList.add('on');
    }
    if(ev.done){
      if(this.live)this.live.finish();
      this.firstToken();
      if(this._dots)this._dots.remove();
      if(this.tl)this.tl.finish(true);
      this.id=ev.id||this.id;S.chat.update({id:this.id});
      if(this.aiShell){this.aiShell._acts.hidden=false;this.scanFiles(this.aiShell)}
      this.stream=null;S.chat.set('streaming',false);setSendState(false);
      bus.emit('chatdone',{id:this.id});
    }
  },
  /* generated-file cards + preview shortcut (§12,§55,§56) */
  scanFiles(shell){
    const cbs=$$('.cb',shell.querySelector('.body')||shell);
    const named=cbs.filter(c=>c._fname);
    if(!named.length)return;
    const bar=el('div','filebar','📦 <b>'+named.length+' ফাইল তৈরি</b>');
    const bV=el('button','','ফাইল দেখুন');bV.onclick=()=>Panel.showFiles(named.map(c=>({name:c._fname,code:c._code,lang:c._lang})));
    bar.appendChild(bV);
    const web=named.filter(c=>WEB_LANGS[c._lang]);
    if(web.some(c=>c._lang==='html')||web.length>1){
      const bP=el('button','','▶ প্রিভিউ খুলুন');bP.onclick=()=>Panel.previewFromMsg(web[0]);
      bar.appendChild(bP);
    }
    shell.querySelector('.acts').before(bar);
  },
  send(text,imgs,replace){
    if(!text&&!(imgs&&imgs.length))return;
    if(this.stream){this.stream.abort();this.stream=null}
    if(!replace)this.userNode(text,imgs);
    this._lastUser={text,imgs};
    this._src=null;
    this.aiNode();
    S.chat.set('streaming',true);setSendState(true);
    $('#newMsg').classList.remove('on');
    this.stream=chatStream({message:text,images:imgs&&imgs.length?imgs:undefined,id:this.id||undefined,owner:!!S.server.get().sess,model:S.chat.get().model},{});
    this.stream.done.catch(e=>{
      if(this.live)this.live.finish();
      if(this.tl)this.tl.finish(false);
      if(e.name!=='AbortError'){
        const b=this.aiShell&&this.aiShell.querySelector('.body');
        if(b&&!b.childNodes.length){
          b.innerHTML='';
          const err=el('div','err','<b>দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।</b>');
          const det=el('details','','<summary>বিস্তারিত</summary><pre>'+esc(redactSec(String(e&&e.message||e)))+'</pre>');
          const bR=el('button','','আবার চেষ্টা করুন');bR.onclick=()=>this.retry();
          err.append(bR,det);b.appendChild(err);
        }
      }
      if(this.aiShell)this.aiShell._acts.hidden=false;
      S.chat.set('streaming',false);setSendState(false);this.stream=null;
    });
  },
  retry(){const l=this._lastUser;if(l)this.send(l.text,l.imgs,true);else toast('আগের মেসেজ নেই')},
  stop(){if(this.stream){this.stream.abort();this.stream=null;S.chat.set('streaming',false);setSendState(false);if(this.live)this.live.finish();if(this.tl)this.tl.finish(false);if(this.aiShell)this.aiShell._acts.hidden=false}},
  /* ---------- open history: windowed (§30) — last 200, older on demand ---------- */
  async open(id){
    this.stop();this.list().innerHTML='';this.id=id;S.chat.set('id',id);
    this.list().appendChild(el('div','state','<div class="spin"></div>'));
    try{
      const c=await api('/api/chats/'+id);
      const msgs=(c.messages||[]).slice();
      this.list().innerHTML='';
      let start=0;
      const WIN=200;
      const renderFrom=(i)=>{
        msgs.slice(i).forEach(m=>this.renderMsg(m));
      };
      if(msgs.length>WIN){
        start=msgs.length-WIN;
        const bMore=el('button','more','আগের '+(msgs.length-WIN)+' মেসেজ লোড করুন');
        bMore.onclick=()=>{const ns=Math.max(0,start-WIN);msgs.slice(ns,start).forEach(m=>this.renderMsg(m,true));start=ns;if(!start)bMore.remove();else bMore.textContent='আগের '+start+' মেসেজ লোড করুন'};
        this.list().appendChild(bMore);
      }
      renderFrom(start);
      this.scroll();
    }catch(e){this.list().innerHTML='';this.list().appendChild(el('div','state','❌ লোড ব্যর্থ'))}
  },
  renderMsg(m,prepend){
    const list=this.list();
    let w;
    if(m.role==='user'){
      const t=typeof m.content==='string'?m.content:(m.content||[]).filter(p=>p.type==='text').map(p=>p.text).join('\n');
      w=el('div','msg u');w.appendChild(el('div','meta',fmtT(m.ts)));
      const b=el('div','bubble');b.appendChild(document.createTextNode(t));w.appendChild(b);
    }else if(m.role==='assistant'&&m.content){
      w=el('div','msg a');w.appendChild(el('div','meta','<b>জুজু</b> '+fmtT(m.ts)));
      const b=el('div','body');md(m.content).childNodes.forEach(n=>b.appendChild(n));w.appendChild(b);
      const acts=el('div','acts');
      const bC=el('button','','কপি');bC.onclick=async()=>{try{await navigator.clipboard.writeText(m.content);bC.textContent='✓';setTimeout(()=>bC.textContent='কপি',1400)}catch(e){}};
      acts.appendChild(bC);w.appendChild(acts);
      this.scanFiles(w);
    }else return;
    if(prepend){const anchor=list.querySelector('.msg');anchor?list.insertBefore(w,anchor):list.appendChild(w)}
    else list.appendChild(w);
    return w;
  }
};
bus.on('sse',ev=>Chat.onSSE(ev));
function setSendState(on){const b=$('#sendB');b.classList.toggle('stop',on);b.innerHTML=on?'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';b.setAttribute('aria-label',on?'থামান':'পাঠান')}
/* conversation export (§40): MD / TXT / JSON from DOM — real content only */
function exportChat(fmt){
  let out,name;
  const msgs=$$('#msgs .msg').map(w=>({role:w.classList.contains('u')?'user':'assistant',text:(w.querySelector('.bubble,.body')||w).innerText}));
  if(fmt==='json'){out=JSON.stringify({id:Chat.id,exported:new Date().toISOString(),messages:msgs},null,1);name='juju-chat.json'}
  else if(fmt==='txt'){out=msgs.map(m=>(m.role==='user'?'আমি: ':'জুজু: ')+m.text).join('\n\n');name='juju-chat.txt'}
  else{out='# JUJU চ্যাট এক্সপোর্ট\n\n'+msgs.map(m=>(m.role==='user'?'## আমি\n':'## জুজু\n')+m.text).join('\n\n');name='juju-chat.md'}
  const u=URL.createObjectURL(new Blob([out],{type:'text/plain;charset=utf-8'}));
  const a=el('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),4000);
  toast('✓ এক্সপোর্ট হয়েছে');
}
