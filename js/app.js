/* FRIX — Potato Gang loyalty prototype (SQ / EN) */

function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function updatePointsDisplay(value) {
  document.querySelectorAll('#pointsDisplay, #homePoints').forEach(el => {
    el.textContent = value;
  });
}

function drawQR(canvas, text) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cells = 21;
  const cell = Math.floor(size / cells);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;

  ctx.fillStyle = '#111111';
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const isFinder = (r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7);
      const seed = (hash + r * 31 + c * 17) & 0xffff;
      const filled = isFinder ? isFinderPattern(r, c, cells) : seed % 3 !== 0;
      if (filled) ctx.fillRect(c * cell + 1, r * cell + 1, cell - 1, cell - 1);
    }
  }

  // orange finder accents
  ctx.fillStyle = '#FF5A00';
  ctx.fillRect(2 * cell, 2 * cell, 3 * cell, 3 * cell);
  ctx.fillRect((cells - 5) * cell, 2 * cell, 3 * cell, 3 * cell);
  ctx.fillRect(2 * cell, (cells - 5) * cell, 3 * cell, 3 * cell);
}

function isFinderPattern(r, c, cells) {
  if (r < 7 && c < 7) return finderCell(r, c);
  if (r < 7 && c >= cells - 7) return finderCell(r, c - (cells - 7));
  if (r >= cells - 7 && c < 7) return finderCell(r - (cells - 7), c);
  return false;
}

function finderCell(r, c) {
  if (r === 0 || r === 6 || c === 0 || c === 6) return true;
  if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
  return false;
}

function setLangUI(code) {
  window.i18n.setLang(code);
  document.body.dataset.lang = code;
  localStorage.setItem('frix-lang', code);

  document.querySelectorAll('.lang-option').forEach(o => {
    o.classList.toggle('active', o.dataset.lang === code);
  });
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.setLang === code);
  });

  showToast(window.i18n.t('langChanged'));
}

function initLanguage() {
  const saved = localStorage.getItem('frix-lang');
  if (saved && (saved === 'sq' || saved === 'en')) {
    window.i18n.setLang(saved);
    document.body.dataset.lang = saved;
    document.querySelectorAll('.lang-option').forEach(o => {
      o.classList.toggle('active', o.dataset.lang === saved);
    });
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.setLang === saved);
    });
  }

  document.getElementById('langToggle')?.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', () => setLangUI(opt.dataset.lang));
  });

  document.querySelectorAll('[data-set-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLangUI(btn.dataset.setLang));
  });
}

function initCoupons() {
  document.querySelectorAll('.btn-activate').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.coupon-item');
      item?.classList.add('active');
      btn.replaceWith(Object.assign(document.createElement('span'), {
        className: 'coupon-badge',
        textContent: window.i18n.t('activated'),
      }));
      showToast(window.i18n.t('couponActivated'));
    });
  });
}

function initRewards() {
  document.querySelectorAll('.btn-reward-exchange').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.closest('.reward-card')?.querySelector('h3')?.textContent || '';
      showToast(window.i18n.t('redeemSuccess') + ': ' + title);
    });
  });
}

function initScan() {
  const btnScan = document.getElementById('btnSimulateScan');
  const btnPurchase = document.getElementById('btnSimulatePurchase');
  const placeholder = document.getElementById('scannerPlaceholder');
  const success = document.getElementById('scannerSuccess');
  const result = document.getElementById('purchaseResult');
  const steps = document.querySelectorAll('.step');

  if (!btnScan) return;

  btnScan.addEventListener('click', () => {
    btnScan.disabled = true;
    setTimeout(() => {
      placeholder?.classList.add('hidden');
      success?.classList.remove('hidden');
      btnScan.classList.add('hidden');
      btnPurchase?.classList.remove('hidden');
      steps[0]?.classList.add('done');
      steps[1]?.classList.add('active');
      document.getElementById('scanLine')?.classList.add('paused');
    }, 1400);
  });

  btnPurchase?.addEventListener('click', () => {
    btnPurchase.disabled = true;
    const earned = 40;

    steps[1]?.classList.add('done');
    steps[2]?.classList.add('active');
    document.querySelector('.scan-actions')?.classList.add('hidden');
    document.getElementById('scannerViewport')?.classList.add('hidden');
    result?.classList.remove('hidden');
    document.getElementById('earnedPoints').textContent = '+' + earned;
    document.getElementById('purchaseDetail').textContent = '€4.00 · Frix Burger Menu · Prishtina Mall';
    updatePointsDisplay(860 + earned);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.i18n.lang = document.body.dataset.lang || localStorage.getItem('frix-lang') || 'sq';
  window.i18n.apply();

  drawQR(document.getElementById('qrCanvas'), 'FX-POTATO-284719-DEMO');

  initLanguage();
  initCoupons();
  initRewards();
  initScan();
});

window.showToast = showToast;
