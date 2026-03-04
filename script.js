let D = {};
let activeSuffix = false, activeX = false, activeY = null, activePfx = null;
let curItem = null, curIdx = null, curSection = null;

async function boot(){
  if(sessionStorage.getItem('ttg_auth')!=='1'){window.location.href='index.html';return;}
  const r = await fetch('messages.json?v='+Date.now());
  D = await r.json();
  buildProgress();
  buildFlowWithPhase3();
  buildSection('qa-cards', D.quickAnswers, 'qa');
  buildSection('info-cards', D.infoMessages, 'info');
  buildSection('pay-cards', D.payments, 'pay');
  buildSection('obj-cards', D.objections, 'obj');
  buildSection('resub-cards', D.resubscription, 'resub');
}

function buildProgress(){
  const s=document.getElementById('progress-strip'); s.innerHTML='';
  D.phases.forEach((p,i)=>{
    const step=document.createElement('div'); step.className='p-step';
    step.innerHTML=`<div class="p-dot" id="pd-${i}" title="${p.title}">${p.id}</div>`;
    s.appendChild(step);
    if(i<D.phases.length-1){const l=document.createElement('div');l.className='p-line';l.id=`pl-${i}`;s.appendChild(l);}
  });
}

function updateProgress(idx){
  document.querySelectorAll('.p-dot').forEach((d,i)=>{
    d.classList.remove('active','done');
    if(i<idx) d.classList.add('done');
    else if(i===idx) d.classList.add('active');
  });
  document.querySelectorAll('.p-line').forEach((l,i)=>l.classList.toggle('done',i<idx));
}

function buildFlowWithPhase3(){
  const c = document.getElementById('flow-cards');
  c.innerHTML = '';
  D.phases.forEach((item, i) => {
    if(item.isVariants){
      const card = document.createElement('div');
      card.className = 'phase-card card-flow'; card.id = `flow-card-${i}`;
      card.innerHTML = `
        <div class="card-header">
          <span class="phase-num num-flow">PHASE 3</span>
          <span class="phase-title">Phase 3 — El Pitch</span>
          <span class="tag-badge">Pitch 🔥</span>
          <span class="copy-hint"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Choose Plan</span></span>
        </div>
        <div class="card-body">
          <p class="message-text" style="color:var(--text-m);font-style:italic;">Click to select a plan and copy 👇</p>
          <div class="chips-row">
            ${D.phase3variants.map(v=>`<span class="chip chip-purple">${v.label} — ${v.tag}</span>`).join('')}
          </div>
        </div>`;
      card.addEventListener('click', () => openPhase3Modal(i));
      c.appendChild(card);
    } else {
      c.appendChild(mkCard(item, i, 'flow'));
    }
  });
  const slot = document.getElementById('phase3-slot');
  if(slot) slot.remove();
}

function buildSection(containerId, items, section){
  const c=document.getElementById(containerId); if(!c) return;
  c.innerHTML='';
  items.forEach((item,i)=>c.appendChild(mkCard(item,i,section)));
}

function mkCard(item,idx,section){
  const card=document.createElement('div');
  card.className=`phase-card card-${section}`; card.id=`${section}-card-${idx}`;
  const numClass=`num-${section==='flow'?(item.id&&item.id.toString().startsWith('PRE')?'pre':'flow'):section}`;
  const label=section==='flow'?`PHASE ${item.id}`:item.id;
  const displayMsg=item.hasOptions?item.base:item.hasPrefix?item.base:item.hasSuffix?(item.base+item.ending):item.isStripe?'Click to select plan and copy 👇':item.message||'Click to configure and copy 👇';
  const hint=item.hasOptions?'Choose & Copy':item.hasPrefix?'Select Prefix':item.hasSuffix?'Configure':item.isStripe?'Select Plan':(item.hasToggleX||item.hasChooseY)?'Configure & Copy':item.hasPrice?'Select Price':'Click to Copy';
  card.innerHTML=`
    <div class="card-header">
      <span class="phase-num ${numClass}">${label}</span>
      <span class="phase-title">${item.title}</span>
      <span class="tag-badge">${item.tag||''}</span>
      <span class="copy-hint"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>${hint}</span></span>
    </div>
    <div class="card-body">
      <p class="message-text">${esc(displayMsg)}</p>
      ${item.hasPrefix?`<div class="chips-row">${item.prefixes.map(p=>`<span class="chip chip-purple">${p}</span>`).join('')}<span class="chip chip-muted">none</span></div>`:''}
      ${item.hasSuffix?`<div class="chips-row"><span class="chip chip-green">Toggle warning</span></div>`:''}
      ${item.isStripe?`<div class="chips-row">${D.stripeVariants.map(v=>`<span class="chip chip-gold">${v.label}</span>`).join('')}</div>`:''}
      ${item.hasPrice?`<div class="chips-row">${item.prices.map(p=>`<span class="chip chip-gold">${p}</span>`).join('')}</div>`:''}
      ${(item.hasToggleX||item.hasChooseY)?`<div class="chips-row"><span class="chip chip-green">Free bonus toggle</span>${item.hasChooseY?'<span class="chip chip-green">Closing question</span>':''}</div>`:''}
    </div>`;
  card.addEventListener('click',()=>{
    if(item.hasOptions)   openOptionsModal(item,idx,section);
    else if(item.hasPrefix) openPrefixModal(item,idx,section);
    else if(item.hasSuffix) openSuffixModal(item,idx,section);
    else if(item.isStripe)  openStripeModal(idx,section);
    else if(item.hasPrice)  openPriceModal(item,idx,section);
    else if(item.hasToggleX||item.hasChooseY) openQAModal(item,idx,section);
    else copy(item.message,`${section}-card-${idx}`,section==='flow'?idx:null);
  });
  return card;
}

function openM(id){ document.getElementById(id).classList.remove('hidden'); }
function closeAll(){
  document.querySelectorAll('.modal-overlay').forEach(m=>m.classList.add('hidden'));
  curItem=null; curIdx=null; curSection=null;
  activeSuffix=false; activeX=false; activeY=null; activePfx=null;
}

function openOptionsModal(item,idx,section){
  curItem=item; curIdx=idx; curSection=section;
  document.getElementById('opt-preview').textContent=item.base.slice(0,140)+'...';
  openM('options-modal');
}
function pickOption(n){
  const msg=curItem.base+(n===1?curItem.option1:curItem.option2);
  closeAll(); copy(msg,`${curSection}-card-${curIdx}`,curIdx);
}

function openPhase3Modal(phaseIdx){
  const wrap=document.getElementById('p3-opts'); wrap.innerHTML='';
  D.phase3variants.forEach((v)=>{
    const b=document.createElement('button'); b.className='opt-btn';
    b.innerHTML=`<span class="opt-label-s">${v.tag}</span><span class="opt-txt">${v.label}</span>`;
    b.onclick=()=>{
      wrap.querySelectorAll('.opt-btn').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
      document.getElementById('p3-preview').textContent=v.message;
      document.getElementById('p3-copy-btn').onclick=()=>{
        closeAll(); copy(v.message,`flow-card-${phaseIdx}`,phaseIdx);
      };
    };
    wrap.appendChild(b);
  });
  openM('phase3-modal');
}


function openStripeModal(idx,section){
  const wrap=document.getElementById('stripe-opts'); wrap.innerHTML='';
  D.stripeVariants.forEach(v=>{
    const b=document.createElement('button'); b.className='opt-btn gold';
    b.innerHTML=`<span class="opt-label-s" style="color:#fbbf24">${v.tag}</span><span class="opt-txt">${v.label}</span>`;
    b.onclick=()=>{closeAll(); copy(v.message,`${section}-card-${idx}`,null);};
    wrap.appendChild(b);
  });
  openM('stripe-modal');
}

function openPriceModal(item,idx,section){
  curItem=item; curIdx=idx; curSection=section;
  const wrap=document.getElementById('price-opts'); wrap.innerHTML='';
  item.prices.forEach(p=>{
    const b=document.createElement('button'); b.className='opt-btn gold';
    b.innerHTML=`<span class="opt-label-s" style="color:#fbbf24">Select</span><span class="opt-txt">💰 ${p}</span>`;
    b.onclick=()=>{const msg=item.base_before+p+item.base_after; closeAll(); copy(msg,`${section}-card-${idx}`,null);};
    wrap.appendChild(b);
  });
  openM('price-modal');
}

function openPrefixModal(item,idx,section){
  curItem=item; curIdx=idx; curSection=section; activePfx=null;
  document.getElementById('pfx-title').textContent=item.title;
  const wrap=document.getElementById('pfx-opts'); wrap.innerHTML='';
  [...item.prefixes,'none'].forEach(pfx=>{
    const b=document.createElement('button'); b.className='opt-btn'; b.dataset.val=pfx;
    b.innerHTML=`<span class="opt-txt">${pfx==='none'?'— No prefix':esc(pfx)}</span>`;
    b.onclick=()=>{
      wrap.querySelectorAll('.opt-btn').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected'); activePfx=pfx; updatePfxPreview();
    };
    wrap.appendChild(b);
  });
  document.getElementById('pfx-preview').textContent=item.base;
  openM('prefix-modal');
}
function updatePfxPreview(){
  if(!curItem) return;
  const msg=activePfx&&activePfx!=='none'? activePfx+' '+curItem.base : curItem.base;
  document.getElementById('pfx-preview').textContent=msg;
}
function doPrefixCopy(){
  if(!curItem) return;
  const msg=activePfx&&activePfx!=='none'? activePfx+' '+curItem.base : curItem.base;
  closeAll(); copy(msg,`${curSection}-card-${curIdx}`,curSection==='flow'?curIdx:null);
}

function openSuffixModal(item,idx,section){
  curItem=item; curIdx=idx; curSection=section; activeSuffix=false;
  document.getElementById('sfx-toggle').classList.remove('on');
  document.getElementById('sfx-toggle').textContent='⚠️ Add confirmation warning — OFF';
  document.getElementById('sfx-preview').textContent=item.base+item.ending;
  openM('suffix-modal');
}
function toggleSuffix(){
  activeSuffix=!activeSuffix;
  const btn=document.getElementById('sfx-toggle');
  btn.classList.toggle('on',activeSuffix);
  btn.textContent=activeSuffix?'⚠️ Add confirmation warning — ON ✅':'⚠️ Add confirmation warning — OFF';
  document.getElementById('sfx-preview').textContent=curItem.base+(activeSuffix?curItem.suffix:'')+curItem.ending;
}
function doSuffixCopy(){
  if(!curItem) return;
  const msg=curItem.base+(activeSuffix?curItem.suffix:'')+curItem.ending;
  closeAll(); copy(msg,`${curSection}-card-${curIdx}`,curSection==='flow'?curIdx:null);
}

function openQAModal(item,idx,section){
  curItem=item; curIdx=idx; curSection=section; activeX=false; activeY=null;
  document.getElementById('qa-modal-title').textContent=item.title;
  const xBtn=document.getElementById('qa-x-btn');
  xBtn.classList.remove('on'); xBtn.textContent='🎁 Free access bonus — OFF';
  const ySection=document.getElementById('qa-y-section');
  if(item.hasChooseY){
    ySection.style.display='block';
    const wrap=document.getElementById('qa-y-opts'); wrap.innerHTML='';
    item.yOptions.forEach(opt=>{
      const b=document.createElement('button'); b.className='opt-btn'; b.dataset.val=opt;
      b.innerHTML=`<span class="opt-txt">${opt==='none'?'— No closing question':esc(opt)}</span>`;
      b.onclick=()=>{
        wrap.querySelectorAll('.opt-btn').forEach(x=>x.classList.remove('selected'));
        b.classList.add('selected'); activeY=opt; updateQAPreview();
      };
      wrap.appendChild(b);
    });
  } else { ySection.style.display='none'; }
  updateQAPreview(); openM('qa-modal');
}
function toggleQAX(){
  activeX=!activeX;
  const btn=document.getElementById('qa-x-btn');
  btn.classList.toggle('on',activeX);
  btn.textContent=activeX?'🎁 Free access bonus — ON ✅':'🎁 Free access bonus — OFF';
  updateQAPreview();
}
function updateQAPreview(){
  if(!curItem) return;
  let msg=curItem.base;
  if(activeX) msg+=curItem.optionalX;
  if(curItem.hasChooseY){ if(activeY&&activeY!=='none') msg+='\n\n'+activeY; }
  else { msg+=curItem.ending; }
  document.getElementById('qa-preview').textContent=msg;
}
function doQACopy(){
  if(!curItem) return;
  let msg=curItem.base;
  if(activeX) msg+=curItem.optionalX;
  if(curItem.hasChooseY){ if(activeY&&activeY!=='none') msg+='\n\n'+activeY; }
  else { msg+=curItem.ending; }
  closeAll(); copy(msg,`${curSection}-card-${curIdx}`,null);
}

function copy(text,cardId,phaseIdx){
  const done=()=>{ toast(); flash(cardId); if(phaseIdx!=null) updateProgress(phaseIdx); };
  if(navigator.clipboard&&window.isSecureContext) navigator.clipboard.writeText(text).then(done).catch(()=>fbCopy(text,done));
  else fbCopy(text,done);
}
function fbCopy(text,cb){
  const ta=document.createElement('textarea');
  ta.value=text; ta.style.cssText='position:fixed;opacity:0;top:0;left:0;';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try{document.execCommand('copy');cb();}catch(e){}
  document.body.removeChild(ta);
}
function flash(id){
  const c=document.getElementById(id); if(!c) return;
  c.classList.add('copied'); setTimeout(()=>c.classList.remove('copied'),1800);
}
let tt;
function toast(){
  const t=document.getElementById('toast'); t.classList.add('show');
  clearTimeout(tt); tt=setTimeout(()=>t.classList.remove('show'),2200);
}
function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function initNavTabs(){
  const tabs=document.querySelectorAll('.nav-tab');
  const sections=document.querySelectorAll('.section-block[id]');
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting) tabs.forEach(t=>t.classList.toggle('active',t.dataset.target===e.target.id));
    });
  },{threshold:0.3});
  sections.forEach(s=>observer.observe(s));
  tabs.forEach(t=>t.addEventListener('click',e=>{
    e.preventDefault();
    document.getElementById(t.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
}

document.addEventListener('DOMContentLoaded',()=>{
  boot().then(()=>initNavTabs());
  document.getElementById('logout-btn').addEventListener('click',()=>{
    sessionStorage.removeItem('ttg_auth'); window.location.href='index.html';
  });
  document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)closeAll();}));
  document.querySelectorAll('.modal-close-btn').forEach(b=>b.addEventListener('click',closeAll));
  document.getElementById('opt1-btn').addEventListener('click',()=>pickOption(1));
  document.getElementById('opt2-btn').addEventListener('click',()=>pickOption(2));
  document.getElementById('pfx-copy-btn').addEventListener('click',doPrefixCopy);
  document.getElementById('sfx-toggle').addEventListener('click',toggleSuffix);
  document.getElementById('sfx-copy-btn').addEventListener('click',doSuffixCopy);
  document.getElementById('qa-x-btn').addEventListener('click',toggleQAX);
  document.getElementById('qa-copy-btn').addEventListener('click',doQACopy);
});
