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
function codeBlock(code,lang){
  lang=(lang||'').toLowerCase();
  const lines=code.split('\n').length;
  const cb=el('div','cb'+(lines>300?' col':''));
  const hd=el('div','hd','<span>'+esc(lang||'text')+'</span><span style="color:var(--c-dim2)">'+lines+' লাইন</span><span class="sp"></span>');
  const pre=el('pre');
  const render=()=>{pre.innerHTML='<code>'+hlLite(lines>300&&!cb._full?code.split('\n').slice(0,300).join('\n')+'\n… ('+(lines-300)+' আরো লাইন — expand চাপুন)':code,lang)+'</code>'};
  render();
  const bCopy=el('button','', 'কপি');
  bCopy.onclick=async()=>{try{await navigator.clipboard.writeText(code);bCopy.textContent='✓ কপি';setTimeout(()=>bCopy.textContent='কপি',1500)}catch(e){toast('কপি ব্যর্থ')}};
  const bDl=el('button','','ডাউনলোড');
  bDl.onclick=()=>{const a=el('a');a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));a.download=('juju-'+Date.now().toString(36)+'.'+(LANG_EXT[lang]||'txt'));a.click();LC.add(()=>URL.revokeObjectURL(a.href))};
  const bTog=el('button','',lines>300?'expand':'collapse');
  bTog.onclick=()=>{cb._full=!cb._full;cb.classList.toggle('col',!cb._full&&lines>300);bTog.textContent=(!cb._full&&lines>300)?'expand':'collapse';render()};
  const bFs=el('button','','⤢');
  bFs.onclick=()=>{const w=window.open('','_blank');w.document.write('<pre style="font:13px/1.6 monospace;padding:16px;white-space:pre-wrap">'+esc(code)+'</pre>');w.document.title=lang||'code'};
  hd.append(bCopy,bDl,bTog,bFs);
  cb.append(hd,pre);
  return cb;
}
/* markdown (headings, lists, tables, quotes, code, inline, links, images) */
function md(src){
  src=redactSec(String(src||''));
  const out=el('div','md');
  const parts=src.split(/```/);
  for(let i=0;i<parts.length;i++){
    if(i%2===1){const nl=parts[i].indexOf('\n');const lang=nl>=0?parts[i].slice(0,nl).trim():parts[i].trim();const code=nl>=0?parts[i].slice(nl+1):'';out.appendChild(codeBlock(code.replace(/\n$/,''),lang));continue}
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
    if(/^[-*]\s+/.test(l)||/^\d+[.)]\s+/.test(l)){flushP(para);para=[];const ol=/^\d/.test(l);const ul=el(ol?'ol':'ul');while(i<lines.length&&(/^[-*]\s+/.test(lines[i])||/^\d+[.)]\s+/.test(lines[i]))){ul.appendChild(el('li','',mdInline(lines[i].replace(/^[-*]\s+|^\d+[.)]\s+/,'')));i++}nodes.push(ul);continue}
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
