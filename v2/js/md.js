/* JUJU v2 — md renderer + CodeBlock (window-safe, one-click copy §12-13) */
'use strict';
const LANG_EXT={javascript:'js',js:'js',typescript:'ts',ts:'ts',python:'py',py:'py',html:'html',css:'css',json:'json',markdown:'md',md:'md',bash:'sh',sh:'sh',sql:'sql',java:'java',cpp:'cpp',c:'c',go:'go',rust:'rs',php:'php',yaml:'yml',yml:'yml',txt:'txt'};
function hlLite(code,lang){
  const kw={js:/\b(const|let|var|function|return|if|else|for|while|class|new|import|from|export|await|async|try|catch|throw|typeof|null|undefined|true|false)\b/,py:/\b(def|class|return|if|elif|else|for|while|import|from|as|try|except|raise|with|lambda|None|True|False|and|or|not|in|is|pass|yield|async|await)\b/}[lang&&(lang.startsWith('js')||lang==='javascript')?'js':(lang==='python'||lang==='py')?'py':'']||null;
  let h=esc(code);
  h=h.replace(/(#[^\n]*|\/\/[^\n]*)/g,'<i style="color:var(--c-dim2);font-style:normal">$1</i>');
  h=h.replace(/(&quot;[^&\n]*?&quot;|'[^'\n]*'|`[^`\n]*`)/g,'<i style="color:var(--c-ok);font-style:normal">$1</i>');
  if(kw)h=h.replace(kw,'<b style="color:var(--c-acc);font-weight:600">$1</b>');
  return h;
}
const WEB_LANGS={html:1,htm:1,css:1,js:1,javascript:1,jsx:1,ts:1,tsx:1,vue:1,svelte:1};
function codeBlock(code,info){
  info=String(info==null?'':info).trim();
  const seg=info.split(/[\s:]+/);
  let lang=(seg[0]||'').toLowerCase();
  const fname=(seg[1]||'').replace(/[^\w.\-/]/g,'');
  const all=code.split('\n');const n=all.length;
  const cb=el('div','cb');
  cb._code=code;cb._lang=lang;cb._fname=fname;
  const hd=el('div','hd','<span class="lang">'+esc(lang||'text')+'</span>'+(fname?'<span class="fn">'+esc(fname)+'</span>':'')+'<span class="ct">'+n+' লাইন</span><span class="sp"></span>');
  /* body: chunked lazy hydration (§8) — CHUNK lines at a time, never full 10k at once */
  const body=el('div','cbbody');const codeEl=el('code');body.appendChild(codeEl);
  const CHUNK=250;let shown=0;
  const addChunk=()=>{
    const end=Math.min(n,shown+CHUNK);
    let h='';
    for(let i=shown;i<end;i++)h+='<span class="ln">'+(i+1)+'</span>'+hlLite(all[i],lang)+'\n';
    codeEl.insertAdjacentHTML('beforeend',h);
    shown=end;
    if(more)more.remove(),more=null;
    if(shown<n){more=el('button','more','আরো '+(n-shown)+' লাইন দেখান');more.onclick=addChunk;cb.appendChild(more)}
  };
  let more=null;
  addChunk();
  /* actions (§7,§9,§12) */
  const bCopy=el('button','','কপি');
  bCopy.onclick=async()=>{try{await navigator.clipboard.writeText(code);bCopy.textContent='✓ কপি হয়েছে';setTimeout(()=>bCopy.textContent='কপি',1400)}catch(e){toast('কপি ব্যর্থ')}};
  const bDl=el('button','','ডাউনলোড');
  bDl.onclick=()=>{const a=el('a');const u=URL.createObjectURL(new Blob([code],{type:'text/plain'}));a.href=u;a.download=fname||('juju-'+Date.now().toString(36)+'.'+(LANG_EXT[lang]||'txt'));a.click();setTimeout(()=>URL.revokeObjectURL(u),4000)};
  const bOpen=el('button','','প্যানেল');
  bOpen.onclick=()=>Panel.showCode(fname||('code.'+(LANG_EXT[lang]||'txt')),code,lang);
  hd.append(bCopy,bDl,bOpen);
  if(WEB_LANGS[lang]){const bP=el('button','','▶ প্রিভিউ');bP.onclick=()=>Panel.previewFromMsg(cb);hd.appendChild(bP)}
  const bFs=el('button','','⤢');
  bFs.onclick=()=>{const w=window.open('','_blank');w.document.write('<pre style="font:13px/1.6 monospace;padding:16px;white-space:pre-wrap;background:#0E0E12;color:#e8e8ee">'+esc(code)+'</pre>');w.document.title=fname||lang||'code'};
  hd.appendChild(bFs);
  cb.append(hd,body);
  return cb;
}
/* markdown (headings, lists, tables, quotes, code, inline, links, images) */
function md(src){
  src=redactSec(String(src||''));
  const out=el('div','md');
  const parts=src.split(/```/);
  for(let i=0;i<parts.length;i++){
    if(i%2===1){const nl=parts[i].indexOf('\n');const info=nl>=0?parts[i].slice(0,nl).trim():parts[i].trim();const code=nl>=0?parts[i].slice(nl+1):'';out.appendChild(codeBlock(code.replace(/\n$/,''),info));continue}
    const frag=mdInlineBlocks(parts[i]);
    frag.forEach(n=>out.appendChild(n));
  }
  return out;
}
function mdInline(t){
  return esc(t)
    .replace(/`([^`]+)`/g,'<code class="inl">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>')
    .replace(/\*([^*\n]+)\*/g,'<i>$1</i>')
    .replace(/!?\[([^\]]*)\]\((https?:[^)\s]+)\)/g,(m,txt,url)=>m.startsWith('!')?'<img loading="lazy" src="'+url+'" alt="'+txt+'">':'<a href="'+url+'" target="_blank" rel="noopener">'+(txt||url)+'</a>');
}
function mdInlineBlocks(src){
  const nodes=[];const lines=src.split('\n');let i=0;
  const flushP=(buf)=>{if(buf.length){const p=el('p','',mdInline(buf.join('\n')));nodes.push(p)}};
  let para=[];
  while(i<lines.length){
    const l=lines[i];
    if(!l.trim()){flushP(para);para=[];i++;continue}
    const h=l.match(/^(#{1,4})\s+(.*)/);
    if(h){flushP(para);para=[];nodes.push(el('h'+Math.min(3,h[1].length),'',mdInline(h[2])));i++;continue}
    if(/^>\s?/.test(l)){flushP(para);para=[];const buf=[];while(i<lines.length&&/^>\s?/.test(lines[i])){buf.push(lines[i].replace(/^>\s?/,''));i++}nodes.push(el('blockquote','',mdInline(buf.join(' '))));continue}
    if(/^[-*]\s+/.test(l)||/^\d+[.)]\s+/.test(l)){
      flushP(para);para=[];
      const list=/^\d/.test(l)?el('ol'):el('ul');
      const liRe=/^([-*]|\d+[.)])\s+/;
      while(i<lines.length&&liRe.test(lines[i])){
        const li=el('li');li.innerHTML=mdInline(lines[i].replace(liRe,''));list.appendChild(li);i++;
      }
      nodes.push(list);continue;
    }
    if(/^\|/.test(l)&&i+1<lines.length&&/^[\s|:-]+$/.test(lines[i+1])){flushP(para);para=[];const tbl=el('table');const rows=[];while(i<lines.length&&/^\|/.test(lines[i])){rows.push(lines[i].split('|').slice(1,-1).map(c=>c.trim()));i++}const thead=el('thead'),tr=el('tr');rows[0].forEach(c=>tr.appendChild(el('th','',mdInline(c))));thead.appendChild(tr);tbl.appendChild(thead);const tb=el('tbody');rows.slice(2).forEach(r=>{const tr2=el('tr');r.forEach(c=>tr2.appendChild(el('td','',mdInline(c))));tb.appendChild(tr2)});tbl.appendChild(tb);nodes.push(tbl);continue}
    para.push(l);i++;
  }
  flushP(para);
  return nodes;
}
/* live streaming render: text append + throttled md swap (active msg only §29) */
function liveRenderer(bodyEl){
  let buf='',timer=null,done=false;
  const paint=()=>{timer=null;bodyEl.innerHTML='';md(buf).childNodes.forEach(n=>bodyEl.appendChild(n.cloneNode(true)))};
  return{add(t){buf+=t;if(!timer)timer=setTimeout(paint,120)},finish(){if(timer)clearTimeout(timer);buf=buf;done=true;bodyEl.innerHTML='';md(buf).childNodes.forEach(n=>bodyEl.appendChild(n))},text:()=>buf};
}
