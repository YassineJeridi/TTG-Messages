
let phases = [];
let objections = [];
let pendingBase = '';
let pendingPriceData = null;

async function loadMessages() {
  if (sessionStorage.getItem('ttg_auth') !== '1') {
    window.location.href = 'index.html';
    return;
  }
  const res = await fetch('messages.json');
  const data = await res.json();
  phases = data.phases;
  objections = data.objections;
  renderProgress();
  renderPhases();
  renderObjections();
}

/* ── Progress ── */
function renderProgress() {
  const strip = document.getElementById('progress-strip');
  strip.innerHTML = '';
  phases.forEach((phase, i) => {
    const step = document.createElement('div');
    step.className = 'p-step';
    step.innerHTML = `<div class="p-dot" id="pdot-${i}" title="${phase.title}">${phase.id}</div>`;
    strip.appendChild(step);
    if (i < phases.length - 1) {
      const line = document.createElement('div');
      line.className = 'p-line';
      line.id = `pline-${i}`;
      strip.appendChild(line);
    }
  });
}

/* ── Phases ── */
function renderPhases() {
  const container = document.getElementById('phases-container');
  container.innerHTML = '';
  phases.forEach((phase, index) => {
    container.appendChild(buildCard(phase, index, 'phase'));
  });
}

/* ── Objections ── */
function renderObjections() {
  const section = document.getElementById('objections-container');
  section.innerHTML = '';

  const heading = document.createElement('div');
  heading.className = 'section-heading';
  heading.innerHTML = `<span>⚡ Objection Handlers</span>`;
  section.appendChild(heading);

  objections.forEach((obj, index) => {
    section.appendChild(buildCard(obj, index, 'objection'));
  });
}

/* ── Card Builder ── */
function buildCard(item, index, type) {
  const card = document.createElement('div');
  const extraClass = item.hasOptions ? ' has-options' : item.hasPrice ? ' has-price' : '';
  card.className = `phase-card${extraClass}`;
  card.id = `${type}-card-${index}`;

  const displayMsg = item.hasOptions
    ? item.base
    : item.hasPrice
      ? `${item.base_before}[ PRICE ]${item.base_after}`
      : item.message;

  const isObj = type === 'objection';

  card.innerHTML = `
    <div class="card-header">
      <span class="phase-num ${isObj ? 'obj-num' : ''}">${isObj ? item.id : 'PHASE ' + item.id}</span>
      <span class="phase-title">${item.title}</span>
      <span class="tag-badge">${item.tag}</span>
      <span class="copy-hint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <span>${item.hasOptions ? 'Choose & Copy' : item.hasPrice ? 'Select Price' : 'Click to Copy'}</span>
      </span>
    </div>
    <div class="card-body">
      <p class="message-text">${escapeHtml(displayMsg)}</p>
      ${item.hasOptions ? `
        <div class="options-notice">
          <span class="opt-chip">Option 1 — 3andek fekra 3ala discord?</span>
          <span class="opt-chip">Option 2 — chnia rayek? investissement walla le?</span>
        </div>` : ''}
      ${item.hasPrice ? `
        <div class="options-notice">
          ${item.prices.map(p => `<span class="opt-chip price-chip">${p}</span>`).join('')}
        </div>` : ''}
    </div>`;

  card.addEventListener('click', () => {
    if (item.hasOptions) {
      pendingBase = item.base;
      document.getElementById('base-preview').textContent = item.base.slice(0, 140) + '...';
      openModal('options-modal');
    } else if (item.hasPrice) {
      pendingPriceData = item;
      renderPriceButtons(item);
      openModal('price-modal');
    } else {
      copyToClipboard(item.message, index, type);
    }
  });

  return card;
}

function renderPriceButtons(item) {
  const wrap = document.getElementById('price-buttons');
  wrap.innerHTML = '';
  item.prices.forEach(price => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn price-opt-btn';
    btn.innerHTML = `<span class="opt-label">Select</span><span class="opt-text price-tag">💰 ${price}</span>`;
    btn.addEventListener('click', () => {
      const fullMsg = item.base_before + price + item.base_after;
      closeAllModals();
      const idx = objections.findIndex(o => o.hasPrice);
      copyToClipboard(fullMsg, idx, 'objection');
    });
    wrap.appendChild(btn);
  });
}

/* ── Modals ── */
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  pendingBase = '';
  pendingPriceData = null;
}

function selectOption(num) {
  const phase = phases.find(p => p.hasOptions);
  const phaseIndex = phases.findIndex(p => p.hasOptions);
  const fullMsg = phase.base + (num === 1 ? phase.option1 : phase.option2);
  closeAllModals();
  copyToClipboard(fullMsg, phaseIndex, 'phase');
}

/* ── Clipboard ── */
function copyToClipboard(text, cardIndex, type) {
  const doAfter = () => {
    showToast();
    flashCard(cardIndex, type);
    if (type === 'phase') updateProgress(cardIndex);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(doAfter).catch(() => fallbackCopy(text, doAfter));
  } else {
    fallbackCopy(text, doAfter);
  }
}

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand('copy'); cb(); } catch(e) {}
  document.body.removeChild(ta);
}

function flashCard(index, type) {
  const card = document.getElementById(`${type}-card-${index}`);
  if (!card) return;
  card.classList.add('copied');
  setTimeout(() => card.classList.remove('copied'), 1800);
}

function updateProgress(index) {
  document.querySelectorAll('.p-dot').forEach((d, i) => {
    d.classList.remove('active','done');
    if (i < index) d.classList.add('done');
    else if (i === index) d.classList.add('active');
  });
  document.querySelectorAll('.p-line').forEach((l, i) => {
    l.classList.toggle('done', i < index);
  });
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

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  loadMessages();

  document.getElementById('opt1-btn').addEventListener('click', () => selectOption(1));
  document.getElementById('opt2-btn').addEventListener('click', () => selectOption(2));
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('ttg_auth');
    window.location.href = 'index.html';
  });

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });
});
