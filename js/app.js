// ---------- Utils ----------

/** Formatea número como moneda ARS */
const money = (n) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

/** Persistencia simple en localStorage */
const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// ---------- Estado global ----------
const state = {
  products: [],
  filtered: [],
  cart: storage.get('cart', []), // [{id, name, price, qty, image}]
  buyer: storage.get('buyer', { name: '', email: '', address: '', payment: 'mp' }),
};

// ---------- Referencias DOM ----------
const $productList = document.getElementById('product-list');
const $cartItems = document.getElementById('cart-items');
const $cartTotal = document.getElementById('cart-total');
const $btnClear = document.getElementById('btn-clear');
const $btnCheckout = document.getElementById('btn-checkout');
const $search = document.getElementById('search');
const $sort = document.getElementById('sort');

// Checkout form refs
const $form = document.getElementById('checkout-form');
const $name = document.getElementById('name');
const $email = document.getElementById('email');
const $address = document.getElementById('address');
const $payment = document.getElementById('payment');

// ---------- Carga de datos (JSON) ----------
async function loadProducts() {
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('No se pudo cargar JSON');
    const data = await res.json();
    state.products = data.products;
  } catch (err) {
    // Fallback local si se abre el HTML con file:// y fetch falla
    state.products = [
      { id: 'p1', name: 'Creatina Monohidratada 300g', price: 15999, category: 'Rendimiento', image: 'https://images.unsplash.com/photo-1579722820308-d74e57188f0a?q=80&w=1200&auto=format&fit=crop' },
      { id: 'p2', name: 'Whey Protein 1kg', price: 35999, category: 'Proteína', image: 'https://images.unsplash.com/photo-1567427013953-76c1b5cc3747?q=80&w=1200&auto=format&fit=crop' },
      { id: 'p3', name: 'Omega 3 1200mg (90 caps)', price: 19999, category: 'Salud', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop' },
      { id: 'p4', name: 'Pre-entreno Xtreme 300g', price: 26999, category: 'Energía', image: 'https://images.unsplash.com/photo-1597655601848-bf0b7b898b92?q=80&w=1200&auto=format&fit=crop' },
      { id: 'p5', name: 'Vitamina C 1g (100 tabs)', price: 9999, category: 'Salud', image: 'https://images.unsplash.com/photo-1524594227089-40f207f521a9?q=80&w=1200&auto=format&fit=crop' },
      { id: 'p6', name: 'Magnesio Quelado (100 caps)', price: 13999, category: 'Minerales', image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?q=80&w=1200&auto=format&fit=crop' },
      { id: 'p7', name: 'BCAA 2:1:1 300g', price: 22999, category: 'Recuperación', image: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=1200&auto=format&fit=crop' },
      { id: 'p8', name: 'Multivitamínico (120 caps)', price: 18999, category: 'Salud', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop' }
    ];
  } finally {
    state.filtered = [...state.products];
    renderProducts();
  }
}

// ---------- Renderizado ----------
function renderProducts() {
  $productList.innerHTML = '';
  if (state.filtered.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No hay resultados.';
    empty.className = 'hint';
    $productList.appendChild(empty);
    return;
  }

  const frag = document.createDocumentFragment();
  state.filtered.forEach(p => {
    const item = document.createElement('article');
    item.className = 'card';
    item.setAttribute('role', 'listitem');
    item.innerHTML = `
      <div class="card__media" aria-hidden="true">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="card__body">
        <h3 class="card__title">${p.name}</h3>
        <div class="card__meta">
          <span class="badge">${p.category}</span>
          <span class="price">${money(p.price)}</span>
        </div>
        <div class="card__actions">
          <button class="btn" data-add="${p.id}">Agregar</button>
          <button class="btn btn--ghost" data-info="${p.id}">Info</button>
        </div>
      </div>
    `;
    frag.appendChild(item);
  });
  $productList.appendChild(frag);
}

// Render carrito
function renderCart() {
  $cartItems.innerHTML = '';
  if (state.cart.length === 0) {
    $cartItems.innerHTML = '<p class="hint">Tu carrito está vacío</p>';
  } else {
    const frag = document.createDocumentFragment();
    state.cart.forEach(ci => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.setAttribute('role', 'listitem');
      row.innerHTML = `
        <div class="cart-item__thumb"><img src="${ci.image}" alt=""></div>
        <div class="cart-item__meta">
          <p class="cart-item__title">${ci.name}</p>
          <div class="cart-item__controls">
            <button class="qty-btn" data-dec="${ci.id}">−</button>
            <input class="qty" type="text" value="${ci.qty}" aria-label="Cantidad" readonly />
            <button class="qty-btn" data-inc="${ci.id}">+</button>
            <button class="qty-btn" data-del="${ci.id}" title="Quitar">🗑️</button>
          </div>
        </div>
        <div class="cart-item__price"><strong>${money(ci.price * ci.qty)}</strong></div>
      `;
      frag.appendChild(row);
    });
    $cartItems.appendChild(frag);
  }
  const total = state.cart.reduce((acc, it) => acc + it.price * it.qty, 0);
  $cartTotal.textContent = money(total);
  storage.set('cart', state.cart);
}

// ---------- Lógica de carrito ----------
function addToCart(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  const existing = state.cart.find(x => x.id === id);
  if (existing) existing.qty += 1;
  else state.cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 });
  renderCart();
  Toastify({ text: `${p.name} agregado`, duration: 1800, gravity: 'top', position: 'right' }).showToast();
}

function incQty(id) {
  const it = state.cart.find(x => x.id === id);
  if (!it) return;
  it.qty += 1;
  renderCart();
}

function decQty(id) {
  const it = state.cart.find(x => x.id === id);
  if (!it) return;
  it.qty -= 1;
  if (it.qty <= 0) {
    state.cart = state.cart.filter(x => x.id !== id);
  }
  renderCart();
}

async function delItem(id) {
  const it = state.cart.find(x => x.id === id);
  if (!it) return;
  const res = await Swal.fire({
    title: 'Quitar producto',
    text: `¿Eliminar "${it.name}" del carrito?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, quitar',
    cancelButtonText: 'Cancelar'
  });
  if (res.isConfirmed) {
    state.cart = state.cart.filter(x => x.id !== id);
    renderCart();
    Toastify({ text: 'Producto eliminado', duration: 1500, gravity: 'top', position: 'right' }).showToast();
  }
}

async function clearCart() {
  if (state.cart.length === 0) return;
  const res = await Swal.fire({
    title: 'Vaciar carrito',
    text: '¿Seguro que querés vaciar el carrito?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Vaciar',
    cancelButtonText: 'Cancelar'
  });
  if (res.isConfirmed) {
    state.cart = [];
    renderCart();
  }
}

// ---------- Búsqueda y orden ----------
function applyFilters() {
  const q = $search.value.trim().toLowerCase();
  let arr = [...state.products];
  if (q) {
    arr = arr.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  switch ($sort.value) {
    case 'price_asc': arr.sort((a, b) => a.price - b.price); break;
    case 'price_desc': arr.sort((a, b) => b.price - a.price); break;
    case 'name_asc': arr.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name_desc': arr.sort((a, b) => b.name.localeCompare(a.name)); break;
    default: /* relevancia = sin cambios */ break;
  }
  state.filtered = arr;
  renderProducts();
}

// ---------- Checkout ----------
function prefillForm() {
  $name.value = state.buyer.name || 'Mariano Cejas';
  $email.value = state.buyer.email || 'mariano@example.com';
  $address.value = state.buyer.address || 'Don Torcuato, Buenos Aires';
  $payment.value = state.buyer.payment || 'mp';
}

async function submitCheckout(ev) {
  ev.preventDefault();
  if (state.cart.length === 0) {
    Toastify({ text: 'El carrito está vacío', duration: 1600, gravity: 'top', position: 'right' }).showToast();
    return;
  }

  // Guardar datos del comprador
  state.buyer = {
    name: $name.value.trim(),
    email: $email.value.trim(),
    address: $address.value.trim(),
    payment: $payment.value
  };
  storage.set('buyer', state.buyer);

  // Resumen compra
  const total = state.cart.reduce((acc, it) => acc + it.price * it.qty, 0);
  const html = `
    <ul style="text-align:left;margin:0;padding-left:18px">
      ${state.cart.map(it => `<li>${it.qty}× ${it.name} — <strong>${money(it.price * it.qty)}</strong></li>`).join('')}
    </ul>
    <p style="text-align:left;margin-top:10px">Total: <strong>${money(total)}</strong></p>
    <p style="text-align:left;margin-top:10px">Pagás con: <strong>${payment.options[payment.selectedIndex].text}</strong></p>
  `;

  await Swal.fire({
    title: 'Compra realizada',
    html,
    icon: 'success',
    confirmButtonText: 'Aceptar'
  });

  state.cart = [];
  renderCart();
  // Scroll arriba
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Eventos ----------
$productList.addEventListener('click', (e) => {
  const addId = e.target.dataset.add;
  const infoId = e.target.dataset.info;
  if (addId) addToCart(addId);
  if (infoId) {
    const p = state.products.find(x => x.id === infoId);
    if (p) Swal.fire({ title: p.name, text: `${p.category} — ${money(p.price)}`, imageUrl: p.image, imageWidth: 300 });
  }
});

$cartItems.addEventListener('click', (e) => {
  const inc = e.target.dataset.inc;
  const dec = e.target.dataset.dec;
  const del = e.target.dataset.del;
  if (inc) incQty(inc);
  if (dec) decQty(dec);
  if (del) delItem(del);
});

$btnClear.addEventListener('click', clearCart);
$btnCheckout.addEventListener('click', () => {
  document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
});

$search.addEventListener('input', applyFilters);
$sort.addEventListener('change', applyFilters);

$form.addEventListener('submit', submitCheckout);
$form.addEventListener('reset', () => setTimeout(prefillForm, 0)); // repoblar defaults

// ---------- Init ----------
prefillForm();
renderCart();
loadProducts();
