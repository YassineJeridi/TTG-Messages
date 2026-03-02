
let phasesData   = [];
let phase3Data   = [];
let qaData       = [];
let objData      = [];

// QA modal state
let currentQA    = null;
let qaXEnabled   = false;
let qaYSelected  = null;

async function loadMessages() {
  if (sessionStorage.getItem('ttg_auth') !== '1') {
    window.location.href = 'index.html'; return;
  }
  const res  = await fetch('messages.json');
  const data = await res.json();
  phasesData = data.phases;
  phase3Data = data.phase3variants;
  qaData     = data.quickAnswers;
  objData    = data.objections;

  renderProgress();
  renderPhases();
  renderPhase3();
  renderQA();
  renderObjections();
}

/* ── Progress ── */
function renderProgress() {
  const strip = document.getElementById('progress-strip');
  strip.innerHTML = '';
  phasesData.forEach((p, i) => {
    const step = document.createElement('div');
    step.className = 'p-step';
    step.innerHTML = `<div class="p-dot" id="pdot-${i}" title="${p.title}">${p.id}</div>`;
    strip.appendChild(step);
    if (i < phasesData.length - 1) {
      const line = document.createElement('div');
      line.className = 'p-line'; line.id = `pline-${i}`;
      strip.appendChild(line);
    }
  });
}

/* ── Main Phases (1,2,4.1,4.2,5,6,7) ── */
function renderPhases() {
  const container = document.getElementById('phases-container');
  container.innerHTML = '';
  // Phase 1 & 2
  [phasesData[0], phasesData[1]].forEach((p, i) => {
    container.appendChild(buildStandardCard(p, i, 'phase'));
  });
}

/* ── Phase 3 — Single Card → Modal ── */
function renderPhase3() {
  const container = document.getElementById('phase3-container');
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'phase-card has-options';
  card.id = 'p3-card-0';
  card.innerHTML = `
    <div class="card-header">
      <span class="phase-num p3-num">PHASE 3</span>
      <span class="phase-title">Phase 3 — El Pitch</span>
      <span class="tag-badge p3-tag">Pitch</span>
      <span class="copy-hint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <span>Choose Plan</span>
      </span>
    </div>
    <div class="card-body">
      <p class="message-text" style="color:var(--muted); font-style:italic;">Click to choose a plan and copy the message 👇</p>
      <div class="options-notice">
        <span class="opt-chip">🥉 Basic — 499DT</span>
        <span class="opt-chip">🥈 Advanced — 699DT</span>
        <span class="opt-chip">👑 Ultimate — 1099DT</span>
      </div>
    </div>`;
  card.addEventListener('click', () => openModal('phase3-modal'));
  container.appendChild(card);

  // Remaining phases after Phase 3
  phasesData.slice(2).forEach((p, i) => {
    container.appendChild(buildStandardCard(p, i + 2, 'phase'));
  });
}

/* ── Quick Answers ── */
function renderQA() {
  const section = document.getElementById('qa-container');
  section.innerHTML = '';
  const heading = document.createElement('div');
  heading.className = 'section-heading qa-heading';
  heading.innerHTML = '<span>💬 Quick Answers</span>';
  section.appendChild(heading);
  qaData.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'phase-card has-options';
    card.id = `qa-card-${i}`;
    card.innerHTML = `
      <div class="card-header">
        <span class="phase-num qa-num">${item.id}</span>
        <span class="phase-title">${item.title}</span>
        <span class="tag-badge qa-tag">${item.tag}</span>
        <span class="copy-hint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>Configure & Copy</span>
        </span>
      </div>
      <div class="card-body">
        <p class="message-text">${escapeHtml(item.base)}</p>
        <div class="options-notice">
          <span class="opt-chip">Toggle free access bonus</span>
          ${item.hasChooseY ? '<span class="opt-chip">Choose closing question</span>' : ''}
        </div>
      </div>`;
    card.addEventListener('click', () => openQAModal(item, i));
    section.appendChild(card);
  });
}

/* ── Objections ── */
function renderObjections() {
  const section = document.getElementById('objections-container');
  section.innerHTML = '';
  const heading = document.createElement('div');
  heading.className = 'section-heading';
  heading.innerHTML = '<span>⚡ Objection Handlers</span>';
  section.appendChild(heading);
  objData.forEach((obj, i) => {
    section.appendChild(buildObjCard(obj, i));
  });
}

/* ── Card Builders ── */
function buildStandardCard(item, index, type) {
  const card = document.createElement('div');
  const extraClass = item.hasOptions ? ' has-options' : '';
  card.className = `phase-card${extraClass}`;
  card.id = `${type}-card-${index}`;
  const displayMsg = item.hasOptions ? item.base : item.message;
  card.innerHTML = `
    <div class="card-header">
      <span class="phase-num">PHASE ${item.id}</span>
      <span class="phase-title">${item.title}</span>
      <span class="tag-badge">${item.tag}</span>
      <span class="copy-hint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <span>${item.hasOptions ? 'Choose & Copy' : 'Click to Copy'}</span>
      </span>
    </div>
    <div class="card-body">
      <p class="message-text">${escapeHtml(displayMsg)}</p>
      ${item.hasOptions ? `
        <div class="options-notice">
          <span class="opt-chip">Option 1 — 3andek fekra 3ala discord?</span>
          <span class="opt-chip">Option 2 — chnia rayek? investissement walla le?</span>
        </div>` : ''}
    </div>`;
  card.addEventListener('click', () => {
    if (item.hasOptions) {
      document.getElementById('base-preview').textContent = item.base.slice(0, 140) + '...';
      openModal('options-modal');
    } else {
      copyToClipboard(item.message, index, type);
    }
  });
  return card;
}

function buildObjCard(item, index) {
  const card = document.createElement('div');
  card.className = 'phase-card' + (item.hasPrice ? ' has-price' : '');
  card.id = `obj-card-${index}`;
  const displayMsg = item.hasPrice
    ? `${item.base_before}[ PRICE ]${item.base_after}`
    : item.message;
  card.innerHTML = `
    <div class="card-header">
      <span class="phase-num obj-num">${item.id}</span>
      <span class="phase-title">${item.title}</span>
      <span class="tag-badge">${item.tag}</span>
      <span class="copy-hint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <span>${item.hasPrice ? 'Select Price' : 'Click to Copy'}</span>
      </span>
    </div>
    <div class="card-body">
      <p class="message-text">${escapeHtml(displayMsg)}</p>
      ${item.hasPrice ? `
        <div class="options-notice">
          ${item.prices.map(p => `<span class="opt-chip price-chip">${p}</span>`).join('')}
        </div>` : ''}
    </div>`;
  card.addEventListener('click', () => {
    if (item.hasPrice) {
      renderPriceButtons(item, index);
      openModal('price-modal');
    } else {
      copyToClipboard(item.message, index, 'obj');
    }
  });
  return card;
}

/* ── QA Modal ── */
function openQAModal(item, index) {
  currentQA  = { item, index };
  qaXEnabled = false;
  qaYSelected = null;

  const modal = document.getElementById('qa-modal');
  modal.querySelector('h3').textContent = item.title;

  // X Toggle
  const xBtn = document.getElementById('qa-x-toggle');
  xBtn.classList.remove('active');
  xBtn.textContent = '🎁 Free access bonus — OFF';
  xBtn.onclick = () => {
    qaXEnabled = !qaXEnabled;
    xBtn.classList.toggle('active', qaXEnabled);
    xBtn.textContent = qaXEnabled
      ? '🎁 Free access bonus — ON ✅'
      : '🎁 Free access bonus — OFF';
    updateQAPreview();
  };

  // Y Options
  const ySection = document.getElementById('qa-y-section');
  if (item.hasChooseY) {
    ySection.style.display = 'block';
    const yWrap = document.getElementById('qa-y-options');
    yWrap.innerHTML = '';
    item.yOptions.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'opt-btn y-opt-btn';
      btn.dataset.value = opt;
      btn.innerHTML = `<span class="opt-text">${opt === 'none' ? '— No closing question' : escapeHtml(opt)}</span>`;
      btn.onclick = () => {
        document.querySelectorAll('.y-opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        qaYSelected = opt;
        updateQAPreview();
      };
      yWrap.appendChild(btn);
    });
  } else {
    ySection.style.display = 'none';
    qaYSelected = null;
  }

  updateQAPreview();
  openModal('qa-modal');
}

function updateQAPreview() {
  if (!currentQA) return;
  const { item } = currentQA;
  let msg = item.base;
  if (qaXEnabled) msg += item.optionalX;
  if (item.hasChooseY) {
    msg += item.discordLine;
    if (qaYSelected && qaYSelected !== 'none') msg += qaYSelected;
  } else {
    msg += item.ending;
  }
  document.getElementById('qa-preview').textContent = msg;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('qa-copy-btn').addEventListener('click', () => {
    if (!currentQA) return;
    const { item, index } = currentQA;
    let msg = item.base;
    if (qaXEnabled) msg += item.optionalX;
    if (item.hasChooseY) {
      msg += item.discordLine;
      if (qaYSelected && qaYSelected !== 'none') msg += qaYSelected;
    } else {
      msg += item.ending;
    }
    closeAllModals();
    copyToClipboard(msg, index, 'qa');
  });
});

/* ── Price Modal ── */
function renderPriceButtons(item, objIndex) {
  const wrap = document.getElementById('price-buttons');
  wrap.innerHTML = '';
  item.prices.forEach(price => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn price-opt-btn';
    btn.innerHTML = `<span class="opt-label">Select</span><span class="opt-text price-tag">💰 ${price}</span>`;
    btn.addEventListener('click', () => {
      const fullMsg = item.base_before + price + item.base_after;
      closeAllModals();
      copyToClipboard(fullMsg, objIndex, 'obj');
    });
    wrap.appendChild(btn);
  });
}

/* ── Options Modal (Phase 4.1) ── */
function selectOption(num) {
  const phase = phasesData.find(p => p.hasOptions);
  const phaseIndex = phasesData.findIndex(p => p.hasOptions);
  const fullMsg = phase.base + (num === 1 ? phase.option1 : phase.option2);
  closeAllModals();
  copyToClipboard(fullMsg, phaseIndex, 'phase');
}

/* ── Modal Utils ── */
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  currentQA = null; qaXEnabled = false; qaYSelected = null;
}

/* ── Clipboard ── */
function copyToClipboard(text, idx, type) {
  const doAfter = () => { showToast(); flashCard(idx, type); };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(doAfter).catch(() => fallbackCopy(text, doAfter));
  } else { fallbackCopy(text, doAfter); }
}

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand('copy'); cb(); } catch(e) {}
  document.body.removeChild(ta);
}

function flashCard(index, type) {
  const id = type === 'phase' ? `phase-card-${index}`
           : type === 'p3'    ? `p3-card-${index}`
           : type === 'qa'    ? `qa-card-${index}`
           : type === 'obj'   ? `obj-card-${index}` : '';
  const card = document.getElementById(id);
  if (!card) return;
  card.classList.add('copied');
  setTimeout(() => card.classList.remove('copied'), 1800);
}

let toastTimer;
function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  loadMessages();

  // Phase 3 plan buttons
  document.querySelectorAll('.p3-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.index);
      closeAllModals();
      copyToClipboard(phase3Data[i].message, 0, 'p3');
    });
  });
  document.getElementById('opt1-btn').addEventListener('click', () => selectOption(1));
  document.getElementById('opt2-btn').addEventListener('click', () => selectOption(2));
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('ttg_auth');
    window.location.href = 'index.html';
  });
  document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', closeAllModals));
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) closeAllModals(); });
  });
});
