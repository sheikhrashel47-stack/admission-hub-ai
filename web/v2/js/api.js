/* JUJU v2 — ONE SSE client (§29): parse once, batch tokens via rAF */
'use strict';
function chatStream(body,h){
  const ac=new AbortController();
  LC.add(ac);
  const run=(async()=>{
    const r=await fetch(API+'/api/chat',{method:'POST',signal:ac.signal,headers:Object.assign({'Content-Type':'application/json'},authH()),body:JSON.stringify(Object.assign({stream:true},body))});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const rd=r.body.getReader(),dec=new TextDecoder();let buf='';
    for(;;){
      const {done,value}=await rd.read();
      if(done)break;
      buf+=dec.decode(value,{stream:true});
      let nl;
      while((nl=buf.indexOf('\n'))>=0){
        const line=buf.slice(0,nl).trim();buf=buf.slice(nl+1);
        if(line.startsWith('data: ')){
          let ev;try{ev=JSON.parse(line.slice(6))}catch{continue}
          bus.emit('sse',ev);
        }
      }
    }
  })();
  return{abort:()=>ac.abort(),done:run};
}
