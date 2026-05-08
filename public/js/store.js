// Night Store — NIGHT token powered merch shop

const API = 'https://night-markets-94-production.up.railway.app';
const NIGHT_USD = 0.04;

var walletState = { connected: false, demo: false, address: null };
var _nightBalance = 0;
var _cart = [];
var _products = [];
var _selectedProduct = null;
var _selectedSize = null;

// ── Fallback catalog shown while API loads ────────────────────────────
var FALLBACK_PRODUCTS = [
  { id: 'tshirt', emoji: '👕', name: 'Night Markets Tee',    desc: 'Unisex Bella+Canvas 3001',   priceUSD: 32, priceNIGHT: 800,  sizes: ['S','M','L','XL','2XL'], available: true },
  { id: 'hoodie', emoji: '🧥', name: 'Night Markets Hoodie', desc: 'Unisex Gildan 18500 Hoodie', priceUSD: 55, priceNIGHT: 1375, sizes: ['S','M','L','XL','2XL'], available: true },
  { id: 'mug',    emoji: '☕', name: 'Night Markets Mug',    desc: 'White Glossy Ceramic 11oz',  priceUSD: 22, priceNIGHT: 550,  sizes: ['11oz'],                 available: true },
  { id: 'tote',   emoji: '🛍️', name: 'Night Markets Tote',   desc: 'Natural Canvas Tote Bag',    priceUSD: 26, priceNIGHT: 650,  sizes: ['One Size'],             available: true },
  { id: 'cap',    emoji: '🧢', name: 'Night Markets Cap',    desc: 'Classic Dad Cap',            priceUSD: 30, priceNIGHT: 750,  sizes: ['One Size'],             available: true },
];

// ── Wallet ────────────────────────────────────────────────────────────
function handleWalletClick() {
  if (walletState.connected) {
    if (confirm('Disconnect wallet?')) {
      walletState = { connected: false, demo: false, address: null };
      _nightBalance = 0;
      updateWalletUI();
      updateBalanceDisplay();
    }
  } else {
    openModal('ov-wallet');
  }
}

function connectDemo() {
  walletState = {
    connected: true,
    demo: true,
    address: 'mn_addr_demo_' + Math.random().toString(36).slice(2, 10),
  };
  closeModal('ov-wallet');
  _nightBalance = 5000;
  updateWalletUI();
  updateBalanceDisplay();
  toast('Demo mode — 5,000 NIGHT to spend', 'success');
}

function updateWalletUI() {
  var dot = document.getElementById('wallet-dot');
  var lbl = document.getElementById('wallet-label');
  if (!dot || !lbl) return;
  dot.style.background = walletState.connected ? '#00d68f' : '#ef4444';
  lbl.textContent = walletState.connected
    ? (walletState.demo ? '🎭 Demo' : walletState.address.slice(0, 12) + '…')
    : 'Sign in';
}

function updateBalanceDisplay() {
  var el = document.getElementById('night-balance');
  if (!el) return;
  el.textContent = walletState.connected ? (_nightBalance.toLocaleString() + ' NIGHT') : '—';
}

async function loadBalance(address) {
  try {
    var r = await fetch(API + '/api/nightid/action-score/' + encodeURIComponent(address),
      { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return;
    var d = await r.json();
    _nightBalance = Math.max(0, (d.total || 0) - (d.spent || 0));
    updateBalanceDisplay();
  } catch {}
}

// ── Products ──────────────────────────────────────────────────────────
async function loadProducts() {
  _products = FALLBACK_PRODUCTS;
  renderProducts();
  try {
    var r = await fetch(API + '/api/store/products', { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return;
    var d = await r.json();
    if (d.products && d.products.length) {
      _products = d.products;
      renderProducts();
    }
  } catch {}
}

function renderProducts() {
  var grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = _products.map(function(p) {
    return '<div class="product-card" onclick="openProduct(\'' + p.id + '\')">'
      + '<div class="product-emoji">' + p.emoji + '</div>'
      + '<div class="product-name">' + p.name + '</div>'
      + '<div class="product-desc">' + p.desc + '</div>'
      + '<div class="product-price">'
        + '<span class="price-night">' + p.priceNIGHT.toLocaleString() + ' NIGHT</span>'
        + '<span class="price-usd">~$' + p.priceUSD + '</span>'
      + '</div>'
      + '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openProduct(\'' + p.id + '\')">View →</button>'
    + '</div>';
  }).join('');
}

// ── Product detail ────────────────────────────────────────────────────
function openProduct(id) {
  var p = _products.find(function(x) { return x.id === id; });
  if (!p) return;
  _selectedProduct = p;
  _selectedSize = p.sizes.length === 1 ? p.sizes[0] : null;

  var el = document.getElementById('detail-content');
  if (el) {
    el.innerHTML = ''
      + '<div class="detail-emoji">' + p.emoji + '</div>'
      + '<div class="detail-name">' + p.name + '</div>'
      + '<div class="detail-desc">' + p.desc + '</div>'
      + '<div class="detail-price">'
        + '<span class="price-night">' + p.priceNIGHT.toLocaleString() + ' NIGHT</span>'
        + '<span class="price-usd">~$' + p.priceUSD + '</span>'
      + '</div>'
      + '<div class="size-section">'
        + '<div class="size-label">Size</div>'
        + '<div class="size-btns">' + p.sizes.map(function(s) {
            return '<button class="size-btn' + (s === _selectedSize ? ' active' : '') + '" onclick="selectSize(\'' + s + '\')">' + s + '</button>';
          }).join('') + '</div>'
      + '</div>'
      + '<button class="btn btn-primary btn-full btn-lg" onclick="addToCart()">Add to cart</button>';
  }
  openModal('ov-product');
}

function selectSize(s) {
  _selectedSize = s;
  document.querySelectorAll('.size-btn').forEach(function(b) {
    b.classList.toggle('active', b.textContent === s);
  });
}

function addToCart() {
  if (!_selectedProduct) return;
  if (!_selectedSize) { toast('Please select a size', 'error'); return; }
  var existing = _cart.find(function(c) {
    return c.product.id === _selectedProduct.id && c.size === _selectedSize;
  });
  if (existing) {
    existing.qty++;
  } else {
    _cart.push({ product: _selectedProduct, size: _selectedSize, qty: 1 });
  }
  renderCart();
  closeModal('ov-product');
  openCartPanel();
  toast(_selectedProduct.name + ' added to cart', 'success');
}

// ── Cart ──────────────────────────────────────────────────────────────
function openCartPanel() {
  document.getElementById('cart-panel')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
}

function closeCartPanel() {
  document.getElementById('cart-panel')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
}

function renderCart() {
  var items = document.getElementById('cart-items');
  var totalEl = document.getElementById('cart-total');
  var countEl = document.getElementById('cart-count');
  var total = _cart.reduce(function(s, c) { return s + c.product.priceNIGHT * c.qty; }, 0);
  var count = _cart.reduce(function(s, c) { return s + c.qty; }, 0);

  if (countEl) countEl.textContent = count > 0 ? String(count) : '';

  if (!items) return;

  if (_cart.length === 0) {
    items.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
    if (totalEl) totalEl.textContent = '0 NIGHT';
    return;
  }

  items.innerHTML = _cart.map(function(c, i) {
    return '<div class="cart-item">'
      + '<div class="cart-item-icon">' + c.product.emoji + '</div>'
      + '<div class="cart-item-info">'
        + '<div class="cart-item-name">' + c.product.name + '</div>'
        + '<div class="cart-item-size">' + c.size + '</div>'
      + '</div>'
      + '<div class="cart-item-right">'
        + '<div class="cart-item-price">' + (c.product.priceNIGHT * c.qty).toLocaleString() + ' NIGHT</div>'
        + '<div class="cart-item-qty">'
          + '<button onclick="changeQty(' + i + ',-1)">−</button>'
          + '<span>' + c.qty + '</span>'
          + '<button onclick="changeQty(' + i + ',1)">+</button>'
        + '</div>'
      + '</div>'
    + '</div>';
  }).join('');

  if (totalEl) totalEl.textContent = total.toLocaleString() + ' NIGHT';
}

function changeQty(idx, delta) {
  _cart[idx].qty += delta;
  if (_cart[idx].qty <= 0) _cart.splice(idx, 1);
  renderCart();
}

// ── Checkout ──────────────────────────────────────────────────────────
function openCheckout() {
  if (_cart.length === 0) { toast('Cart is empty', 'error'); return; }
  if (!walletState.connected) { openModal('ov-wallet'); return; }

  var nightTotal = _cart.reduce(function(s, c) { return s + c.product.priceNIGHT * c.qty; }, 0);
  var ok = nightTotal <= _nightBalance;

  var el = document.getElementById('checkout-summary');
  if (el) {
    el.innerHTML = '<div class="checkout-items">'
      + _cart.map(function(c) {
          return '<div class="checkout-item">'
            + '<span>' + c.product.emoji + ' ' + c.product.name + ' × ' + c.qty + '</span>'
            + '<span>' + (c.product.priceNIGHT * c.qty).toLocaleString() + ' NIGHT</span>'
          + '</div>';
        }).join('')
      + '</div>'
      + '<div class="checkout-total"><span>Total</span><span>' + nightTotal.toLocaleString() + ' NIGHT</span></div>'
      + '<div class="balance-row' + (ok ? '' : ' insufficient') + '">'
        + 'Your balance: ' + _nightBalance.toLocaleString() + ' NIGHT'
        + (ok ? '' : ' <span class="err-badge">Insufficient</span>')
      + '</div>';
  }

  closeCartPanel();
  openModal('ov-checkout');
}

async function placeOrder() {
  var nightTotal = _cart.reduce(function(s, c) { return s + c.product.priceNIGHT * c.qty; }, 0);
  if (nightTotal > _nightBalance) { toast('Insufficient NIGHT balance', 'error'); return; }

  var name     = (document.getElementById('sh-name')?.value   || '').trim();
  var address1 = (document.getElementById('sh-addr1')?.value  || '').trim();
  var city     = (document.getElementById('sh-city')?.value   || '').trim();
  var country  = (document.getElementById('sh-country')?.value|| '').trim();
  var zip      = (document.getElementById('sh-zip')?.value    || '').trim();

  if (!name || !address1 || !city || !country) {
    toast('Please fill in all required shipping fields', 'error');
    return;
  }

  var btn = document.getElementById('place-order-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Placing order…'; }

  try {
    var r = await fetch(API + '/api/store/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: walletState.address,
        items: _cart.map(function(c) {
          return { productId: c.product.id, size: c.size, qty: c.qty };
        }),
        shipping: { name: name, address1: address1, city: city, countryCode: country, zip: zip },
      }),
      signal: AbortSignal.timeout(30000),
    });

    var d = await r.json();
    if (!r.ok) {
      toast(d.error || 'Order failed', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
      return;
    }

    _nightBalance = d.newBalance;
    updateBalanceDisplay();
    _cart = [];
    renderCart();
    closeModal('ov-checkout');
    showConfirmation(d.orderId, nightTotal);
  } catch {
    toast('Network error — please try again', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
  }
}

function showConfirmation(orderId, nightSpent) {
  var el = document.getElementById('confirm-content');
  if (el) {
    el.innerHTML = '<div class="confirm-icon">🎉</div>'
      + '<div class="confirm-title">Order placed!</div>'
      + '<div class="confirm-sub">Your Night Markets merch is on its way. Printful handles printing and global shipping.</div>'
      + '<div class="confirm-detail">'
        + '<div>Order ID: <strong>#' + orderId + '</strong></div>'
        + '<div>Paid: <strong>' + nightSpent.toLocaleString() + ' NIGHT</strong></div>'
        + '<div>New balance: <strong>' + _nightBalance.toLocaleString() + ' NIGHT</strong></div>'
      + '</div>';
  }
  openModal('ov-confirm');
}

// ── Utilities ─────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

function toast(msg, type) {
  type = type || 'info';
  var wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  var t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(function() { t.remove(); }, 3500);
}

document.addEventListener('DOMContentLoaded', function() {
  updateWalletUI();
  updateBalanceDisplay();
  loadProducts();
  renderCart();
});
