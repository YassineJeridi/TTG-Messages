
let phases = [];
let pendingBase = '';

async function loadMessages() {
  const res = await fetch('messages.json');
  const data = await res.json();
  phases = data.phases;
  renderPhases();
}

function renderPhases() {
  const container = document.getElementById('phases-container');

  // Progress dots
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.id = 'progress-bar';
  phases.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    dot.id = `dot-${i}`;
    bar.appendChild(dot);
  });
  container.appendChild(bar);

  phases.forEach((phase, index) => {
    const card = document.createElement('div');
    card.className = 'phase-card' + (phase.hasOptions ? ' has-options' : '');
    card.id = `card-${index}`;

    const displayMsg = phase.hasOptions
      ? phase.base
      : phase.message;

    card.innerHTML = `
      <div class="card-header">
        <span class="phase-num">PHASE ${phase.id}</span>
        <span class="phase-title">${phase.title}</span>
        <span class="tag-badge">${phase.tag}</span>
        <span class="copy-hint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>${phase.hasOptions ? 'Choose & Copy' : 'Click to Copy'}</span>
        </span>
      </div>
      <div class="card-body">
        <p class="message-text">${escapeHtml(displayMsg)}</p>
        ${phase.hasOptions ? `
          <div class="options-notice">
            <span class="opt-chip">Option 1: 3andek fekra 3ala discord kifech ykhdem?</span>
            <span class="opt-chip">Option 2: chnia rayek ? investissement walla le ?</span>
          </div>` : ''}
      </div>
    `;

    card.addEventListener('click', () => handleCardClick(phase, index));
    container.appendChild(card);
  });
}

function handleCardClick(phase, index) {
  if (phase.hasOptions) {
    pendingBase = phase.base;
    openModal();
  } else {
    copyToClipboard(phase.message, index);
  }
}

function openModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('base-preview').textContent = pendingBase.slice(0, 120) + '...';
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
  navigator.clipboard.writeText(text).then(() => {
    showToast();
    flashCard(cardIndex);
    activateDot(cardIndex);
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast();
    flashCard(cardIndex);
    activateDot(cardIndex);
  });
}

function flashCard(index) {
  const card = document.getElementById(`card-${index}`);
  if (!card) return;
  card.classList.add('copied');
  setTimeout(() => card.classList.remove('copied'), 1800);
}

function activateDot(index) {
  document.querySelectorAll('.progress-dot').forEach(d => d.classList.remove('active'));
  const dot = document.getElementById(`dot-${index}`);
  if (dot) dot.classList.add('active');
}

let toastTimer;
function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadMessages();
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('opt1-btn').addEventListener('click', () => selectOption(1));
  document.getElementById('opt2-btn').addEventListener('click', () => selectOption(2));
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
});
