
let phases = [];
let pendingBase = '';
let lastCopiedIndex = -1;

async function loadMessages() {
  if (sessionStorage.getItem('ttg_auth') !== '1') {
    window.location.href = 'index.html';
    return;
  }
  const res = await fetch('messages.json');
  const data = await res.json();
  phases = data.phases;
  renderProgress();
  renderPhases();
}

function renderProgress() {
  const strip = document.getElementById('progress-strip');
  strip.innerHTML = '';
  phases.forEach((phase, i) => {
    const dot = document.createElement('div');
    dot.className = 'p-step';
    dot.innerHTML = `<div class="p-dot" id="pdot-${i}" title="${phase.title}">${phase.id}</div>`;
    strip.appendChild(dot);
    if (i < phases.length - 1) {
      const line = document.createElement('div');
      line.className = 'p-line';
      line.id = `pline-${i}`;
      strip.appendChild(line);
    }
  });
}

function renderPhases() {
  const container = document.getElementById('phases-container');
  container.innerHTML = '';
  phases.forEach((phase, index) => {
    const card = document.createElement('div');
    card.className = 'phase-card' + (phase.hasOptions ? ' has-options' : '');
    card.id = `card-${index}`;
    const displayMsg = phase.hasOptions ? phase.base : phase.message;

    card.innerHTML = `
      <div class="card-header">
        <span class="phase-num">PHASE ${phase.id}</span>
        <span class="phase-title">${phase.title}</span>
        <span class="tag-badge">${phase.tag}</span>
        <span class="copy-hint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>${phase.hasOptions ? 'Choose & Copy' : 'Click to Copy'}</span>
        </span>
      </div>
      <div class="card-body">
        <p class="message-text">${escapeHtml(displayMsg)}</p>
        ${phase.hasOptions ? `
          <div class="options-notice">
            <span class="opt-chip">Option 1 — 3andek fekra 3ala discord?</span>
            <span class="opt-chip">Option 2 — chnia rayek? investissement walla le?</span>
          </div>` : ''}
      </div>`;

    card.addEventListener('click', () => handleCardClick(phase, index));
    container.appendChild(card);
  });
}

function handleCardClick(phase, index) {
  if (phase.hasOptions) {
    pendingBase = phase.base;
    document.getElementById('base-preview').textContent = phase.base.slice(0, 140) + '...';
    document.getElementById('modal-overlay').classList.remove('hidden');
  } else {
    copyToClipboard(phase.message, index);
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  pendingBase = '';
}

function selectOption(num) {
  const phaseIndex = phases.findIndex(p => p.hasOptions);
  const phase = phases[phaseIndex];
  const fullMsg = phase.base + (num === 1 ? phase.option1 : phase.option2);
  closeModal();
  copyToClipboard(fullMsg, phaseIndex);
}

function copyToClipboard(text, cardIndex) {
  const doAfter = () => {
    showToast();
    flashCard(cardIndex);
    updateProgress(cardIndex);
    lastCopiedIndex = cardIndex;
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

function flashCard(index) {
  const card = document.getElementById(`card-${index}`);
  if (!card) return;
  card.classList.add('copied');
  setTimeout(() => card.classList.remove('copied'), 1800);
}

function updateProgress(index) {
  document.querySelectorAll('.p-dot').forEach((d, i) => {
    d.classList.remove('active', 'done');
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

document.addEventListener('DOMContentLoaded', () => {
  loadMessages();

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('opt1-btn').addEventListener('click', () => selectOption(1));
  document.getElementById('opt2-btn').addEventListener('click', () => selectOption(2));
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('ttg_auth');
    window.location.href = 'index.html';
  });
});
