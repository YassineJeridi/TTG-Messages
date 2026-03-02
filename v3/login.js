
const PASSKEY = 'TTG2026';

document.addEventListener('DOMContentLoaded', () => {
  const form   = document.getElementById('login-form');
  const input  = document.getElementById('passkey-input');
  const errMsg = document.getElementById('login-error');
  const toggle = document.getElementById('toggle-vis');

  if (sessionStorage.getItem('ttg_auth') === '1') {
    window.location.href = 'app.html';
    return;
  }

  toggle.addEventListener('click', () => {
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    toggle.innerHTML = isPass
      ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
           <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
           <line x1="1" y1="1" x2="23" y2="23"/>
         </svg>`
      : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
           <circle cx="12" cy="12" r="3"/>
         </svg>`;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errMsg.textContent = '';
    input.classList.remove('error');

    if (input.value.trim() === PASSKEY) {
      sessionStorage.setItem('ttg_auth', '1');
      window.location.href = 'app.html';
    } else {
      input.classList.add('error');
      errMsg.textContent = 'Passkey incorrecte — réessaye.';
      input.value = '';
      input.focus();
    }
  });
});
