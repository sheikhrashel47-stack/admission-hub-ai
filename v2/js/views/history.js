/* JUJU v2 — virtualized history (§26): fixed-row windowing, no full-DOM rebuild */
'use strict';
const Hist={
  items:[],q:'',ROW:66,
  async load(){
    const box=$('#v-history .lst');box.innerHTML='<div class="state"><div class="spin"></div></div>';
    try{
      const j=await api('/api/chats');
      this.items=(Array.isArray(j)?j:j.chats||j.list||[]).slice();
      this.render(box);
    }catch(e){box.innerHTML='<div class="state">❌ লোড ব্যর্থ</div>'}
  },
  filtered(){const q=this.q.trim().toLowerCase();return q?this.items.filter(c=>String(c.title||'').toLowerCase().includes(q)):this.items},
  render(box){
    box.innerHTML='';
    const wrap=el('div');wrap.style.cssText='position:relative;max-width:820px;margin:0 auto';
    const items=this.filtered();
    wrap.style.height=(items.length*this.ROW+20)+'px';
    const win=el('div');win.style.cssText='position:absolute;left:0;right:0';wrap.appendChild(win);
    let lastA=-1,lastB=-1;
    const draw=()=>{
      const st=box.scrollTop,bh=box.clientHeight;
      const a=Math.max(0,Math.floor(st/this.ROW)-6),b=Math.min(items.length,Math.ceil((st+bh)/this.ROW)+6);
      if(a===lastA&&b===lastB)return;lastA=a;lastB=b;
      win.style.top=(a*this.ROW)+'px';win.innerHTML='';
      for(let i=a;i<b;i++){
        const c=items[i];
        const r=el('button','row');r.style.height=(this.ROW-8)+'px';r.style.marginBottom='8px';
        r.innerHTML='<div class="t"><b>'+esc(c.title||'চ্যাট')+'</b><small>'+esc((c.updated||c.ts)?fmtT(c.updated||c.ts):'')+' · '+((c.messages||[]).length||c.n||0)+' মেসেজ</small></div><span class="chip">'+esc((c.model||'').split('·').pop().trim()||'auto')+'</span>';
        r.onclick=()=>{Shell.go('chat');Chat.open(c.id)};
        win.appendChild(r);
      }
    };
    box.appendChild(wrap);
    box.onscroll=draw;draw();
    if(!items.length)box.innerHTML='<div class="state">কোনো চ্যাট নেই — নতুন শুরু করুন</div>';
  },
  search(q){this.q=q;this.render($('#v-history .lst'))}
};
