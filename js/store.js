// ── Night Store — ZK Merch Platform ───────────────────────────

var NST_API = 'http://127.0.0.1:3001';
var _apiReady = null;
async function apiCheck() {
  if (_apiReady !== null) return _apiReady;
  try { await fetch(NST_API + '/health', { signal: AbortSignal.timeout(2000) }); _apiReady = true; } catch { _apiReady = false; }
  return _apiReady;
}
async function apiPost(path, body) {
  const r = await fetch(NST_API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

var PRODUCTS = [
  { id: 'hoodie', icon: '🧥', name: 'Hoodie', basePrice: 42 },
  { id: 'tee',    icon: '👕', name: 'Tee',    basePrice: 22 },
  { id: 'sticker',icon: '🏷️', name: 'Sticker pack', basePrice: 9 },
  { id: 'cap',    icon: '🧢', name: 'Cap',    basePrice: 28 },
  { id: 'tote',   icon: '👜', name: 'Tote bag', basePrice: 18 },
  { id: 'phone',  icon: '📱', name: 'Phone case', basePrice: 15 },
  { id: 'mug',    icon: '☕', name: 'Mug',    basePrice: 16 },
  { id: 'poster', icon: '🖼️', name: 'Poster', basePrice: 12 },
];

var PARTNERS = [
  { icon: '⊘', name: 'Night Markets', status: '✓ Live · 8 products' },
  { icon: '☮️', name: 'Peace Token', status: '✓ Live · 4 products' },
  { icon: '⚔️', name: 'War Token',  status: '✓ Live · 4 products' },
  { icon: '🌙', name: 'NightDoge',  status: '✓ Live · 6 products' },
  { icon: '⚡', name: 'MidnightDAO', status: '⚡ Coming soon' },
  { icon: '🔮', name: 'ZKPunks',    status: '⚡ Coming soon' },
];

var _storeState = JSON.parse(localStorage.getItem('nst_store') || 'null');
var _selectedTemplate = 0;
var walletState = { connected: false, demo: false, address: null };

function saveStore() { localStorage.setItem('nst_store', JSON.stringify(_storeState)); }

function connectDemo() {
  walletState = { connected: true, demo: true, address: 'mn_addr_preprod1' + Math.random().toString(36).slice(2, 14) };
  closeModal('ov-wallet');
  updateWalletUI();
  toast('🎭 Demo mode — no real funds', 'success');
}

function handleWalletClick() {
  if (walletState.connected) {
    if (confirm('Disconnect?')) { walletState = { connected: false, demo: false, address: null }; updateWalletUI(); }
  } else { openModal('ov-wallet'); }
}

function updateWalletUI() {
  const dot = document.getElementById('wallet-dot');
  const lbl = document.getElementById('wallet-label');
  if (!dot || !lbl) return;
  dot.style.background = walletState.connected ? '#00d68f' : '#ef4444';
  lbl.textContent = walletState.connected ? (walletState.demo ? '🎭 Demo' : walletState.address.slice(0, 14) + '…') : 'Sign in';
}

function uploadLogo() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const projectName = document.getElementById('project-name')?.value?.trim() || file.name.replace(/\.[^.]+$/, '');
    const upload = document.getElementById('nst-upload-area');
    if (upload) {
      upload.classList.add('has-file');
      upload.querySelector('.nst-upload-title').textContent = `✓ ${file.name} uploaded`;
      upload.querySelector('.nst-upload-sub').textContent = 'Generating your store…';
    }
    setTimeout(() => generateStore(projectName, URL.createObjectURL(file)), 800);
  };
  input.click();
}

function selectTemplate(idx) {
  _selectedTemplate = idx;
  document.querySelectorAll('.nst-template').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });
}

function generateStore(projectName, logoUrl) {
  toast(`Generating ${projectName} store…`, 'info');
  _storeState = { projectName, logoUrl, totalSales: 0, epochRevenue: 0, claimable: 0, epoch: 0 };
  saveStore();

  setTimeout(() => {
    renderProducts(projectName);
    renderRevenue();
    toast(`✓ ${projectName} store is live — 8 products ready`, 'success');
    const storeSection = document.getElementById('store-live');
    if (storeSection) storeSection.style.display = 'block';
  }, 1200);
}

function renderProducts(name) {
  const grid = document.getElementById('nst-product-grid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="nst-product">
      <div class="nst-product-icon">${p.icon}</div>
      <div class="nst-product-name">${p.name}</div>
      <div class="nst-product-price">from $${p.basePrice}</div>
      <div class="nst-product-preview">${name ? `✓ ${name} logo applied` : ''}</div>
    </div>`).join('');
}

function renderPartners() {
  const grid = document.getElementById('nst-partners-grid');
  if (!grid) return;
  grid.innerHTML = PARTNERS.map(p => `
    <div class="nst-partner">
      <div class="nst-partner-avatar">${p.icon}</div>
      <div><div class="nst-partner-name">${p.name}</div><div class="nst-partner-status">${p.status}</div></div>
    </div>`).join('');
}

function renderRevenue() {
  if (!_storeState) return;
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('rev-total-sales',   _storeState.totalSales);
  set('rev-epoch-revenue', _storeState.epochRevenue.toFixed(2) + ' NIGHT');
  set('rev-claimable',     _storeState.claimable.toFixed(2) + ' NIGHT');
}

async function recordSale() {
  if (!_storeState) { toast('Set up your store first', 'error'); return; }
  const amount = parseFloat(prompt('Sale amount (USD):') || '0');
  if (amount <= 0) return;
  const nightEarned = (amount * 0.5) / 0.04;
  _storeState.totalSales++;
  _storeState.epochRevenue += nightEarned;
  saveStore(); renderRevenue();
  try { await apiPost('/api/nightstore/sale', { amount, storeId: _storeState.projectName }); } catch {}
  toast(`✓ Sale recorded — +${nightEarned.toFixed(2)} NIGHT for holders`, 'success');
}

async function claimRevenue() {
  if (!_storeState || _storeState.claimable <= 0) { toast('No revenue to claim yet', 'info'); return; }
  toast('Claiming revenue from Midnight…', 'info');
  try { await apiPost('/api/nightstore/claim', { address: walletState.address }); } catch {}
  _storeState.claimable = 0; saveStore(); renderRevenue();
  toast('✓ Revenue claimed to your wallet', 'success');
}

async function closeEpoch() {
  if (!_storeState) return;
  toast('Closing epoch…', 'info');
  try { await apiPost('/api/nightstore/close-epoch', { storeId: _storeState.projectName }); } catch {}
  _storeState.claimable += _storeState.epochRevenue;
  _storeState.epochRevenue = 0; _storeState.epoch++;
  saveStore(); renderRevenue();
  toast(`✓ Epoch ${_storeState.epoch} closed — revenue distributed`, 'success');
}

function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

function toast(msg, type = 'info') {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`; t.textContent = msg;
  wrap.appendChild(t); setTimeout(() => t.remove(), 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  updateWalletUI();
  renderPartners();
  renderProducts('');
  if (_storeState) {
    renderRevenue();
    const storeSection = document.getElementById('store-live');
    if (storeSection) storeSection.style.display = 'block';
    renderProducts(_storeState.projectName);
  }
  selectTemplate(0);
});
